# Live ClientExec KB Topics on /support — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded "Popular help topics" links on `/support` with live links to the lead article of each ClientExec knowledge-base category, each opening in a new tab.

**Architecture:** A pure parser (`parseKbTopics`) extracts the first article anchor from each `knowledge-base-box` in the KB main page HTML. A server helper (`getPopularKbTopics`) fetches that page (cached daily), parses it, and falls back to a hardcoded list of real KB links on any failure. The `/support` server component becomes `async` and renders the result as external anchors. All ClientExec access stays server-side in `lib/clientexec.ts`.

**Tech Stack:** Next.js (server components), TypeScript, Vitest. No new dependencies (HTML parsed with a scoped regex).

## Global Constraints

- ClientExec access lives only in `lib/clientexec.ts` and is never imported from client components (header comment: "Do not import from client components").
- `CE_URL` is the existing module const: `process.env.CLIENTEXEC_URL ?? "https://go.serverizz.com"`.
- External links use exactly `target="_blank" rel="noopener noreferrer"`.
- KB main URL: `${CE_URL}/index.php?fuse=knowledgebase&controller=articles&view=main`.
- Article anchor href shape (literal `&`, absolute URL): `https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=N`.
- The four category-lead fallback articles (title → articleId): Types of Domain Names → 22, Where to Find Email Tools → 10, Opening WP Toolkit → 42, Understanding the File Structure → 1.
- Tests follow `lib/clientexec.test.ts`: Vitest, `vi.stubGlobal("fetch", …)`, `afterEach(() => vi.unstubAllGlobals())`.

---

### Task 1: KB topic parser + fallback (pure functions in `lib/clientexec.ts`)

**Files:**
- Modify: `lib/clientexec.ts` (append after the existing `getTldPricing` export)
- Test: `lib/clientexec.test.ts` (append new `describe` blocks)

**Interfaces:**
- Consumes: existing `CE_URL` const in `lib/clientexec.ts`.
- Produces:
  - `export type KbTopic = { title: string; href: string };`
  - `export function parseKbTopics(html: string): KbTopic[];` — first article anchor per `knowledge-base-box`, in document order.
  - `export const KB_FALLBACK_TOPICS: KbTopic[];` — the four category leads.

- [ ] **Step 1: Write the failing tests**

Append to `lib/clientexec.test.ts`:

```ts
import { parseKbTopics, KB_FALLBACK_TOPICS } from "@/lib/clientexec";

const KB_HTML = `
<div class="col"><div class="knowledge-base-box">
  <h4><a href="index.php?fuse=knowledgebase&controller=articles&view=main&categoryId=9">Managing Domains in cPanel (10)</a></h4>
  <ul class="knowledge-box-ul cm-height">
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=22">Types of Domain Names</a></li>
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=23">Connecting to SERVERIZZ</a></li>
  </ul>
</div></div>
<div class="col"><div class="knowledge-base-box">
  <h4><a href="index.php?fuse=knowledgebase&controller=articles&view=main&categoryId=8">Managing Email in cPanel (12)</a></h4>
  <ul class="knowledge-box-ul cm-height">
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=10">Where to Find Email Tools</a></li>
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=11">Creating an Email Account</a></li>
  </ul>
</div></div>
<div class="col"><div class="knowledge-base-box">
  <h4><a href="index.php?fuse=knowledgebase&controller=articles&view=main&categoryId=12">WordPress (19)</a></h4>
  <ul class="knowledge-box-ul cm-height">
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=42">Opening WP Toolkit</a></li>
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=43">Installing WordPress</a></li>
  </ul>
</div></div>
<div class="col"><div class="knowledge-base-box">
  <h4><a href="index.php?fuse=knowledgebase&controller=articles&view=main&categoryId=7">Files &amp; Websites (54)</a></h4>
  <ul class="knowledge-box-ul cm-height">
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=1">Understanding the File Structure</a></li>
    <li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=2">File Manager</a></li>
  </ul>
</div></div>`;

describe("parseKbTopics", () => {
  it("extracts the lead article of each category, in order", () => {
    const topics = parseKbTopics(KB_HTML);
    expect(topics).toEqual([
      { title: "Types of Domain Names", href: "https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=22" },
      { title: "Where to Find Email Tools", href: "https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=10" },
      { title: "Opening WP Toolkit", href: "https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=42" },
      { title: "Understanding the File Structure", href: "https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=1" },
    ]);
  });

  it("returns an empty array for garbage or empty HTML", () => {
    expect(parseKbTopics("")).toEqual([]);
    expect(parseKbTopics("<html><body>no kb here</body></html>")).toEqual([]);
  });

  it("decodes HTML entities in titles", () => {
    const html = `<div class="knowledge-base-box"><ul><li><a href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=99">Backups &amp; Restores</a></li></ul></div>`;
    expect(parseKbTopics(html)).toEqual([
      { title: "Backups & Restores", href: "https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=99" },
    ]);
  });
});

describe("KB_FALLBACK_TOPICS", () => {
  it("lists the four category leads as absolute article URLs", () => {
    expect(KB_FALLBACK_TOPICS).toHaveLength(4);
    for (const t of KB_FALLBACK_TOPICS) {
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.href).toMatch(/^https:\/\/go\.serverizz\.com\/index\.php\?fuse=knowledgebase.*view=article&articleId=\d+$/);
    }
    expect(KB_FALLBACK_TOPICS[2]).toEqual({
      title: "Opening WP Toolkit",
      href: "https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=42",
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- lib/clientexec.test.ts`
Expected: FAIL — `parseKbTopics`/`KB_FALLBACK_TOPICS` are not exported (import error or "is not a function").

- [ ] **Step 3: Implement the parser, fallback, and entity decoder**

Append to `lib/clientexec.ts`:

```ts
export type KbTopic = { title: string; href: string };

const KB_MAIN_URL = `${CE_URL}/index.php?fuse=knowledgebase&controller=articles&view=main`;

/** Real KB category-lead links, used when the live KB fetch/parse fails. */
export const KB_FALLBACK_TOPICS: KbTopic[] = [
  { title: "Types of Domain Names", href: `${CE_URL}/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=22` },
  { title: "Where to Find Email Tools", href: `${CE_URL}/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=10` },
  { title: "Opening WP Toolkit", href: `${CE_URL}/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=42` },
  { title: "Understanding the File Structure", href: `${CE_URL}/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=1` },
];

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

const ARTICLE_ANCHOR = /<a\s+href="([^"]*view=article&(?:amp;)?articleId=\d+[^"]*)"[^>]*>\s*([^<]+?)\s*<\/a>/i;

/** First article link inside each `knowledge-base-box`, in document order. */
export function parseKbTopics(html: string): KbTopic[] {
  const boxes = html.split("knowledge-base-box").slice(1);
  const topics: KbTopic[] = [];
  for (const box of boxes) {
    const m = box.match(ARTICLE_ANCHOR);
    if (!m) continue;
    const href = decodeEntities(m[1]);
    const title = decodeEntities(m[2]).trim();
    if (title && href) topics.push({ title, href });
  }
  return topics;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- lib/clientexec.test.ts`
Expected: PASS (all `parseKbTopics` and `KB_FALLBACK_TOPICS` tests green, plus the pre-existing tests).

- [ ] **Step 5: Commit**

```bash
git add lib/clientexec.ts lib/clientexec.test.ts
git commit -m "feat: parse KB category-lead topics with fallback list"
```

---

### Task 2: `getPopularKbTopics()` fetch wrapper

**Files:**
- Modify: `lib/clientexec.ts` (append after `parseKbTopics`)
- Test: `lib/clientexec.test.ts` (append new `describe` block)

**Interfaces:**
- Consumes: `KB_MAIN_URL`, `parseKbTopics`, `KB_FALLBACK_TOPICS` from Task 1.
- Produces: `export async function getPopularKbTopics(): Promise<KbTopic[]>;` — never throws, never returns empty.

- [ ] **Step 1: Write the failing tests**

Append to `lib/clientexec.test.ts`:

```ts
import { getPopularKbTopics } from "@/lib/clientexec";

function mockFetchHtml(html: string, ok = true) {
  return vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, text: () => Promise.resolve(html) });
}

describe("getPopularKbTopics", () => {
  it("returns parsed topics when the KB responds", async () => {
    vi.stubGlobal("fetch", mockFetchHtml(KB_HTML));
    const topics = await getPopularKbTopics();
    expect(topics).toHaveLength(4);
    expect(topics[0]).toEqual({
      title: "Types of Domain Names",
      href: "https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=22",
    });
  });

  it("falls back when the response has no parseable topics", async () => {
    vi.stubGlobal("fetch", mockFetchHtml("<html>nothing here</html>"));
    expect(await getPopularKbTopics()).toEqual(KB_FALLBACK_TOPICS);
  });

  it("falls back on a non-ok response", async () => {
    vi.stubGlobal("fetch", mockFetchHtml("", false));
    expect(await getPopularKbTopics()).toEqual(KB_FALLBACK_TOPICS);
  });

  it("falls back when fetch rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    expect(await getPopularKbTopics()).toEqual(KB_FALLBACK_TOPICS);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- lib/clientexec.test.ts`
Expected: FAIL — `getPopularKbTopics` is not exported.

- [ ] **Step 3: Implement the fetch wrapper**

Append to `lib/clientexec.ts`:

```ts
/** Live KB category-lead topics for the support page; falls back on any failure. */
export async function getPopularKbTopics(): Promise<KbTopic[]> {
  try {
    const res = await fetch(KB_MAIN_URL, { next: { revalidate: 86400 } } as RequestInit);
    if (!res.ok) return KB_FALLBACK_TOPICS;
    const topics = parseKbTopics(await res.text());
    return topics.length ? topics : KB_FALLBACK_TOPICS;
  } catch {
    return KB_FALLBACK_TOPICS;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- lib/clientexec.test.ts`
Expected: PASS (all four `getPopularKbTopics` cases green).

- [ ] **Step 5: Commit**

```bash
git add lib/clientexec.ts lib/clientexec.test.ts
git commit -m "feat: add getPopularKbTopics live fetch with fallback"
```

---

### Task 3: Render live KB topics on the `/support` page

**Files:**
- Modify: `app/(site)/support/page.tsx`

**Interfaces:**
- Consumes: `getPopularKbTopics` from `@/lib/clientexec` (Task 2).

- [ ] **Step 1: Import the helper and remove the hardcoded `topics` array**

In `app/(site)/support/page.tsx`, add to the imports near the top:

```tsx
import { getPopularKbTopics } from "@/lib/clientexec";
```

Delete the hardcoded `topics` array (the `const topics = [ … ];` block, lines ~52–57):

```tsx
const topics = [
  { label: "→ Migrate my site to SERVERIZZ", href: "/wordpress" },
  { label: "→ Set up email on my domain", href: "/domains" },
  { label: "→ Point a domain I own", href: "/domains" },
  { label: "→ Restore from a backup", href: "/why" },
];
```

- [ ] **Step 2: Make the component async and fetch the topics**

Change the component signature and load topics at the top of the body:

```tsx
export default async function SupportPage() {
  const topics = await getPopularKbTopics();
  return (
```

- [ ] **Step 3: Render the topics as new-tab external anchors**

Replace the topics `.map(...)` block inside the "Popular help topics" card with:

```tsx
{topics.map((t) => (
  <a
    key={t.href}
    href={t.href}
    target="_blank"
    rel="noopener noreferrer"
    className="szz-link-accent"
    style={{ fontSize: 14 }}
  >
    → {t.title}
  </a>
))}
```

- [ ] **Step 4: Remove the now-unused `Link` import**

`next/link` was used only by the old topics list. Delete this line from the imports:

```tsx
import Link from "next/link";
```

(If a later edit reintroduces a `Link` usage elsewhere in the file, keep the import instead — but as of this plan, the topics list is its only consumer.)

- [ ] **Step 5: Typecheck, lint, and build**

Run: `npm run lint && npx tsc --noEmit && npm run build`
Expected: PASS — no unused-import error for `Link`, no type errors, build succeeds. (If the project lacks a `lint` script, run `npx tsc --noEmit && npm run build`.)

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, open `http://localhost:3000/support`.
Expected: The "Popular help topics" card shows four `→ `-prefixed links (Types of Domain Names, Where to Find Email Tools, Opening WP Toolkit, Understanding the File Structure). Clicking each opens the corresponding `go.serverizz.com` KB article in a new browser tab.

- [ ] **Step 7: Commit**

```bash
git add "app/(site)/support/page.tsx"
git commit -m "feat: show live ClientExec KB topics on /support"
```

---

## Self-Review

**Spec coverage:**
- "Live fetch from ClientExec" → Task 2 (`getPopularKbTopics`, cached daily).
- "Lead article per category → 4 links" definition → Task 1 (`parseKbTopics` first-per-box) + fallback list.
- "Open in new tab" external links, remove hardcoded array → Task 3.
- Error handling / never-empty fallback → Tasks 1–2 (`KB_FALLBACK_TOPICS`, `getPopularKbTopics` guards).
- Testing (parser happy path, empty→fallback) → Tasks 1–2 test blocks.
- Out of scope (search box, contact form, ranking) → untouched. ✓ All spec sections covered.

**Placeholder scan:** No TBD/TODO/"handle edge cases"; every code step shows complete code and exact commands. ✓

**Type consistency:** `KbTopic { title, href }` defined in Task 1 and used unchanged in Tasks 2–3; `parseKbTopics`, `KB_FALLBACK_TOPICS`, `getPopularKbTopics`, `KB_MAIN_URL` names match across tasks. ✓

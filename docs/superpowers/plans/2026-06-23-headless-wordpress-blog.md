# Headless WordPress Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a headless WordPress blog — index, article, and category pages — that pulls content from `newsroom.serverizz.com`'s REST API and renders it through branded SERVERIZZ templates.

**Architecture:** Server Components with ISR fetch posts from the WordPress REST API (`/wp-json/wp/v2`). A typed client (`lib/wordpress.ts`) fetches and a mapper (`lib/wp-map.ts` + `lib/wp-prose.ts`) converts raw WP JSON into clean domain types, computing reading time and a table of contents WordPress doesn't provide. Presentational components under `components/szz/blog/` render the design-canvas layouts using the existing `--szz-*` token system. SEO reuses the `lib/seo.ts` registry.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19, TypeScript, Tailwind v4 + CSS tokens, Vitest. New deps: `unified`, `rehype-parse`, `rehype-slug`, `rehype-sanitize`, `rehype-stringify`, `unist-util-visit`, `hast-util-to-string`.

## Global Constraints

- Next.js **16.2.9**, App Router only. React **19**. Node **>=20**. (Read `node_modules/next/dist/docs/` before using any Next API — this Next version may differ from training data; per repo `AGENTS.md`.)
- All blog pages live under the existing `app/(site)/` route group so `SiteNav`/`SiteFooter`/theme wrap automatically.
- Rendering strategy: **ISR**. Every blog route sets `export const revalidate = 600` (RSS: `3600`). This overrides the long global prod route cache.
- Brand: use only `--szz-*` design tokens and the `--font-heading`/`--font-body`/`--font-mono` variables. Reuse `SectionEyebrow`, `Badge`, `Button`, `Card` from the existing kit. Layout/spacing reference: `docs/superpowers/specs/reference/blog-canvas-markup.html`.
- WP REST base URL comes from `process.env.WORDPRESS_API_URL` with default `https://newsroom.serverizz.com/wp-json/wp/v2`. The WP base URL must never be imported into a Client Component.
- Tests: Vitest, colocated `*.test.ts`. Mock `fetch` with `vi.stubGlobal` and `vi.unstubAllGlobals()` in `afterEach` (match `lib/clientexec.test.ts` style).
- Commit after every task. Branch: `feat/headless-wordpress-blog`. **Do not push** (main auto-deploys to prod).
- Do not implement live search, comments, tag pages, or Gutenberg block mapping (out of scope).

## Domain Types (defined in Task 2/3, referenced throughout)

```typescript
// lib/wp-prose.ts
export interface TocItem { id: string; label: string; level: 2 | 3; }
export function renderProse(html: string): { html: string; toc: TocItem[] };

// lib/wp-map.ts
export interface Author { name: string; slug: string; description: string; avatarUrl: string | null; }
export interface PostCategory { id: number; slug: string; name: string; colorVar: string; }
export interface Category extends PostCategory { count: number; description: string; }
export interface FeaturedImage { url: string; alt: string; width: number | null; height: number | null; }
export interface PostSummary {
  id: number; slug: string; title: string; excerpt: string;
  date: string; modified: string; dateLabel: string; readingMinutes: number;
  category: PostCategory | null; featuredImage: FeaturedImage | null;
}
export interface Post extends PostSummary {
  contentHtml: string; toc: TocItem[]; author: Author | null;
}

// lib/wordpress.ts
export interface PostsPage { posts: PostSummary[]; total: number; totalPages: number; }
export function getPosts(opts?: { page?: number; perPage?: number; categoryId?: number }): Promise<PostsPage>;
export function getPost(slug: string): Promise<Post | null>;
export function getCategories(): Promise<Category[]>;
export function getCategory(slug: string): Promise<Category | null>;
```

---

### Task 1: Dependencies, env, and Next config

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `.env.example`
- Modify: `next.config.ts`

**Interfaces:**
- Produces: the `WORDPRESS_API_URL` env var and the rehype/unified toolchain used by all later tasks; `newsroom.serverizz.com` allowed for `next/image`.

- [ ] **Step 1: Install runtime dependencies**

Run:
```bash
npm install unified rehype-parse rehype-slug rehype-sanitize rehype-stringify unist-util-visit hast-util-to-string
```
Expected: packages added to `dependencies`, no peer-dep errors.

- [ ] **Step 2: Add the WordPress base URL to `.env.example`**

Append to `.env.example`:
```bash

# Headless WordPress (newsroom) REST API base — used by lib/wordpress.ts (server-only)
WORDPRESS_API_URL=https://newsroom.serverizz.com/wp-json/wp/v2
```

- [ ] **Step 3: Allow WordPress media host for next/image**

Replace `next.config.ts` contents with:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "newsroom.serverizz.com" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/wordpress",
        destination: "/hosting/wordpress",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 4: Verify typecheck + build config loads**

Run: `npx tsc --noEmit`
Expected: PASS (no errors).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example next.config.ts
git commit -m "chore(blog): add WP env, image host, and rehype toolchain"
```

---

### Task 2: HTML prose pipeline (`lib/wp-prose.ts`)

**Files:**
- Create: `lib/wp-prose.ts`
- Test: `lib/wp-prose.test.ts`

**Interfaces:**
- Produces: `renderProse(html) → { html, toc }`, `TocItem`. Consumed by `wp-map.ts` (Task 3) and `ArticleToc`/`BlogProse` (Task 7).

- [ ] **Step 1: Write the failing test**

Create `lib/wp-prose.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { renderProse } from "@/lib/wp-prose";

describe("renderProse", () => {
  it("injects heading ids and builds a TOC from h2/h3", () => {
    const { html, toc } = renderProse(
      "<h2>The hidden cost</h2><p>x</p><h3>Sub point</h3><h2>Time math</h2>",
    );
    expect(toc).toEqual([
      { id: "the-hidden-cost", label: "The hidden cost", level: 2 },
      { id: "sub-point", label: "Sub point", level: 3 },
      { id: "time-math", label: "Time math", level: 2 },
    ]);
    expect(html).toContain('id="the-hidden-cost"');
  });

  it("strips script tags and event handlers", () => {
    const { html } = renderProse('<p onclick="evil()">hi</p><script>steal()</script>');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("onclick");
    expect(html).toContain("hi");
  });

  it("keeps safe links and images", () => {
    const { html } = renderProse('<a href="https://x.com">x</a><img src="https://newsroom.serverizz.com/a.jpg" alt="a">');
    expect(html).toContain('href="https://x.com"');
    expect(html).toContain('<img');
  });

  it("returns empty html and empty toc for empty input", () => {
    expect(renderProse("")).toEqual({ html: "", toc: [] });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/wp-prose.test.ts`
Expected: FAIL — cannot resolve `@/lib/wp-prose`.

- [ ] **Step 3: Implement `lib/wp-prose.ts`**

```typescript
import { unified } from "unified";
import rehypeParse from "rehype-parse";
import rehypeSlug from "rehype-slug";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { toString as hastToString } from "hast-util-to-string";

export interface TocItem {
  id: string;
  label: string;
  level: 2 | 3;
}

/** Sanitize schema = rehype defaults + ids/classes on everything, plus image dims. */
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    "*": [...(defaultSchema.attributes?.["*"] ?? []), "id", "className"],
    img: [...(defaultSchema.attributes?.img ?? []), "src", "alt", "width", "height", "loading"],
    a: [...(defaultSchema.attributes?.a ?? []), "href", "title", "target", "rel"],
  },
};

/**
 * Turn WordPress post HTML into sanitized, branded-ready HTML plus a table of
 * contents. Heading ids are injected (rehype-slug) before sanitizing, and the
 * TOC is collected from h2/h3 in document order.
 */
export function renderProse(html: string): { html: string; toc: TocItem[] } {
  if (!html.trim()) return { html: "", toc: [] };
  const toc: TocItem[] = [];
  const file = unified()
    .use(rehypeParse, { fragment: true })
    .use(rehypeSlug)
    .use(() => (tree) => {
      visit(tree, "element", (node: { tagName?: string; properties?: { id?: unknown } }) => {
        if (node.tagName === "h2" || node.tagName === "h3") {
          const id = node.properties?.id;
          if (id) {
            toc.push({
              id: String(id),
              label: hastToString(node as never),
              level: node.tagName === "h2" ? 2 : 3,
            });
          }
        }
      });
    })
    .use(rehypeSanitize, schema)
    .use(rehypeStringify)
    .processSync(html);
  return { html: String(file), toc };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/wp-prose.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/wp-prose.ts lib/wp-prose.test.ts
git commit -m "feat(blog): sanitize WP HTML and extract table of contents"
```

---

### Task 3: WordPress → domain mapping (`lib/wp-map.ts`)

**Files:**
- Create: `lib/wp-map.ts`
- Test: `lib/wp-map.test.ts`

**Interfaces:**
- Consumes: `renderProse`, `TocItem` from `lib/wp-prose.ts`.
- Produces: `Author`, `PostCategory`, `Category`, `FeaturedImage`, `PostSummary`, `Post`; `readingMinutes`, `formatDate`, `categoryColorVar`, `mapCategory`, `mapPostSummary`, `mapPost`, and the `RawWpPost`/`RawWpCategory` raw types. Consumed by `lib/wordpress.ts` (Task 4) and all components (Task 6–7).

- [ ] **Step 1: Write the failing test**

Create `lib/wp-map.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import {
  readingMinutes,
  formatDate,
  categoryColorVar,
  mapPostSummary,
  mapPost,
  mapCategory,
  type RawWpPost,
  type RawWpCategory,
} from "@/lib/wp-map";

const RAW_POST: RawWpPost = {
  id: 7,
  slug: "managed-hosting-saves-time",
  date: "2026-06-18T09:00:00",
  modified: "2026-06-19T10:00:00",
  title: { rendered: "How Managed Hosting Saves Time" },
  excerpt: { rendered: "<p>Updates, backups &amp; patches.</p>" },
  content: { rendered: "<h2>Cost</h2><p>" + "word ".repeat(399) + "</p>" }, // 399 + "Cost" = 400 words → 2 min
  categories: [3],
  _embedded: {
    author: [{ name: "Ada", slug: "ada", description: "Founder", avatar_urls: { "96": "https://x/a.png" } }],
    "wp:featuredmedia": [{ source_url: "https://newsroom.serverizz.com/f.jpg", alt_text: "cover", media_details: { width: 1200, height: 630 } }],
    "wp:term": [[{ id: 3, slug: "small-business", name: "Small Business", taxonomy: "category" }]],
  },
};

const RAW_CATEGORY: RawWpCategory = { id: 3, slug: "small-business", name: "Small Business", count: 4, description: "Biz" };

describe("readingMinutes", () => {
  it("computes ceil(words/200), min 1", () => {
    expect(readingMinutes("<p>" + "w ".repeat(400) + "</p>")).toBe(2);
    expect(readingMinutes("<p>short</p>")).toBe(1);
    expect(readingMinutes("")).toBe(1);
  });
});

describe("formatDate", () => {
  it("formats ISO as 'Mon D, YYYY'", () => {
    expect(formatDate("2026-06-18T09:00:00")).toBe("Jun 18, 2026");
  });
});

describe("categoryColorVar", () => {
  it("maps known slugs to brand tokens", () => {
    expect(categoryColorVar("small-business")).toBe("var(--szz-green)");
    expect(categoryColorVar("security-speed")).toBe("var(--szz-yellow)");
    expect(categoryColorVar("wordpress")).toBe("var(--szz-accent-blue)");
  });
  it("falls back to accent blue for unknown slugs", () => {
    expect(categoryColorVar("nope")).toBe("var(--szz-accent-blue)");
  });
});

describe("mapPostSummary", () => {
  it("maps core fields, category, featured image, derived fields", () => {
    const p = mapPostSummary(RAW_POST);
    expect(p).toMatchObject({
      id: 7,
      slug: "managed-hosting-saves-time",
      title: "How Managed Hosting Saves Time",
      excerpt: "Updates, backups & patches.",
      dateLabel: "Jun 18, 2026",
      readingMinutes: 2,
      category: { id: 3, slug: "small-business", name: "Small Business", colorVar: "var(--szz-green)" },
      featuredImage: { url: "https://newsroom.serverizz.com/f.jpg", alt: "cover", width: 1200, height: 630 },
    });
  });
  it("tolerates missing featured media and category", () => {
    const bare: RawWpPost = { ...RAW_POST, categories: [], _embedded: { author: RAW_POST._embedded!.author } };
    const p = mapPostSummary(bare);
    expect(p.featuredImage).toBeNull();
    expect(p.category).toBeNull();
  });
});

describe("mapPost", () => {
  it("adds rendered content, toc, and author", () => {
    const p = mapPost(RAW_POST);
    expect(p.author).toEqual({ name: "Ada", slug: "ada", description: "Founder", avatarUrl: "https://x/a.png" });
    expect(p.contentHtml).toContain('id="cost"');
    expect(p.toc).toEqual([{ id: "cost", label: "Cost", level: 2 }]);
  });
});

describe("mapCategory", () => {
  it("maps a category and assigns a color", () => {
    expect(mapCategory(RAW_CATEGORY)).toEqual({
      id: 3, slug: "small-business", name: "Small Business", count: 4, description: "Biz", colorVar: "var(--szz-green)",
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/wp-map.test.ts`
Expected: FAIL — cannot resolve `@/lib/wp-map`.

- [ ] **Step 3: Implement `lib/wp-map.ts`**

```typescript
import { renderProse, type TocItem } from "@/lib/wp-prose";

// ---------- Raw WordPress REST shapes (only the fields we use) ----------
interface Rendered { rendered: string }
export interface RawWpTerm { id: number; slug: string; name: string; taxonomy: string }
export interface RawWpPost {
  id: number;
  slug: string;
  date: string;
  modified: string;
  title: Rendered;
  excerpt: Rendered;
  content: Rendered;
  categories: number[];
  _embedded?: {
    author?: { name: string; slug: string; description?: string; avatar_urls?: Record<string, string> }[];
    "wp:featuredmedia"?: { source_url: string; alt_text?: string; media_details?: { width?: number; height?: number } }[];
    "wp:term"?: RawWpTerm[][];
  };
}
export interface RawWpCategory { id: number; slug: string; name: string; count: number; description: string }

// ---------- Domain types ----------
export interface Author { name: string; slug: string; description: string; avatarUrl: string | null }
export interface PostCategory { id: number; slug: string; name: string; colorVar: string }
export interface Category extends PostCategory { count: number; description: string }
export interface FeaturedImage { url: string; alt: string; width: number | null; height: number | null }
export interface PostSummary {
  id: number; slug: string; title: string; excerpt: string;
  date: string; modified: string; dateLabel: string; readingMinutes: number;
  category: PostCategory | null; featuredImage: FeaturedImage | null;
}
export interface Post extends PostSummary { contentHtml: string; toc: TocItem[]; author: Author | null }

// ---------- Category accent colors (slug → --szz token; brand consistency) ----------
const CATEGORY_COLORS: Record<string, string> = {
  "hosting-101": "--szz-accent-blue",
  wordpress: "--szz-accent-blue",
  "small-business": "--szz-green",
  "domains-email": "--szz-green",
  "security-speed": "--szz-yellow",
};
const DEFAULT_CATEGORY_COLOR = "--szz-accent-blue";

export function categoryColorVar(slug: string): string {
  return `var(${CATEGORY_COLORS[slug] ?? DEFAULT_CATEGORY_COLOR})`;
}

// ---------- Derived fields WordPress doesn't provide ----------
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#8217;/g, "’").replace(/&[a-z0-9#]+;/gi, " ").replace(/\s+/g, " ").trim();
}

export function readingMinutes(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
}

// ---------- Mappers ----------
function embeddedCategory(raw: RawWpPost): PostCategory | null {
  const term = raw._embedded?.["wp:term"]?.flat().find((t) => t.taxonomy === "category");
  if (!term) return null;
  return { id: term.id, slug: term.slug, name: term.name, colorVar: categoryColorVar(term.slug) };
}

function embeddedImage(raw: RawWpPost): FeaturedImage | null {
  const m = raw._embedded?.["wp:featuredmedia"]?.[0];
  if (!m?.source_url) return null;
  return { url: m.source_url, alt: m.alt_text || "", width: m.media_details?.width ?? null, height: m.media_details?.height ?? null };
}

export function mapPostSummary(raw: RawWpPost): PostSummary {
  return {
    id: raw.id,
    slug: raw.slug,
    title: stripHtml(raw.title.rendered),
    excerpt: stripHtml(raw.excerpt.rendered),
    date: raw.date,
    modified: raw.modified,
    dateLabel: formatDate(raw.date),
    readingMinutes: readingMinutes(raw.content?.rendered ?? raw.excerpt.rendered),
    category: embeddedCategory(raw),
    featuredImage: embeddedImage(raw),
  };
}

export function mapPost(raw: RawWpPost): Post {
  const summary = mapPostSummary(raw);
  const { html, toc } = renderProse(raw.content.rendered);
  const a = raw._embedded?.author?.[0];
  const author: Author | null = a
    ? { name: a.name, slug: a.slug, description: a.description ?? "", avatarUrl: a.avatar_urls?.["96"] ?? null }
    : null;
  return { ...summary, contentHtml: html, toc, author };
}

export function mapCategory(raw: RawWpCategory): Category {
  return { id: raw.id, slug: raw.slug, name: raw.name, count: raw.count, description: stripHtml(raw.description), colorVar: categoryColorVar(raw.slug) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/wp-map.test.ts`
Expected: PASS (all describe blocks).

- [ ] **Step 5: Commit**

```bash
git add lib/wp-map.ts lib/wp-map.test.ts
git commit -m "feat(blog): map WP REST JSON to domain types + derived fields"
```

---

### Task 4: WordPress REST client (`lib/wordpress.ts`)

**Files:**
- Create: `lib/wordpress.ts`
- Test: `lib/wordpress.test.ts`

**Interfaces:**
- Consumes: mappers + types from `lib/wp-map.ts`.
- Produces: `getPosts`, `getPost`, `getCategories`, `getCategory`, `PostsPage`. Consumed by all route pages (Task 7) and `sitemap.ts`/RSS (Task 8).

- [ ] **Step 1: Write the failing test**

Create `lib/wordpress.test.ts`:
```typescript
import { describe, it, expect, vi, afterEach } from "vitest";
import { getPosts, getPost, getCategories, getCategory } from "@/lib/wordpress";

const POST = {
  id: 7, slug: "p1", date: "2026-06-18T09:00:00", modified: "2026-06-18T09:00:00",
  title: { rendered: "P1" }, excerpt: { rendered: "<p>x</p>" }, content: { rendered: "<p>hi</p>" },
  categories: [3],
  _embedded: { author: [{ name: "Ada", slug: "ada" }], "wp:term": [[{ id: 3, slug: "wordpress", name: "WordPress", taxonomy: "category" }]] },
};
const CATEGORY = { id: 3, slug: "wordpress", name: "WordPress", count: 2, description: "" };

function mockJson(json: unknown, headers: Record<string, string> = {}, ok = true) {
  return vi.fn().mockResolvedValue({
    ok, status: ok ? 200 : 500,
    headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
    json: () => Promise.resolve(json),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("getPosts", () => {
  it("requests _embed and per_page/page and parses pagination headers", async () => {
    const f = mockJson([POST], { "x-wp-total": "12", "x-wp-totalpages": "2" });
    vi.stubGlobal("fetch", f);
    const page = await getPosts({ page: 2, perPage: 6 });
    const url = String(f.mock.calls[0][0]);
    expect(url).toContain("/posts");
    expect(url).toContain("_embed=1");
    expect(url).toContain("per_page=6");
    expect(url).toContain("page=2");
    expect(page.total).toBe(12);
    expect(page.totalPages).toBe(2);
    expect(page.posts[0].slug).toBe("p1");
  });

  it("adds a categories filter when categoryId given", async () => {
    const f = mockJson([POST], { "x-wp-totalpages": "1" });
    vi.stubGlobal("fetch", f);
    await getPosts({ categoryId: 3 });
    expect(String(f.mock.calls[0][0])).toContain("categories=3");
  });

  it("throws when WordPress is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(getPosts()).rejects.toThrow();
  });
});

describe("getPost", () => {
  it("queries by slug with _embed and returns the first match", async () => {
    const f = mockJson([POST]);
    vi.stubGlobal("fetch", f);
    const post = await getPost("p1");
    expect(String(f.mock.calls[0][0])).toContain("slug=p1");
    expect(post?.slug).toBe("p1");
    expect(post?.contentHtml).toContain("hi");
  });
  it("returns null when no post matches", async () => {
    vi.stubGlobal("fetch", mockJson([]));
    expect(await getPost("missing")).toBeNull();
  });
});

describe("getCategories / getCategory", () => {
  it("getCategories maps all", async () => {
    vi.stubGlobal("fetch", mockJson([CATEGORY]));
    const cats = await getCategories();
    expect(cats[0]).toMatchObject({ slug: "wordpress", colorVar: "var(--szz-accent-blue)" });
  });
  it("getCategory returns first match or null", async () => {
    const f = mockJson([CATEGORY]);
    vi.stubGlobal("fetch", f);
    const c = await getCategory("wordpress");
    expect(String(f.mock.calls[0][0])).toContain("slug=wordpress");
    expect(c?.id).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/wordpress.test.ts`
Expected: FAIL — cannot resolve `@/lib/wordpress`.

- [ ] **Step 3: Implement `lib/wordpress.ts`**

```typescript
import {
  mapPost,
  mapPostSummary,
  mapCategory,
  type Post,
  type PostSummary,
  type Category,
  type RawWpPost,
  type RawWpCategory,
} from "@/lib/wp-map";

const BASE = process.env.WORDPRESS_API_URL ?? "https://newsroom.serverizz.com/wp-json/wp/v2";
const REVALIDATE = 600;

export interface PostsPage { posts: PostSummary[]; total: number; totalPages: number }

function url(path: string, params: Record<string, string | number | undefined>): string {
  const u = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) u.searchParams.set(k, String(v));
  }
  return u.toString();
}

async function wpFetch(target: string): Promise<Response> {
  const res = await fetch(target, { next: { revalidate: REVALIDATE, tags: ["wp"] } });
  if (!res.ok) throw new Error(`WordPress ${res.status} for ${target}`);
  return res;
}

export async function getPosts(opts: { page?: number; perPage?: number; categoryId?: number } = {}): Promise<PostsPage> {
  const { page = 1, perPage = 10, categoryId } = opts;
  const res = await wpFetch(url("/posts", { _embed: 1, per_page: perPage, page, categories: categoryId }));
  const raw = (await res.json()) as RawWpPost[];
  return {
    posts: raw.map(mapPostSummary),
    total: Number(res.headers.get("x-wp-total") ?? raw.length),
    totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1),
  };
}

export async function getPost(slug: string): Promise<Post | null> {
  const res = await wpFetch(url("/posts", { slug, _embed: 1 }));
  const raw = (await res.json()) as RawWpPost[];
  return raw.length ? mapPost(raw[0]) : null;
}

export async function getCategories(): Promise<Category[]> {
  const res = await wpFetch(url("/categories", { per_page: 100, hide_empty: 1 }));
  const raw = (await res.json()) as RawWpCategory[];
  return raw.map(mapCategory);
}

export async function getCategory(slug: string): Promise<Category | null> {
  const res = await wpFetch(url("/categories", { slug }));
  const raw = (await res.json()) as RawWpCategory[];
  return raw.length ? mapCategory(raw[0]) : null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/wordpress.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/wordpress.ts lib/wordpress.test.ts
git commit -m "feat(blog): typed WordPress REST client with ISR + pagination"
```

---

### Task 5: Blog SEO helpers + registry entry

**Files:**
- Modify: `lib/seo.ts` (add `/blog` PAGE_SEO entry)
- Create: `lib/blog-seo.ts`
- Test: `lib/blog-seo.test.ts`

**Interfaces:**
- Consumes: `Post`, `PostSummary` from `lib/wp-map.ts`; `SITE_URL`, `SITE_NAME`, `SITE_LOCALE`, `pageMetadata`, `pageMetadataFor` from `lib/seo.ts`.
- Produces: `articleMetadata(post)`, `blogPostingJsonLd(post)`, `blogBreadcrumb(post)`. Consumed by the article route (Task 7).

- [ ] **Step 1: Add the `/blog` entry to the registry**

In `lib/seo.ts`, add to the `PAGE_SEO` array (after the `/support` entry, before the closing `]`):
```typescript
  {
    path: "/blog",
    name: "Newsroom",
    title: "SERVERIZZ Newsroom — Hosting, WordPress & Small-Business Guides",
    description:
      "Plain-English field notes on hosting, WordPress, domains and running a small business on the web — from the team that keeps it all running.",
    targetKeyword: "small business hosting blog",
    cluster: ["WordPress guides", "hosting 101", "domains and email"],
    jsonLd: null,
    changeFrequency: "daily",
    priority: 0.7,
  },
```

- [ ] **Step 2: Write the failing test**

Create `lib/blog-seo.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import { articleMetadata, blogPostingJsonLd, blogBreadcrumb } from "@/lib/blog-seo";
import type { Post } from "@/lib/wp-map";

const POST: Post = {
  id: 7, slug: "managed-hosting-saves-time", title: "How Managed Hosting Saves Time",
  excerpt: "Updates, backups & patches handled for you.",
  date: "2026-06-18T09:00:00", modified: "2026-06-19T09:00:00", dateLabel: "Jun 18, 2026",
  readingMinutes: 6,
  category: { id: 3, slug: "small-business", name: "Small Business", colorVar: "var(--szz-green)" },
  featuredImage: { url: "https://newsroom.serverizz.com/f.jpg", alt: "cover", width: 1200, height: 630 },
  contentHtml: "<p>hi</p>", toc: [], author: { name: "Ada", slug: "ada", description: "", avatarUrl: null },
};

describe("articleMetadata", () => {
  it("sets canonical, og:type=article and the featured image", () => {
    const m = articleMetadata(POST);
    expect(m.alternates?.canonical).toBe("/blog/managed-hosting-saves-time");
    expect((m.openGraph as Record<string, unknown>).type).toBe("article");
    expect(JSON.stringify(m.openGraph)).toContain("f.jpg");
    expect(m.title).toBe("How Managed Hosting Saves Time");
  });
});

describe("blogPostingJsonLd", () => {
  it("emits a BlogPosting with dates, author, image, url", () => {
    const ld = blogPostingJsonLd(POST);
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.headline).toBe("How Managed Hosting Saves Time");
    expect(ld.datePublished).toBe("2026-06-18T09:00:00");
    expect(ld.dateModified).toBe("2026-06-19T09:00:00");
    expect(ld.url).toBe("https://www.serverizz.com/blog/managed-hosting-saves-time");
    expect(JSON.stringify(ld.author)).toContain("Ada");
  });
});

describe("blogBreadcrumb", () => {
  it("builds Home → Newsroom → Category → Post", () => {
    const items = blogBreadcrumb(POST);
    expect(items.map((i) => i.name)).toEqual(["Home", "Newsroom", "Small Business", "How Managed Hosting Saves Time"]);
    expect(items[3].item).toBe("https://www.serverizz.com/blog/managed-hosting-saves-time");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run lib/blog-seo.test.ts`
Expected: FAIL — cannot resolve `@/lib/blog-seo`.

- [ ] **Step 4: Implement `lib/blog-seo.ts`**

```typescript
import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, pageMetadata } from "@/lib/seo";
import type { Post } from "@/lib/wp-map";

/** Per-article Metadata: registry-style canonical/OG/Twitter, plus article type + image. */
export function articleMetadata(post: Post): Metadata {
  const path = `/blog/${post.slug}`;
  const description = post.excerpt.slice(0, 160);
  const meta = pageMetadata({ title: post.title, description, path });
  const images = post.featuredImage ? [{ url: post.featuredImage.url }] : undefined;
  meta.openGraph = { ...meta.openGraph, type: "article", ...(images ? { images } : {}) };
  if (images) meta.twitter = { ...meta.twitter, images };
  return meta;
}

/** BlogPosting JSON-LD (rendered via <JsonLdScript>). */
export function blogPostingJsonLd(post: Post): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.modified,
    url: `${SITE_URL}/blog/${post.slug}`,
    ...(post.featuredImage ? { image: post.featuredImage.url } : {}),
    ...(post.author ? { author: { "@type": "Person", name: post.author.name } } : {}),
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    ...(post.category ? { articleSection: post.category.name } : {}),
  };
}

/** Breadcrumb items: Home → Newsroom → [Category] → Post. */
export function blogBreadcrumb(post: Post) {
  const items = [
    { position: 1, name: "Home", item: `${SITE_URL}/` },
    { position: 2, name: "Newsroom", item: `${SITE_URL}/blog` },
  ];
  if (post.category) {
    items.push({ position: 3, name: post.category.name, item: `${SITE_URL}/blog/category/${post.category.slug}` });
  }
  items.push({ position: items.length + 1, name: post.title, item: `${SITE_URL}/blog/${post.slug}` });
  return items;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run lib/blog-seo.test.ts lib/seo.test.ts`
Expected: PASS (and existing seo tests still green).

- [ ] **Step 6: Commit**

```bash
git add lib/seo.ts lib/blog-seo.ts lib/blog-seo.test.ts
git commit -m "feat(blog): article metadata, BlogPosting JSON-LD, breadcrumbs"
```

---

### Task 6: Presentational components + prose CSS

Reference exact layout/spacing in `docs/superpowers/specs/reference/blog-canvas-markup.html`. All components are Server Components (no `"use client"`) except `Pagination` is also fine as a Server Component (uses `<Link>`). Use inline styles with `--szz-*` tokens, matching the legal page convention.

**Files:**
- Create: `components/szz/blog/post-card.tsx`
- Create: `components/szz/blog/blog-featured.tsx`
- Create: `components/szz/blog/category-rail.tsx`
- Create: `components/szz/blog/pagination.tsx`
- Create: `components/szz/blog/article-hero.tsx`
- Create: `components/szz/blog/article-toc.tsx`
- Create: `components/szz/blog/author-byline.tsx`
- Create: `components/szz/blog/related-posts.tsx`
- Create: `components/szz/blog/blog-prose.tsx`
- Modify: `app/globals.css` (append `.szz-prose` block)

**Interfaces:**
- Consumes: `PostSummary`, `Post`, `Category`, `PostCategory`, `Author`, `TocItem` from `lib/wp-map.ts`/`lib/wp-prose.ts`.
- Produces: the named components below. Consumed by routes (Task 7).
  - `PostCard({ post: PostSummary })`
  - `BlogFeatured({ post: PostSummary })`
  - `CategoryRail({ categories: Category[]; activeSlug?: string })`
  - `Pagination({ basePath: string; page: number; totalPages: number })`
  - `ArticleHero({ post: Post })`
  - `ArticleToc({ toc: TocItem[] })`
  - `AuthorByline({ author: Author })`
  - `RelatedPosts({ posts: PostSummary[] })`
  - `BlogProse({ html: string })`

- [ ] **Step 1: Append `.szz-prose` styles to `app/globals.css`**

Append:
```css
/* ---------- Blog article prose (WordPress body, branded) ---------- */
.szz-prose {
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.75;
  color: var(--szz-text-light);
}
.szz-prose > * + * { margin-top: 1.1em; }
.szz-prose h2 {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  line-height: 1.2;
  color: var(--szz-text-primary);
  margin-top: 2em;
  scroll-margin-top: 88px;
}
.szz-prose h3 {
  font-family: var(--font-heading);
  font-size: 21px;
  font-weight: 700;
  color: var(--szz-text-primary);
  margin-top: 1.6em;
  scroll-margin-top: 88px;
}
.szz-prose p { color: var(--szz-text-light); }
.szz-prose a { color: var(--szz-accent-blue); text-decoration: underline; text-underline-offset: 2px; }
.szz-prose ul, .szz-prose ol { padding-left: 1.4em; }
.szz-prose li + li { margin-top: 0.4em; }
.szz-prose blockquote {
  border-left: 3px solid var(--szz-accent-blue);
  padding: 4px 0 4px 20px;
  margin-left: 0;
  color: var(--szz-text-muted);
  font-style: italic;
}
.szz-prose code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: var(--szz-bg-raised);
  border: 1px solid var(--szz-border-subtle);
  border-radius: var(--radius-xs);
  padding: 1px 6px;
}
.szz-prose pre {
  font-family: var(--font-mono);
  background: var(--szz-bg-raised);
  border: 1px solid var(--szz-border);
  border-radius: var(--radius-md, 10px);
  padding: 18px 20px;
  overflow-x: auto;
}
.szz-prose pre code { background: none; border: none; padding: 0; }
.szz-prose img { max-width: 100%; height: auto; border-radius: var(--radius-md, 10px); }
.szz-prose hr { border: none; border-top: 1px solid var(--szz-border); margin: 2.2em 0; }
.szz-prose table { width: 100%; border-collapse: collapse; font-size: 15px; }
.szz-prose th, .szz-prose td { border: 1px solid var(--szz-border); padding: 8px 12px; text-align: left; }
.szz-prose th { background: var(--szz-bg-card); color: var(--szz-text-primary); }
```

- [ ] **Step 2: Implement `BlogProse`**

`components/szz/blog/blog-prose.tsx`:
```tsx
/** Renders pre-sanitized WordPress HTML inside the branded prose container. */
export function BlogProse({ html }: { html: string }) {
  return <div className="szz-prose" dangerouslySetInnerHTML={{ __html: html }} />;
}
```
(Safe: `html` is produced by `renderProse`, which sanitizes via rehype-sanitize.)

- [ ] **Step 3: Implement `PostCard`**

`components/szz/blog/post-card.tsx`:
```tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { PostSummary } from "@/lib/wp-map";

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{
        display: "flex", flexDirection: "column", gap: 14,
        border: "1px solid var(--szz-border)", borderRadius: 14,
        background: "var(--szz-bg-card)", overflow: "hidden", height: "100%",
      }}
    >
      {post.featuredImage ? (
        <Image
          src={post.featuredImage.url}
          alt={post.featuredImage.alt}
          width={post.featuredImage.width ?? 640}
          height={post.featuredImage.height ?? 360}
          style={{ width: "100%", height: 180, objectFit: "cover" }}
        />
      ) : (
        <div style={{ height: 180, background: "var(--szz-bg-raised)" }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 20px 22px" }}>
        {post.category && (
          <Badge variant="outline" style={{ alignSelf: "flex-start", color: post.category.colorVar, borderColor: post.category.colorVar }}>
            {post.category.name}
          </Badge>
        )}
        <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 19, fontWeight: 700, lineHeight: 1.25, color: "var(--szz-text-primary)" }}>
          {post.title}
        </h3>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "var(--szz-text-muted)" }}>{post.excerpt}</p>
        <div style={{ display: "flex", gap: 10, fontSize: 12.5, color: "var(--szz-text-dim)" }}>
          <span>{post.dateLabel}</span><span>·</span><span>{post.readingMinutes} min read</span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Implement `BlogFeatured`**

`components/szz/blog/blog-featured.tsx`:
```tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { PostSummary } from "@/lib/wp-map";

export function BlogFeatured({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{
        display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 0,
        border: "1px solid var(--szz-border)", borderRadius: 16,
        background: "var(--szz-bg-card)", overflow: "hidden",
      }}
    >
      {post.featuredImage ? (
        <Image src={post.featuredImage.url} alt={post.featuredImage.alt} width={post.featuredImage.width ?? 800} height={post.featuredImage.height ?? 500} style={{ width: "100%", height: "100%", minHeight: 280, objectFit: "cover" }} />
      ) : (
        <div style={{ minHeight: 280, background: "var(--szz-bg-raised)" }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 36, justifyContent: "center" }}>
        {post.category && (
          <Badge variant="outline" style={{ alignSelf: "flex-start", color: post.category.colorVar, borderColor: post.category.colorVar }}>{post.category.name}</Badge>
        )}
        <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 30, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-1px", color: "var(--szz-text-primary)" }}>{post.title}</h2>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: "var(--szz-text-muted)" }}>{post.excerpt}</p>
        <div style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--szz-text-dim)" }}>
          <span>{post.dateLabel}</span><span>·</span><span>{post.readingMinutes} min read</span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 5: Implement `CategoryRail`**

`components/szz/blog/category-rail.tsx`:
```tsx
import Link from "next/link";
import type { Category } from "@/lib/wp-map";

export function CategoryRail({ categories, activeSlug }: { categories: Category[]; activeSlug?: string }) {
  return (
    <nav aria-label="Blog categories" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Link
        href="/blog"
        aria-current={!activeSlug ? "page" : undefined}
        style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: !activeSlug ? "#fff" : "var(--szz-text-muted)", background: !activeSlug ? "var(--szz-cta-blue)" : "transparent", border: "1px solid var(--szz-border)", borderRadius: 999, padding: "7px 15px" }}
      >
        Newsroom
      </Link>
      {categories.map((c) => {
        const active = c.slug === activeSlug;
        return (
          <Link
            key={c.slug}
            href={`/blog/category/${c.slug}`}
            aria-current={active ? "page" : undefined}
            style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: active ? "#fff" : "var(--szz-text-muted)", background: active ? c.colorVar : "transparent", border: `1px solid ${active ? c.colorVar : "var(--szz-border)"}`, borderRadius: 999, padding: "7px 15px" }}
          >
            {c.name}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 6: Implement `Pagination`**

`components/szz/blog/pagination.tsx`:
```tsx
import Link from "next/link";

/** basePath e.g. "/blog" → "/blog/page/2"; "/blog/category/x" → "/blog/category/x?page=2". */
export function Pagination({ basePath, page, totalPages }: { basePath: string; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const href = (n: number) =>
    basePath === "/blog" ? (n === 1 ? "/blog" : `/blog/page/${n}`) : `${basePath}?page=${n}`;
  const btn = (disabled: boolean): React.CSSProperties => ({
    fontFamily: "var(--font-body)", fontSize: 14, color: disabled ? "var(--szz-text-faint)" : "var(--szz-text-primary)",
    border: "1px solid var(--szz-border)", borderRadius: 8, padding: "8px 16px",
    pointerEvents: disabled ? "none" : "auto", opacity: disabled ? 0.5 : 1,
  });
  return (
    <nav aria-label="Pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, paddingTop: 24 }}>
      <Link href={href(Math.max(1, page - 1))} style={btn(page <= 1)} aria-disabled={page <= 1}>← Newer</Link>
      <span style={{ fontSize: 13, color: "var(--szz-text-dim)" }}>Page {page} of {totalPages}</span>
      <Link href={href(Math.min(totalPages, page + 1))} style={btn(page >= totalPages)} aria-disabled={page >= totalPages}>Older →</Link>
    </nav>
  );
}
```

- [ ] **Step 7: Implement `ArticleHero`, `ArticleToc`, `AuthorByline`, `RelatedPosts`**

`components/szz/blog/article-hero.tsx`:
```tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/lib/wp-map";

export function ArticleHero({ post }: { post: Post }) {
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: "var(--szz-text-dim)" }}>
        <Link href="/blog" style={{ color: "var(--szz-text-dim)" }}>Newsroom</Link>
        {post.category && (
          <> / <Link href={`/blog/category/${post.category.slug}`} style={{ color: post.category.colorVar }}>{post.category.name}</Link></>
        )}
      </nav>
      {post.category && (
        <Badge variant="outline" style={{ alignSelf: "flex-start", color: post.category.colorVar, borderColor: post.category.colorVar }}>{post.category.name}</Badge>
      )}
      <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "clamp(30px,5vw,44px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1.5px", color: "var(--szz-text-primary)" }}>{post.title}</h1>
      <div style={{ display: "flex", gap: 10, fontSize: 13.5, color: "var(--szz-text-dim)" }}>
        <span>{post.dateLabel}</span><span>·</span><span>{post.readingMinutes} min read</span>
      </div>
      {post.featuredImage && (
        <Image src={post.featuredImage.url} alt={post.featuredImage.alt} width={post.featuredImage.width ?? 1200} height={post.featuredImage.height ?? 630} style={{ width: "100%", height: "auto", borderRadius: 14, marginTop: 8 }} priority />
      )}
    </header>
  );
}
```

`components/szz/blog/article-toc.tsx`:
```tsx
import type { TocItem } from "@/lib/wp-prose";

export function ArticleToc({ toc }: { toc: TocItem[] }) {
  if (!toc.length) return null;
  return (
    <nav aria-label="On this page" style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--szz-text-faint)" }}>On this page</span>
      {toc.map((t) => (
        <a key={t.id} href={`#${t.id}`} style={{ fontSize: 14, lineHeight: 1.4, color: "var(--szz-text-muted)", paddingLeft: t.level === 3 ? 12 : 0 }}>{t.label}</a>
      ))}
    </nav>
  );
}
```

`components/szz/blog/author-byline.tsx`:
```tsx
import Image from "next/image";
import type { Author } from "@/lib/wp-map";

export function AuthorByline({ author }: { author: Author }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, border: "1px solid var(--szz-border)", borderRadius: 12, background: "var(--szz-bg-card)", padding: "16px 20px" }}>
      {author.avatarUrl && (
        <Image src={author.avatarUrl} alt={author.name} width={44} height={44} style={{ borderRadius: 999 }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: "var(--szz-text-primary)" }}>{author.name}</span>
        {author.description && <span style={{ fontSize: 13, color: "var(--szz-text-muted)" }}>{author.description}</span>}
      </div>
    </div>
  );
}
```

`components/szz/blog/related-posts.tsx`:
```tsx
import { PostCard } from "@/components/szz/blog/post-card";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import type { PostSummary } from "@/lib/wp-map";

export function RelatedPosts({ posts }: { posts: PostSummary[] }) {
  if (!posts.length) return null;
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionEyebrow>Keep reading</SectionEyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {posts.map((p) => <PostCard key={p.slug} post={p} />)}
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Verify typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add components/szz/blog app/globals.css
git commit -m "feat(blog): branded blog components + prose styling"
```

---

### Task 7: Blog routes (index, pagination, article, category)

**Files:**
- Create: `app/(site)/blog/page.tsx` (index, page 1)
- Create: `app/(site)/blog/page/[n]/page.tsx` (index pages 2+)
- Create: `app/(site)/blog/[slug]/page.tsx` (article)
- Create: `app/(site)/blog/category/[slug]/page.tsx` (category)
- Create: `components/szz/blog/blog-index-view.tsx` (shared index body, DRY between page 1 and /page/[n])

**Interfaces:**
- Consumes: `getPosts`, `getPost`, `getCategories`, `getCategory` (Task 4); all components (Task 6); `articleMetadata`, `blogPostingJsonLd`, `blogBreadcrumb` (Task 5); `pageMetadataFor` from `lib/seo.ts`; `JsonLdScript` + `BreadcrumbJsonLd` from `next-seo` (see `app/layout.tsx`/legal page for usage).
- Produces: the live routes.

Per-page constants in every file: `export const revalidate = 600;`

- [ ] **Step 1: Shared index view component**

`components/szz/blog/blog-index-view.tsx`:
```tsx
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { CategoryRail } from "@/components/szz/blog/category-rail";
import { BlogFeatured } from "@/components/szz/blog/blog-featured";
import { PostCard } from "@/components/szz/blog/post-card";
import { Pagination } from "@/components/szz/blog/pagination";
import type { PostSummary, Category } from "@/lib/wp-map";

export function BlogIndexView({
  featured, posts, categories, page, totalPages,
}: {
  featured: PostSummary | null;
  posts: PostSummary[];
  categories: Category[];
  page: number;
  totalPages: number;
}) {
  return (
    <div>
      <section style={{ borderBottom: "1px solid var(--szz-border)", background: "var(--szz-bg-card)", padding: "80px 48px 50px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
          <SectionEyebrow>Newsroom</SectionEyebrow>
          <h1 style={{ margin: 0, maxWidth: 760, fontFamily: "var(--font-heading)", fontSize: 46, fontWeight: 700, lineHeight: 1.06, letterSpacing: "-1.5px", color: "var(--szz-text-primary)" }}>Field notes for getting online.</h1>
          <p style={{ margin: 0, maxWidth: 600, fontSize: 17, lineHeight: 1.6, color: "var(--szz-text-muted)" }}>Plain-English guides to hosting, WordPress, domains and running a small business on the web — written by the people who keep it all running.</p>
          <div style={{ marginTop: 8 }}><CategoryRail categories={categories} /></div>
        </div>
      </section>
      <section style={{ padding: "48px 48px 90px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>
          {page === 1 && featured && <BlogFeatured post={featured} />}
          {posts.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
              {posts.map((p) => <PostCard key={p.slug} post={p} />)}
            </div>
          ) : (
            <p style={{ color: "var(--szz-text-muted)", fontSize: 16 }}>No posts published yet — check back soon.</p>
          )}
          <Pagination basePath="/blog" page={page} totalPages={totalPages} />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Index page 1**

`app/(site)/blog/page.tsx`:
```tsx
import type { Metadata } from "next";
import { getPosts, getCategories } from "@/lib/wordpress";
import { pageMetadataFor } from "@/lib/seo";
import { BlogIndexView } from "@/components/szz/blog/blog-index-view";

export const revalidate = 600;
export const metadata: Metadata = pageMetadataFor("/blog");

export default async function BlogIndexPage() {
  try {
    const [{ posts, totalPages }, categories] = await Promise.all([getPosts({ perPage: 10 }), getCategories()]);
    const [featured, ...rest] = posts;
    return <BlogIndexView featured={featured ?? null} posts={rest} categories={categories} page={1} totalPages={totalPages} />;
  } catch {
    return <BlogIndexView featured={null} posts={[]} categories={[]} page={1} totalPages={1} />;
  }
}
```

- [ ] **Step 3: Index pages 2+**

`app/(site)/blog/page/[n]/page.tsx`:
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPosts, getCategories } from "@/lib/wordpress";
import { pageMetadataFor } from "@/lib/seo";
import { BlogIndexView } from "@/components/szz/blog/blog-index-view";

export const revalidate = 600;
export const metadata: Metadata = pageMetadataFor("/blog");

export default async function BlogIndexPaged({ params }: { params: Promise<{ n: string }> }) {
  const { n } = await params;
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2) notFound();
  try {
    const [{ posts, totalPages }, categories] = await Promise.all([getPosts({ perPage: 10, page }), getCategories()]);
    if (!posts.length) notFound();
    return <BlogIndexView featured={null} posts={posts} categories={categories} page={page} totalPages={totalPages} />;
  } catch {
    notFound();
  }
}
```

- [ ] **Step 4: Article page**

`app/(site)/blog/[slug]/page.tsx`:
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbJsonLd, JsonLdScript } from "next-seo";
import { getPost, getPosts } from "@/lib/wordpress";
import { articleMetadata, blogPostingJsonLd, blogBreadcrumb } from "@/lib/blog-seo";
import { ArticleHero } from "@/components/szz/blog/article-hero";
import { ArticleToc } from "@/components/szz/blog/article-toc";
import { BlogProse } from "@/components/szz/blog/blog-prose";
import { AuthorByline } from "@/components/szz/blog/author-byline";
import { RelatedPosts } from "@/components/szz/blog/related-posts";

export const revalidate = 600;

export async function generateStaticParams() {
  try {
    const { posts } = await getPosts({ perPage: 100 });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  return post ? articleMetadata(post) : {};
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug).catch(() => null);
  if (!post) notFound();

  let related: Awaited<ReturnType<typeof getPosts>>["posts"] = [];
  try {
    const { posts } = await getPosts({ perPage: 4, categoryId: post.category?.id });
    related = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
  } catch { /* related is best-effort */ }

  return (
    <article style={{ padding: "60px 48px 90px" }}>
      <BreadcrumbJsonLd items={blogBreadcrumb(post)} />
      <JsonLdScript data={blogPostingJsonLd(post)} scriptKey="blog-posting" />
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 240px", gap: 48, alignItems: "start" }}>
        <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 32 }}>
          <ArticleHero post={post} />
          <BlogProse html={post.contentHtml} />
          {post.author && <AuthorByline author={post.author} />}
          <RelatedPosts posts={related} />
        </div>
        <aside><ArticleToc toc={post.toc} /></aside>
      </div>
    </article>
  );
}
```
Note: `JsonLdScript` here uses `scriptKey` + `data`, matching the existing usage in `app/layout.tsx:140` (verified).

- [ ] **Step 5: Category page**

`app/(site)/blog/category/[slug]/page.tsx`:
```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory, getCategories, getPosts } from "@/lib/wordpress";
import { pageMetadata } from "@/lib/seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { CategoryRail } from "@/components/szz/blog/category-rail";
import { PostCard } from "@/components/szz/blog/post-card";
import { Pagination } from "@/components/szz/blog/pagination";

export const revalidate = 600;

export async function generateStaticParams() {
  try {
    return (await getCategories()).map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategory(slug).catch(() => null);
  if (!cat) return {};
  return pageMetadata({
    title: `${cat.name} — SERVERIZZ Newsroom`,
    description: cat.description || `${cat.name} guides and updates from the SERVERIZZ Newsroom.`,
    path: `/blog/category/${cat.slug}`,
  });
}

export default async function CategoryPage({
  params, searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const cat = await getCategory(slug).catch(() => null);
  if (!cat) notFound();

  let posts: Awaited<ReturnType<typeof getPosts>>["posts"] = [];
  let totalPages = 1;
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  try {
    const [res, cats] = await Promise.all([getPosts({ categoryId: cat.id, perPage: 10, page }), getCategories()]);
    posts = res.posts; totalPages = res.totalPages; categories = cats;
  } catch { /* render empty state below */ }

  return (
    <div>
      <section style={{ borderBottom: "1px solid var(--szz-border)", background: "var(--szz-bg-card)", padding: "80px 48px 50px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
          <SectionEyebrow>Newsroom</SectionEyebrow>
          <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 42, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1.5px", color: cat.colorVar }}>{cat.name}</h1>
          {cat.description && <p style={{ margin: 0, maxWidth: 600, fontSize: 17, lineHeight: 1.6, color: "var(--szz-text-muted)" }}>{cat.description}</p>}
          <div style={{ marginTop: 8 }}><CategoryRail categories={categories} activeSlug={cat.slug} /></div>
        </div>
      </section>
      <section style={{ padding: "48px 48px 90px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>
          {posts.length ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
              {posts.map((p) => <PostCard key={p.slug} post={p} />)}
            </div>
          ) : (
            <p style={{ color: "var(--szz-text-muted)", fontSize: 16 }}>No posts in this category yet.</p>
          )}
          <Pagination basePath={`/blog/category/${cat.slug}`} page={page} totalPages={totalPages} />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 6: Verify build + typecheck**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS. (Fix any `next-seo` prop-name mismatch flagged here.)

- [ ] **Step 7: Commit**

```bash
git add "app/(site)/blog" components/szz/blog/blog-index-view.tsx
git commit -m "feat(blog): index, pagination, article, and category routes"
```

---

### Task 8: RSS feed + sitemap integration

**Files:**
- Create: `app/(site)/blog/feed.xml/route.ts`
- Modify: `app/sitemap.ts`
- Test: `app/sitemap.test.ts` (only if a sitemap test does not already exist; otherwise extend it)

**Interfaces:**
- Consumes: `getPosts`, `getCategories` (Task 4); `SITE_URL`, `SITE_NAME`, `SITE_DESCRIPTION`, `ROUTES` from `lib/seo.ts`.

- [ ] **Step 1: RSS route handler**

`app/(site)/blog/feed.xml/route.ts`:
```typescript
import { getPosts } from "@/lib/wordpress";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

export const revalidate = 3600;

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export async function GET() {
  let items = "";
  try {
    const { posts } = await getPosts({ perPage: 20 });
    items = posts
      .map((p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${SITE_URL}/blog/${p.slug}</link>
      <guid>${SITE_URL}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
    </item>`)
      .join("\n");
  } catch { /* empty feed on WP outage */ }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)} Newsroom</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
```

- [ ] **Step 2: Extend the sitemap (async + blog URLs)**

Replace `app/sitemap.ts`:
```typescript
import type { MetadataRoute } from "next";
import { ROUTES, SITE_URL } from "@/lib/seo";
import { getPosts, getCategories } from "@/lib/wordpress";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const base: MetadataRoute.Sitemap = ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency,
    priority,
  }));

  let blog: MetadataRoute.Sitemap = [];
  try {
    const [{ posts }, categories] = await Promise.all([getPosts({ perPage: 100 }), getCategories()]);
    blog = [
      ...posts.map((p) => ({
        url: `${SITE_URL}/blog/${p.slug}`,
        lastModified: new Date(p.modified || p.date),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
      ...categories.map((c) => ({
        url: `${SITE_URL}/blog/category/${c.slug}`,
        lastModified,
        changeFrequency: "weekly" as const,
        priority: 0.5,
      })),
    ];
  } catch { /* sitemap still renders static routes if WP is down */ }

  return [...base, ...blog];
}
```

- [ ] **Step 3: Verify build + typecheck**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add "app/(site)/blog/feed.xml" app/sitemap.ts
git commit -m "feat(blog): RSS feed and sitemap blog URLs"
```

---

### Task 9: Full verification against live WordPress

**Files:** none (verification only)

- [ ] **Step 1: Run the whole test suite**

Run: `npm run test`
Expected: PASS — all blog tests + existing suite green.

- [ ] **Step 2: Production build**

Run: `npm run build`
Expected: build succeeds; `/blog`, `/blog/[slug]`, `/blog/category/[slug]`, `/blog/page/[n]`, `/blog/feed.xml`, `/sitemap.xml` appear in the route output. `generateStaticParams` prebuilds the one live post + Uncategorized category.

- [ ] **Step 3: Manual smoke test (dev) against live WP**

Run: `npm run dev`, then verify in a browser:
- `http://localhost:3000/blog` — renders the Newsroom header, category rail, the live post (as featured), no crash on the near-empty instance.
- `http://localhost:3000/blog/<slug-of-live-post>` — article renders prose, byline, breadcrumb; missing featured image shows the placeholder, not a broken image.
- `http://localhost:3000/blog/category/uncategorized` — lists the post.
- `http://localhost:3000/blog/feed.xml` — valid RSS XML with the post.
- `http://localhost:3000/blog/does-not-exist` — 404 page.

Confirm each; note anything that needs a follow-up.

- [ ] **Step 4: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix(blog): address issues found during verification"
```

(If no fixes were needed, skip this commit.)

---

## Self-Review

**Spec coverage:**
- REST connection → Task 4. ISR (`revalidate`) → every route (Task 7/8) + Global Constraints. Styled prose → Task 2 + Task 6 (`.szz-prose`, `BlogProse`). Index/article/category → Task 7. Pagination → Task 6 (`Pagination`) + Task 7 routes. RSS + sitemap → Task 8. Category color-by-slug → Task 3 (`categoryColorVar`). Reading time + TOC → Task 2/3. SEO registry extension + BlogPosting + breadcrumbs → Task 5. `next/image` + remotePatterns → Task 1 + components. Error/empty states → Task 7 try/catch + empty copy. Tests → Tasks 2–5 + Task 9. Env var → Task 1. ✓ All spec sections covered.
- Out-of-scope items (search, comments, block mapping, webhook) correctly omitted.

**Placeholder scan:** No TBD/TODO. Every code step shows complete code. The `next-seo` `JsonLdScript` prop name (`scriptKey` + `data`) was verified against `app/layout.tsx:140`.

**Type consistency:** `PostSummary`/`Post`/`Category`/`PostCategory`/`Author`/`FeaturedImage`/`TocItem` defined in Task 2/3 and used with identical names/shapes in Tasks 4–8. Client fns `getPosts({page,perPage,categoryId})`, `getPost(slug)`, `getCategories()`, `getCategory(slug)` consistent across Task 4 definition and Task 7/8 callers. `categoryColorVar` returns a `var(--…)` string everywhere. `Pagination` `basePath`/`page`/`totalPages` consistent. ✓

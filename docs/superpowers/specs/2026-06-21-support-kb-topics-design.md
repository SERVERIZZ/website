# Live ClientExec KB Topics on /support — Design

**Date:** 2026-06-21

## Goal

Replace the hardcoded "Popular help topics" links on `/support` (which currently
point to internal marketing pages) with live links to articles from the
ClientExec knowledge base at `go.serverizz.com`. Each link opens the KB article
in a new tab.

## Context & Constraints

- `/support` is `app/(site)/support/page.tsx`, a server component. It already
  renders a "Popular help topics" card (currently a hardcoded `topics` array of
  4 internal `next/link` items).
- ClientExec is reached today via `lib/clientexec.ts` (domain search, login,
  register). `CE_URL` defaults to `https://go.serverizz.com`.
- The public KB lives at:
  `https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=main`
- The repo's external-link convention is `target="_blank" rel="noopener noreferrer"`.
- No HTML-parsing dependency exists (cheerio/jsdom). We will not add one.

### Key finding: no popularity signal

The public KB exposes **no view-count / "most viewed" / "popular" data**. The
main page lists 4 categories, each with its first 5 articles plus a "SHOW ALL"
link. "Popular" must therefore be defined from what is available.

Categories observed (id → name): `9` Managing Domains in cPanel, `8` Managing
Email in cPanel, `12` WordPress, `7` Files & Websites.

Article anchors have a stable shape:
`href="https://go.serverizz.com/index.php?fuse=knowledgebase&controller=articles&view=article&articleId=N">Title</a>`

## Definition of "Popular Topics"

Use the **lead (first) article of each of the 4 categories** — 4 links with
broad topical coverage:

| Category | Lead article | articleId |
|----------|--------------|-----------|
| Managing Domains in cPanel | Types of Domain Names | 22 |
| Managing Email in cPanel | Where to Find Email Tools | 10 |
| WordPress | Opening WP Toolkit | 42 |
| Files & Websites | Understanding the File Structure | 1 |

This maps onto the existing 4-item card. (Rejected alternative: first N articles
overall — they all come from one category, so breadth is poor.)

## Architecture

Mirror the existing `lib/clientexec.ts` server-side pattern.

### `getPopularKbTopics()` — new export in `lib/clientexec.ts`

- Fetches the KB main URL with `next: { revalidate: 86400 }` (same daily cache
  as `getTldPricing`).
- Parses the response HTML with a scoped regex over the article-anchor pattern
  (no new dependency; markup is a stable ClientExec template).
- Groups matched anchors by their preceding category and returns the **first
  article per category**, in category document order, as
  `{ title: string; href: string }[]`.
- Returns an absolute `href` (the KB anchors are already absolute).

```ts
export type KbTopic = { title: string; href: string };
export async function getPopularKbTopics(): Promise<KbTopic[]>;
```

### `/support` page

- Becomes an `async` server component.
- Calls `getPopularKbTopics()` at render time and maps the result into the
  "Popular help topics" card.
- No client JS and no API route — this is render-time data, not user input
  (unlike domain search, which needs a route handler).

## Rendering / UX

- Reuse the existing "Popular help topics" card markup
  (`app/(site)/support/page.tsx`).
- Replace the internal `next/link` items with plain external anchors:
  `target="_blank" rel="noopener noreferrer"`, keeping the `→ ` label prefix,
  `szz-link-accent` class, and `fontSize: 14`.
- Remove the now-unused hardcoded `topics` array.

## Error Handling / Fallback

If the fetch fails, the response is unparseable, or zero articles are matched,
`getPopularKbTopics()` returns a small hardcoded fallback list of real KB
article links (the 4 category leads above, with their captured `articleId`
URLs). The card therefore never renders empty and the page never breaks —
the same defensive posture as `checkDomain`'s try/catch returning safe defaults.

## Testing

Following `lib/clientexec.test.ts`:

- **Parser, happy path:** given a captured KB-main HTML fixture, extracts the
  correct title + href for the lead article of each category (4 items, correct
  order).
- **Fallback:** empty string / garbage HTML / fetch rejection → returns the
  hardcoded fallback list (non-empty, valid `articleId` URLs).

## Out of Scope

- The search box and contact form on `/support` (unchanged).
- Any popularity ranking (data not available).
- A full KB browse/landing experience on the marketing site.

# SEO Services Page — Design

**Date:** 2026-06-25
**Route:** `/services/seo`
**Status:** Approved (pending spec review)

## Goal

Ship the SEO services page that the site nav already promises. The `SERVERIZZ Website.dc.html`
design (from the claude.ai/design project) adds a **Services** dropdown with two items —
**Web & Software** (already live at `/services/web-development`) and **SEO**, which links to a page
that does not exist yet. This spec builds that page and wires it in.

The page is a direct sibling of the existing Web & Software page and reuses its exact visual
primitives and section rhythm, so the two read as one family. All copy and pricing below were
provided by the owner and are used verbatim.

## Architecture

- **`app/(site)/services/seo/page.tsx`** — server component. Owns metadata, breadcrumb + Service
  JSON-LD, and all non-interactive sections (hero, how-it-works, à la carte, CTA). Mirrors the
  structure of `app/(site)/services/web-development/page.tsx`.
- **`components/szz/seo-plans.tsx`** — `"use client"` component for the pricing block only, because
  it has an interactive Monthly/Annual billing toggle. This follows the existing pattern in
  `components/szz/plan-pricing.tsx` (a client pricing island embedded in otherwise-server pages).
  The page imports and renders it inside the Plans section.

Shared primitives reused as-is: `SectionEyebrow`, `Card`, `Badge`, `Button`, `Stat`, and the
`.szz-grid-2/3/4` / `.fill-cards` layout classes.

## Page content (verbatim)

### 1. Hero
- Eyebrow: `// Search_Engine_Optimization`
- H1: **Get found. Get traffic. Get customers.**
- Subhead: *Managed SEO that runs in the background while you run your business. We handle the
  technical work, the content, and the reporting — you watch the rankings climb.*
- Buttons: **Get a free audit** → `/support`, **Talk to us** → `/support`
- Stat row (3×, using `Stat`):
  - `24/7` — continuous optimization
  - `100%` — managed for you
  - `AI-ready` — visibility in ChatGPT & Gemini

### 2. Plans — "Pick a plan. We do the rest." (`components/szz/seo-plans.tsx`)
Billing toggle: **Monthly** / **Annual** with a **Save ~11%** badge on Annual. The toggle switches
only the three tier prices and the price note. Monthly is the default-selected option; each tier
shows a `$X` figure with `/mo` and a note that reads **"per month, billed monthly"** (Monthly) or
**"per month, billed annually"** (Annual). The savings figure is stored as one editable constant.

Three priced tiers in a 3-up grid:

| Tier | Monthly | Annual (billed annually) | Blurb | CTA | "Best for" footnote |
|---|---|---|---|---|---|
| **Foundation** | $169/mo | $149/mo | For a single site that needs to rank. | Start with Foundation | Best for new sites & single local businesses. |
| **Growth** *(Most popular)* | $449/mo | $399/mo | Active content and local presence. | Choose Growth | Best for growing local & service businesses. |
| **Authority** | $899/mo | $799/mo | Authority signals and AI-search visibility. | Choose Authority | Best for competitive niches & market leaders. |

Tier feature checklists:
- **Foundation:** Continuous technical SEO · On-page optimization of key pages · Keyword rank
  tracking · Clear monthly performance report · Hands-off — we run it for you
- **Growth:** Everything in Foundation · Managed content — fresh articles each month · Local SEO &
  Google Business Profile · Expanded keyword targeting · Monthly strategy report
- **Authority:** Everything in Growth · Digital PR & press distribution · Backlink & citation
  building · AI-search visibility tracking · Priority handling & monthly review

All three CTAs link to `/support` (no checkout exists for SEO retainers).

Below the grid, a full-width **Custom & Multi-Location** band:
*Ecommerce, multi-location and large-catalog sites — scoped and priced to your footprint.* →
**Request a quote** (`/support`).

### 3. How it works — `// How_it_works` "Set it, and watch it climb"
Three numbered steps (reusing the web-dev "how we work" step layout):
- **01 — Free audit & roadmap:** We scan your site, find what's holding it back, and map the plan —
  before you commit a dollar.
- **02 — We do the work:** Technical fixes, on-page optimization, content and authority — handled by
  us, every month.
- **03 — You get the report:** A clear monthly report shows rankings, traffic and exactly what we
  shipped. No jargon.

### 4. À la carte — "Add more when you need it"
Five `Card`s (each has a description, so cards rather than the web-dev two-column price list):

| Item | Price | Description |
|---|---|---|
| Extra managed article | $79 | An additional optimized article, written and published for you. |
| Press release | $149 | A distributed press release to build authority and reach. |
| Backlink pack (10) | $199 | Ten quality backlinks from relevant, credible sources. |
| Additional location | $99/mo | Local SEO for another business location or service area. |
| SEO audit & roadmap | $199 | A one-time deep audit with a prioritized action plan to keep. |

### 5. CTA — "Not ranking where you should be?"
*Start with a free audit. We'll show you exactly where you stand and what it takes to climb — no
obligation.* → **Get a free audit** (`/support`). Reuses the web-dev `Card glow` CTA layout.

## Wiring (so the page is reachable and indexed)

1. **`components/szz/site-nav.tsx`** — import `TrendingUp` from lucide-react; add
   `{ href: "/services/seo", label: "SEO", Icon: TrendingUp }` to the **Services** group's `items`.
   (The design uses the `trending-up` icon for this link.) Works in both desktop dropdown and mobile
   nav automatically.
2. **`components/szz/site-footer.tsx`** — add `{ label: "SEO", href: "/services/seo" }` to the
   **SERVICES** column, after "Web & Software".
3. **`lib/seo.ts`** — add a `PAGE_SEO` entry immediately after `/services/web-development`:
   - `path: "/services/seo"`
   - `name: "SEO"`
   - `title: "Managed SEO Services — Technical SEO, Content & Local"`
   - `description: "Managed SEO for small business — technical, content and local optimization
     handled for you, with clear monthly reporting and AI-search visibility in ChatGPT and Gemini.
     Start with a free audit."`
   - `targetKeyword: "managed SEO services"`
   - `cluster: ["local SEO", "technical SEO", "SEO content marketing", "AI search optimization"]`
   - `jsonLd: "Service"`, `serviceType: "Search engine optimization"`
   - `changeFrequency: "monthly"`, `priority: 0.8`

   This single entry auto-propagates to the sitemap, breadcrumb names, and Service JSON-LD via the
   existing helpers. `lib/seo.test.ts` validates the new entry with no test changes required.

## Out of scope (YAGNI)

- No SEO checkout / billing flow — every CTA routes to `/support`.
- No nav/footer restructuring beyond the single SEO link (the pasted design's other nav/footer
  differences — e.g. "Reseller", omitted "Dedicated" — are not part of this task).
- No annual-vs-monthly logic beyond the three tier prices (à la carte and Custom are unaffected).

## Testing / verification

- `lib/seo.test.ts` (existing) exercises the new `PAGE_SEO` entry.
- Run the project's lint, typecheck, and test scripts; confirm the new route builds.
- Manual: page renders, billing toggle flips all three tier prices and the savings note, nav
  dropdown + footer link navigate to `/services/seo`, and the route appears in the sitemap.

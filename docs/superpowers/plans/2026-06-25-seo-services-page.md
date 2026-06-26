# SEO Services Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/services/seo` page (the Services-dropdown link that has no page yet) and wire it into the nav, footer, and SEO registry.

**Architecture:** A server component page (`app/(site)/services/seo/page.tsx`) owns metadata, JSON-LD, and all static sections, mirroring the existing Web & Software page. The interactive Monthly/Annual pricing block is isolated in a `"use client"` island (`components/szz/seo-plans.tsx`), following the existing `plan-pricing.tsx` pattern. One `PAGE_SEO` entry in `lib/seo.ts` auto-propagates to sitemap, breadcrumbs, and Service JSON-LD.

**Tech Stack:** Next.js (App Router), React, TypeScript, next-seo (JSON-LD only), vitest. Styling is inline styles + design-system CSS classes (`.szz-*`) and CSS custom properties — no Tailwind on these pages.

## Global Constraints

- **Spec:** `docs/superpowers/specs/2026-06-25-seo-services-page-design.md` — all copy/pricing is verbatim from it.
- **Branch:** Work on `feat/seo-services-page`. Do **not** commit to or push `main` — pushing `main` triggers a production deploy. No pushing at all unless the user asks.
- **Prices (verbatim):** Foundation $169/mo · $149/mo annual. Growth $449/mo · $399/mo annual (Most popular). Authority $899/mo · $799/mo annual. Annual badge: **"Save ~11%"**.
- **À la carte (verbatim):** Extra managed article $79 · Press release $149 · Backlink pack (10) $199 · Additional location $99/mo · SEO audit & roadmap $199.
- **All CTAs link to `/support`** (no SEO checkout exists).
- **JSX escaping:** ESLint enforces `react/no-unescaped-entities`. Keep copy containing `'`, `"`, or `&` inside **JS string constants/arrays** (rendered via `{expr}`), never as literal JSX text. The only literal JSX text with a special char is the Custom band heading — write it as `Custom &amp; Multi-Location`.
- **Verification gates (run from project root):** `npm run lint`, `npm test`, `npm run build`. There is no separate typecheck script — `next build` is the type gate. There is no React Testing Library, so UI components are verified by lint + build, not unit tests.

---

### Task 1: Register `/services/seo` in the SEO registry

**Files:**
- Modify: `lib/seo.ts` (insert a `PAGE_SEO` entry immediately after the `/services/web-development` entry, before `/domains`)
- Test: `lib/seo.test.ts` (add one focused test)

**Interfaces:**
- Consumes: existing `seoFor(path)`, `serviceJsonLd(path)`, `PageSeo` type from `lib/seo.ts`.
- Produces: a registered page at path `/services/seo` with `name: "SEO"`, `jsonLd: "Service"`, `serviceType: "Search engine optimization"`. Consumed by Task 3 (`pageMetadataFor`, `breadcrumbTrail`, `serviceJsonLd`) and Task 4 indirectly (sitemap/footer).

- [ ] **Step 1: Write the failing test**

Add to `lib/seo.test.ts`, inside the existing `describe("PAGE_SEO registry", ...)` block (after the "commercial titles" test):

```ts
  it("registers the SEO services page as a Service", () => {
    const seo = seoFor("/services/seo");
    expect(seo.name).toBe("SEO");
    expect(seo.title).toMatch(/SEO/i);
    expect(seo.jsonLd).toBe("Service");
    const data = serviceJsonLd("/services/seo");
    expect(data.serviceType).toBe("Search engine optimization");
  });
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- lib/seo.test.ts`
Expected: FAIL — `seoFor("/services/seo")` throws `No PAGE_SEO entry for "/services/seo"`.

- [ ] **Step 3: Add the registry entry**

In `lib/seo.ts`, find the `/services/web-development` object inside the `PAGE_SEO` array. Immediately **after** its closing `},` (and before the `/domains` entry), insert:

```ts
  {
    path: "/services/seo",
    name: "SEO",
    title: "Managed SEO Services — Technical SEO, Content & Local",
    description:
      "Managed SEO for small business — technical, content and local optimization handled for you, with clear monthly reporting and AI-search visibility in ChatGPT and Gemini. Start with a free audit.",
    targetKeyword: "managed SEO services",
    cluster: [
      "local SEO",
      "technical SEO",
      "SEO content marketing",
      "AI search optimization",
    ],
    jsonLd: "Service",
    serviceType: "Search engine optimization",
    changeFrequency: "monthly",
    priority: 0.8,
  },
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- lib/seo.test.ts`
Expected: PASS (all tests in the file, including the new one and the generic registry-shape checks).

- [ ] **Step 5: Commit**

```bash
git add lib/seo.ts lib/seo.test.ts
git commit -m "feat(seo): register /services/seo in PAGE_SEO registry"
```

---

### Task 2: Build the client pricing island (`SeoPlans`)

**Files:**
- Create: `components/szz/seo-plans.tsx`

**Interfaces:**
- Consumes: `Card`, `Badge`, `Button` (from `@/components/ui/*`), `Link` (next/link). Pure presentational — no props.
- Produces: `export function SeoPlans(): JSX.Element` — renders a centered Monthly/Annual toggle plus a 3-up grid of tier cards. Consumed by Task 3.

- [ ] **Step 1: Create the component**

Create `components/szz/seo-plans.tsx` with exactly:

```tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const display = "var(--font-heading)";
const mono = "var(--font-mono)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";
const dim = "var(--szz-text-dim)";

/** Annual savings vs monthly — shown on the billing toggle. Keep in sync with the prices below. */
const ANNUAL_SAVINGS_LABEL = "Save ~11%";

type Tier = {
  name: string;
  blurb: string;
  monthly: string;
  annual: string;
  cta: string;
  bestFor: string;
  popular?: boolean;
  variant: "primary" | "secondary";
  features: string[];
};

const tiers: Tier[] = [
  {
    name: "SEO Foundation",
    blurb: "For a single site that needs to rank.",
    monthly: "169",
    annual: "149",
    cta: "Start with Foundation",
    bestFor: "Best for new sites & single local businesses.",
    variant: "secondary",
    features: [
      "Continuous technical SEO",
      "On-page optimization of key pages",
      "Keyword rank tracking",
      "Clear monthly performance report",
      "Hands-off — we run it for you",
    ],
  },
  {
    name: "SEO Growth",
    blurb: "Active content and local presence.",
    monthly: "449",
    annual: "399",
    cta: "Choose Growth",
    bestFor: "Best for growing local & service businesses.",
    popular: true,
    variant: "primary",
    features: [
      "Everything in Foundation",
      "Managed content — fresh articles each month",
      "Local SEO & Google Business Profile",
      "Expanded keyword targeting",
      "Monthly strategy report",
    ],
  },
  {
    name: "SEO Authority",
    blurb: "Authority signals and AI-search visibility.",
    monthly: "899",
    annual: "799",
    cta: "Choose Authority",
    bestFor: "Best for competitive niches & market leaders.",
    variant: "secondary",
    features: [
      "Everything in Growth",
      "Digital PR & press distribution",
      "Backlink & citation building",
      "AI-search visibility tracking",
      "Priority handling & monthly review",
    ],
  },
];

function Check() {
  return <span style={{ color: "var(--szz-green)", fontWeight: 700 }}>✓</span>;
}

export function SeoPlans() {
  const [billing, setBilling] = React.useState<"monthly" | "annual">("monthly");
  const annual = billing === "annual";
  const billNote = annual ? "per month, billed annually" : "per month, billed monthly";

  const toggleBtn = (active: boolean): React.CSSProperties => ({
    border: "none",
    cursor: "pointer",
    borderRadius: 999,
    padding: "8px 18px",
    fontFamily: "var(--font-body)",
    fontSize: 14,
    fontWeight: 600,
    background: active ? "var(--szz-cta-blue)" : "transparent",
    color: active ? "#ffffff" : muted,
    display: "flex",
    alignItems: "center",
    gap: 8,
  });

  return (
    <>
      {/* billing toggle (centered) */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--szz-bg-card)",
            border: "1px solid var(--szz-border)",
            borderRadius: 999,
            padding: 5,
          }}
        >
          <button type="button" onClick={() => setBilling("monthly")} style={toggleBtn(!annual)}>
            Monthly
          </button>
          <button type="button" onClick={() => setBilling("annual")} style={toggleBtn(annual)}>
            Annual{" "}
            <span
              style={{
                fontFamily: mono,
                fontSize: 10,
                letterSpacing: ".5px",
                color: annual ? "#ffffff" : "var(--szz-green)",
              }}
            >
              {ANNUAL_SAVINGS_LABEL}
            </span>
          </button>
        </div>
      </div>

      {/* tier cards */}
      <div
        className="szz-grid-3 fill-cards"
        style={{ maxWidth: 1080, margin: "36px auto 0", alignItems: "stretch" }}
      >
        {tiers.map((tier) => (
          <Card key={tier.name} popular={tier.popular} style={{ height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
              {tier.popular ? (
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <span style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>
                    {tier.name}
                  </span>
                  <Badge variant="accent">Most popular</Badge>
                </div>
              ) : (
                <span style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>
                  {tier.name}
                </span>
              )}
              <span style={{ fontSize: 13, color: muted }}>{tier.blurb}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span
                  style={{
                    fontFamily: display,
                    fontSize: 40,
                    fontWeight: 700,
                    color: tier.popular ? "var(--szz-accent-blue)" : primary,
                  }}
                >
                  ${annual ? tier.annual : tier.monthly}
                </span>
                <span style={{ fontSize: 15, color: dim }}>/mo</span>
              </div>
              <span style={{ fontFamily: mono, fontSize: 12, color: dim, marginTop: -8 }}>
                {billNote}
              </span>
              <Button asChild variant={tier.variant} size="md" style={{ width: "100%" }}>
                <Link href="/support">{tier.cta}</Link>
              </Button>
              <div style={{ height: 1, background: "var(--szz-border)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tier.features.map((f) => (
                  <div
                    key={f}
                    style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: light }}
                  >
                    <Check /> {f}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 12, color: dim, marginTop: "auto" }}>{tier.bestFor}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Verify it lints and type-checks**

Run: `npm run lint`
Expected: PASS (no errors for `components/szz/seo-plans.tsx`).

- [ ] **Step 3: Commit**

```bash
git add components/szz/seo-plans.tsx
git commit -m "feat(seo): add SeoPlans billing-toggle pricing island"
```

---

### Task 3: Build the SEO page

**Files:**
- Create: `app/(site)/services/seo/page.tsx`

**Interfaces:**
- Consumes: `pageMetadataFor`, `breadcrumbTrail`, `serviceJsonLd` (Task 1), `SeoPlans` (Task 2), `SectionEyebrow`, `Card`, `Button`, `Stat`, `BreadcrumbJsonLd`/`JsonLdScript` (next-seo).
- Produces: the default-exported React page at route `/services/seo`.

- [ ] **Step 1: Create the page**

Create `app/(site)/services/seo/page.tsx` with exactly:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { BreadcrumbJsonLd, JsonLdScript } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Stat } from "@/components/szz/stat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SeoPlans } from "@/components/szz/seo-plans";
import { breadcrumbTrail, pageMetadataFor, serviceJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadataFor("/services/seo");

const display = "var(--font-heading)";
const mono = "var(--font-mono)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";

const heroBody =
  "Managed SEO that runs in the background while you run your business. We handle the technical work, the content, and the reporting — you watch the rankings climb.";

type Step = { num: string; title: string; body: string };

const steps: Step[] = [
  {
    num: "01",
    title: "Free audit & roadmap",
    body: "We scan your site, find what's holding it back, and map the plan — before you commit a dollar.",
  },
  {
    num: "02",
    title: "We do the work",
    body: "Technical fixes, on-page optimization, content and authority — handled by us, every month.",
  },
  {
    num: "03",
    title: "You get the report",
    body: "A clear monthly report shows rankings, traffic and exactly what we shipped. No jargon.",
  },
];

type AddOn = { label: string; price: string; description: string };

const addOns: AddOn[] = [
  {
    label: "Extra managed article",
    price: "$79",
    description: "An additional optimized article, written and published for you.",
  },
  {
    label: "Press release",
    price: "$149",
    description: "A distributed press release to build authority and reach.",
  },
  {
    label: "Backlink pack (10)",
    price: "$199",
    description: "Ten quality backlinks from relevant, credible sources.",
  },
  {
    label: "Additional location",
    price: "$99/mo",
    description: "Local SEO for another business location or service area.",
  },
  {
    label: "SEO audit & roadmap",
    price: "$199",
    description: "A one-time deep audit with a prioritized action plan to keep.",
  },
];

const h2 = (children: ReactNode, max?: number) => (
  <h2
    style={{
      margin: 0,
      fontFamily: display,
      fontSize: "clamp(24px, 4vw, 34px)",
      fontWeight: 700,
      lineHeight: 1.12,
      letterSpacing: "-1px",
      color: primary,
      ...(max ? { maxWidth: max } : {}),
    }}
  >
    {children}
  </h2>
);

export default function SeoPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={breadcrumbTrail("SEO", "/services/seo")} />
      <JsonLdScript
        id="seo-service-jsonld"
        scriptKey="seo-service-jsonld"
        data={serviceJsonLd("/services/seo")}
      />

      {/* hero */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          padding: "80px 24px 44px",
          maxWidth: 760,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <SectionEyebrow>Search_Engine_Optimization</SectionEyebrow>
        <h1
          style={{
            margin: 0,
            fontFamily: display,
            fontSize: "clamp(32px, 6vw, 48px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-1.5px",
            color: primary,
          }}
        >
          Get found. Get traffic. Get customers.
        </h1>
        <p style={{ margin: 0, maxWidth: 600, fontSize: 17, lineHeight: 1.6, color: muted }}>
          {heroBody}
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 6,
          }}
        >
          <Button asChild variant="primary" size="lg">
            <Link href="/support">Get a free audit</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/support">Talk to us</Link>
          </Button>
        </div>
        <div
          className="szz-grid-3"
          style={{ width: "100%", maxWidth: 620, margin: "16px auto 0", gap: 24 }}
        >
          <Stat center value="24/7" label="continuous optimization" />
          <Stat center value="100%" label="managed for you" />
          <Stat center value="AI-ready" label="visibility in ChatGPT & Gemini" />
        </div>
      </section>

      {/* plans */}
      <section style={{ padding: "60px 24px 30px" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto 28px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            textAlign: "center",
            alignItems: "center",
          }}
        >
          {h2("Pick a plan. We do the rest.")}
        </div>
        <SeoPlans />
        {/* custom & multi-location */}
        <div style={{ maxWidth: 1080, margin: "24px auto 0" }}>
          <Card surface="deep">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 640 }}>
                <span style={{ fontFamily: display, fontSize: 20, fontWeight: 700, color: primary }}>
                  Custom &amp; Multi-Location
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>
                  {"Ecommerce, multi-location and large-catalog sites — scoped and priced to your footprint."}
                </span>
              </div>
              <Button asChild variant="outline" size="md">
                <Link href="/support">Request a quote</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* how it works */}
      <section style={{ background: "var(--szz-bg-card)", padding: "80px 48px" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <SectionEyebrow>How_it_works</SectionEyebrow>
          {h2("Set it, and watch it climb")}
          <div className="szz-grid-3" style={{ marginTop: 32, gap: 24, alignItems: "start" }}>
            {steps.map((step) => (
              <div key={step.num} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--szz-accent-blue)",
                  }}
                >
                  {step.num}
                </span>
                <span style={{ fontFamily: display, fontSize: 20, fontWeight: 700, color: primary }}>
                  {step.title}
                </span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: muted }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* à la carte */}
      <section style={{ padding: "80px 48px" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <SectionEyebrow>À la carte</SectionEyebrow>
          {h2("Add more when you need it")}
          <div
            className="szz-grid-3 fill-cards"
            style={{ marginTop: 28, alignItems: "stretch" }}
          >
            {addOns.map((item) => (
              <Card key={item.label} surface="deep" style={{ height: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontFamily: display, fontSize: 17, fontWeight: 700, color: primary }}>
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 15,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        color: "var(--szz-accent-blue)",
                      }}
                    >
                      {item.price}
                    </span>
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>
                    {item.description}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--szz-bg-card)", padding: "0 24px 90px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <Card glow>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 32,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 560 }}>
                {h2("Not ranking where you should be?")}
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: muted }}>
                  {"Start with a free audit. We'll show you exactly where you stand and what it takes to climb — no obligation."}
                </p>
              </div>
              <Button asChild variant="primary" size="lg">
                <Link href="/support">Get a free audit</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Verify it lints**

Run: `npm run lint`
Expected: PASS (no errors for `app/(site)/services/seo/page.tsx`). If `react/no-unescaped-entities` fires, the offending copy is literal JSX text — wrap it in `{"..."}` like the Custom band description and CTA paragraph already are.

- [ ] **Step 3: Verify it builds and the route compiles**

Run: `npm run build`
Expected: PASS. The build output's route list includes `/services/seo`.

- [ ] **Step 4: Commit**

```bash
git add "app/(site)/services/seo/page.tsx"
git commit -m "feat(seo): add /services/seo page"
```

---

### Task 4: Wire the page into nav and footer

**Files:**
- Modify: `components/szz/site-nav.tsx` (import + Services group item)
- Modify: `components/szz/site-footer.tsx` (Services column link)

**Interfaces:**
- Consumes: existing `NAV_LINKS` Services group and footer `COLUMNS` SERVICES menu.
- Produces: a navigable SEO link in both desktop dropdown, mobile nav, and footer.

- [ ] **Step 1: Add the nav link**

In `components/szz/site-nav.tsx`, add `TrendingUp` to the lucide-react import. The import is currently:

```tsx
import { ChevronDown, CodeXml, Globe, LayoutTemplate, Menu, X, type LucideIcon } from "lucide-react";
```

Change it to:

```tsx
import { ChevronDown, CodeXml, Globe, LayoutTemplate, Menu, TrendingUp, X, type LucideIcon } from "lucide-react";
```

Then in the `NAV_LINKS` array, update the Services group's `items` from:

```tsx
    items: [{ href: "/services/web-development", label: "Web & Software", Icon: CodeXml }],
```

to:

```tsx
    items: [
      { href: "/services/web-development", label: "Web & Software", Icon: CodeXml },
      { href: "/services/seo", label: "SEO", Icon: TrendingUp },
    ],
```

- [ ] **Step 2: Add the footer link**

In `components/szz/site-footer.tsx`, find the `SERVICES` menu and update its `links` from:

```tsx
      links: [
        { label: "Web & Software", href: "/services/web-development" },
      ],
```

to:

```tsx
      links: [
        { label: "Web & Software", href: "/services/web-development" },
        { label: "SEO", href: "/services/seo" },
      ],
```

- [ ] **Step 3: Verify lint and build**

Run: `npm run lint && npm run build`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add components/szz/site-nav.tsx components/szz/site-footer.tsx
git commit -m "feat(seo): link /services/seo in nav and footer"
```

---

### Task 5: Full verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full gate suite**

Run from the project root:

```bash
npm run lint && npm test && npm run build
```

Expected: lint clean, all vitest tests pass (including the Task 1 test), build succeeds with `/services/seo` in the route list.

- [ ] **Step 2: Manual smoke check (dev server)**

Run: `npm run dev`, then open `http://localhost:3000/services/seo`. Confirm:
- Hero, stats row, plans, how-it-works, à la carte (5 cards), and CTA all render.
- The **Monthly/Annual** toggle flips all three tier prices (169/449/899 ↔ 149/399/799) and the "billed monthly/annually" note; the Annual button shows **Save ~11%**.
- The **Services → SEO** dropdown item (desktop + mobile) and the footer **SERVICES → SEO** link both navigate to `/services/seo`.
- `http://localhost:3000/sitemap.xml` includes `/services/seo`.

- [ ] **Step 3: Stop the dev server**

Stop `npm run dev` (Ctrl-C). No commit needed for this task.

---

## Self-Review

**Spec coverage:**
- Hero (eyebrow, h1, subhead, 2 CTAs, 3 stats) → Task 3 ✓
- Plans (toggle, 3 tiers, Custom band) → Task 2 (island) + Task 3 (heading/Custom band) ✓
- How it works (3 steps) → Task 3 ✓
- À la carte (5 cards) → Task 3 ✓
- CTA → Task 3 ✓
- Nav + footer wiring → Task 4 ✓
- `PAGE_SEO` entry / metadata / JSON-LD / sitemap → Task 1 (registry) + Task 3 (render) ✓
- Save ~11% badge → Task 2 constant ✓

**Placeholder scan:** No TBD/TODO; every code block is complete and copy is verbatim from the spec.

**Type consistency:** `SeoPlans` exported in Task 2 is imported with the same name in Task 3. `serviceType: "Search engine optimization"` is identical in Task 1's entry and Task 1's test assertion. Registry path `/services/seo` is identical across Tasks 1, 3, 4. `breadcrumbTrail("SEO", "/services/seo")` and `serviceJsonLd("/services/seo")` match the registered path/name.

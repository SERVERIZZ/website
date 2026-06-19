# Live Domain Search via ClientExec — Design

**Date:** 2026-06-19
**Status:** Approved (pending spec review)

## Goal

Turn the existing, non-functional domain search bars (home hero and domains page)
into a live search that checks real availability **and price** through our billing
system (ClientExec) and hands the visitor off to ClientExec's order flow to complete
the purchase — all while keeping the SERVERIZZ brand styling on the search and results
UI. ClientExec becomes the single source of truth for both availability and pricing,
including the domains-page pricing grid and hero TLD pills.

## Decisions (locked)

- **Search UX:** Inline branded results. We render availability and price on our own
  page using the `szz-*` design system; the visitor only leaves our brand at the final
  "Continue" hand-off to ClientExec's order page.
- **Result scope:** The exact domain the visitor typed **plus** a curated set of
  alternate TLDs, so they see options.
- **Entry points:** Both the home hero ([app/page.tsx](../../../app/page.tsx)) and the
  domains hero ([app/domains/page.tsx](../../../app/domains/page.tsx)), via one shared
  component.
- **Transport:** A same-origin Next.js Route Handler proxies to ClientExec server-side
  (no browser CORS, config stays server-side).
- **Pricing source:** **ClientExec is the single source of truth.** Search results show
  the live price. The static pricing grid and hero pills are **also** made live (fetched
  from ClientExec, cached) so nothing on the site contradicts the real cart price.
- **Product group:** `2` (see Findings — the originally-supplied `7` has no TLDs).

## Findings from probing the live system (account.serverizz.com)

These were verified against the production endpoint on 2026-06-19 and drive the design.

- **Group `2` is the domains group.** Group `7` (and 1, 3–12) returns
  `{"error":true,"success":false,"message":"TLD (com) does not exist in this group (N)."}`.
  Only group `2` has TLDs + pricing configured.
- **Endpoint:** `POST {CLIENTEXEC_URL}/index.php?fuse=clients&action=checkdomain`,
  form-encoded params `name`, `tld`, `group`. Returns `application/json`, HTTP 200 even
  for "not found" errors (error is in the body).
- **Response — available** (`status: 0`):
  ```json
  {"search_results":{
     "domainName":"foo.com","status":0,"available_count":1,
     "available_options":[{
        "tld":"com","domain_name":"foo.com","status":0,"product_id":"111",
        "price":[
          {"period":"1 Year","period_id":"12","price":16.68,
           "transfer":16.68,"renew":16.68,
           "formated_price":"$16.68 USD","formated_renew":"$16.68 USD","formated_transfer":"$16.68 USD"},
          {"period":"2 Years","period_id":"24", ...}, ... up to 10 years
        ]}]},
   "error":false,"success":true,"message":""}
  ```
- **Response — taken** (`status: 1`): `available_count: 0`, `available_options: []`.
- **Response — TLD not in group:** `{"error":true,"success":false,"message":"TLD (x) does not exist in this group (2)."}`.
- **Status semantics:** `0` = available, `1` = taken. (For our inline UI these are
  distinct outcomes — unlike the ClientExec sample JS, which redirects on both.)
- **Price to display:** `available_options[0].price[]` entry with `period_id === "12"`
  (1 Year) → `formated_price` (e.g. `"$16.68 USD"`). `renew` equals `price` for the TLDs
  checked, so the "renewal price is the same as registration — no first-year tricks"
  copy on the domains page remains accurate.
- **TLD coverage in group 2 (verified, 1-yr live prices):** `.com $16.68`, `.net $18.98`,
  `.org $18.40`, `.io $69.00`, `.co $40.25`, `.dev $19.55`, `.app $24.15`, `.shop $46.00`,
  `.studio $48.30`, plus `.store .online .site .xyz .biz .info .us .me .tech` — all present.
  The existing grid set (`.com .co .io .org .shop .dev .app .studio`) is fully covered.
- **Live prices are much higher than the current hardcoded marketing prices**
  (e.g. .com $11→$16.68, .io $39→$69, .shop $9→$46). Making the grid live is what
  reconciles this (per the locked decision above).

## Architecture

```
Search (interactive, per-request, uncached):

<DomainSearch />  ──fetch──▶  /api/domain-search  ──POST──▶  account.serverizz.com
 (client component)            (Route Handler)                index.php?fuse=clients
  brand-styled UI                                              &action=checkdomain
  renders results)                                             (one call per TLD, parallel)
       │
       └─ "Continue" ──▶ account.serverizz.com/order.php?step=1&productGroup=2&domainName=…&tld=…

Pricing grid / hero pills (display only, cached via ISR):

domains/page.tsx (server)  ──▶  getTldPricing(TLDS)  ──POST per TLD──▶  checkdomain
home/page.tsx    (server)        (cached, revalidate daily)             (read formated_price)
```

The browser only ever calls our own origin. The single cross-origin navigation is the
final Continue link to ClientExec's order page (plain navigation, no CORS concern).

## Components

### 1. `lib/domains.ts` (new — shared config + helpers)

Single source of truth, imported by the route handler, the search component (types only),
and the server pages.

- **Config:** reads `CLIENTEXEC_URL` (default `https://account.serverizz.com`) and
  `CLIENTEXEC_DOMAIN_GROUP_ID` (default `2`) from env. Server-only.
- `TLDS`: curated ordered list of TLD strings to show in the pricing grid and as search
  suggestions — `["com","co","io","org","shop","dev","app","studio"]` (current grid set).
  No hardcoded prices anymore; price is always live.
- `SUGGESTED_TLDS`: TLDs offered as alternates in search results (default: `TLDS`,
  deduped against the typed TLD).
- `parseDomain(raw): { name, tld } | { error }` — strips protocol/path/whitespace,
  lowercases, splits label from extension; bare input (`yourbakery`) defaults to `com`;
  rejects illegal characters and empty input.
- `buildOrderUrl({ name, tld }): string` — ClientExec order URL with `step=1`,
  `productGroup` (group id), `domainName`, `tld`.
- `checkDomain({ name, tld }): Promise<DomainResult>` — server-side; POSTs to
  `checkdomain`, parses the JSON, returns a normalized
  `{ name, tld, domain, available, price, formatedPrice, continueUrl, status: "ok"|"unavailable-tld"|"error" }`.
  Extracts the 1-Year (`period_id "12"`) `formated_price`. Tolerates the three documented
  response variants (available / taken / TLD-not-in-group) plus network/parse failure.
- `getTldPricing(tlds): Promise<Array<{ tld, formatedPrice | null }>>` — for the pricing
  grid/pills. Calls `checkdomain` per TLD using a **guaranteed-available probe label**
  (a long unlikely constant, e.g. `availability-probe-7x9q2`) so `available_options`
  carries the price, and reads the 1-Year `formated_price`. Cached (see below). A TLD
  that errors yields `formatedPrice: null` and is rendered with a graceful fallback.

### 2. `app/api/domain-search/route.ts` (new — server route handler)

- Accepts the search input (`POST { domain }` or `GET ?domain=`).
- `parseDomain` → computes the TLD set: typed TLD first, then `SUGGESTED_TLDS` (deduped).
- Fans out `checkDomain` per TLD **in parallel** server-side.
- Returns `{ query: { name, tld }, results: DomainResult[] }`, typed-domain result first.
- `cache: 'no-store'` — availability must be fresh per query.
- A single TLD failing (`status: "error"` / `"unavailable-tld"`) is included as
  non-actionable rather than failing the batch. Total ClientExec outage → `{ error }`
  with a non-2xx status; never throws unhandled.

### 3. `components/szz/domain-search.tsx` (new — shared client component)

- Drop-in replacement for the current `Input mono` + `Button`→`Link` markup in both heroes.
- States, all in `szz-*` styling:
  - **idle** — search bar only (current look).
  - **loading** — skeleton result rows / spinner.
  - **results** — rows: ✔ available (green) + live price / ✕ taken (muted); available
    rows get a `Continue →` button linking to `result.continueUrl`. Typed domain first,
    suggestions below.
  - **error** — branded inline message with retry.
- Props: `size`/`variant` and `placeholder` so each hero keeps its copy
  ("find yourbakery.com" vs "search yourbusiness.com") while sharing behavior.
- Client-side parse/validate via shared parse logic before calling the API; submit on
  button click and Enter.

### 4. Pricing grid + hero pills go live

- `app/domains/page.tsx` (server component) calls `getTldPricing(TLDS)` and renders the
  pricing grid and hero pills from the result instead of the hardcoded `tlds`/`heroPills`
  arrays. The "Honest, flat pricing / renewal = registration" copy stays (verified true).
- `app/page.tsx` hero pills (`.com $11 · .co $24 · .io $39 · .org $13`) render from the
  same `getTldPricing` result for the featured subset.
- A TLD whose price fails to load shows a neutral fallback (e.g. the TLD with no price /
  "see search") rather than a wrong number.

## Caching

- **Pricing grid/pills:** `getTldPricing` uses cached `fetch(..., { next: { revalidate: 86400 } })`
  (daily). The fan-out to ClientExec happens at ISR revalidation, not per visitor, so
  pages stay fast and prices refresh daily. (Revalidation window is a single tunable.)
- **Search:** uncached (`no-store`) — every search hits ClientExec live for current
  availability.

## Configuration (env)

| Var | Value | Notes |
| --- | --- | --- |
| `CLIENTEXEC_URL` | `https://account.serverizz.com` | Confirmed install host (also serves the affiliate script). Defaulted in code. |
| `CLIENTEXEC_DOMAIN_GROUP_ID` | `2` | The group that actually has TLDs + pricing (verified). Used for the `group` param and `productGroup`. |

Read only in server code; never shipped to the client. Documented in `.env.example`.

## Error handling

- Invalid input (empty / illegal chars) → inline validation, no API call.
- ClientExec unreachable / malformed JSON → branded error state with retry; rest of page
  unaffected.
- One TLD failing ≠ whole search failing; one TLD price failing ≠ broken grid.
- Pricing probe label becoming registered (loses price) → that TLD shows the fallback;
  does not break the page.

## Testing

- Unit: `parseDomain` (bare label, full domain, protocol/path noise, illegal input),
  `buildOrderUrl`, and the `checkdomain` response normalizer against the three captured
  response fixtures (available / taken / TLD-not-in-group) + malformed.
- Route handler: mocked ClientExec — available, taken, mixed batch, total outage.
- `getTldPricing`: mocked responses incl. a failing TLD → `null` price.
- Component: manual verification of idle / loading / results / error against brand styling
  on both heroes.

## Out of scope (YAGNI)

- No cart/checkout on our side — ClientExec owns the flow after Continue.
- No transfer / WHOIS flow changes; "Transfer a domain" CTA unchanged.
- No multi-year period selection in the UI — we display the 1-Year price; ClientExec's
  order page handles term selection.

## Files touched

- **New:** `lib/domains.ts`, `app/api/domain-search/route.ts`,
  `components/szz/domain-search.tsx`, `.env.example`, tests.
- **Edited:** `app/page.tsx` (hero search → `<DomainSearch />`; hero pills → live pricing),
  `app/domains/page.tsx` (hero search → `<DomainSearch />`; pricing grid + hero pills →
  live pricing via `getTldPricing`).

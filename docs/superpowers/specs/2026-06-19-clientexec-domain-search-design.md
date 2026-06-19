# Live Domain Search via ClientExec — Design

**Date:** 2026-06-19
**Status:** Approved (pending spec review)

## Goal

Turn the existing, non-functional domain search bars (home hero and domains page)
into a live search that checks real availability through our billing system
(ClientExec) and hands the visitor off to ClientExec's order flow to complete the
purchase — all while keeping the SERVERIZZ brand styling on the search and results UI.

## Decisions (locked)

- **Search UX:** Inline branded results. We render availability and pricing on our
  own page using the `szz-*` design system; the visitor only leaves our brand at the
  final "Continue" hand-off to ClientExec's order page.
- **Result scope:** The exact domain the visitor typed **plus** a curated set of
  alternate TLDs, so they see options.
- **Entry points:** Both the home hero ([app/page.tsx](../../../app/page.tsx)) and the
  domains hero ([app/domains/page.tsx](../../../app/domains/page.tsx)), via one shared
  component.
- **Transport:** A same-origin Next.js Route Handler proxies to ClientExec server-side
  (no browser CORS, config stays server-side).
- **Pricing source:** Availability comes from the ClientExec API; the **displayed
  price** comes from our local TLD price map (the numbers already on the domains page).

## Architecture

```
<DomainSearch />  ──fetch──▶  /api/domain-search  ──POST──▶  account.serverizz.com
 (client component)            (Route Handler,                 index.php?fuse=clients
  brand-styled UI               server-side proxy)              &action=checkdomain
  renders results)                                               (one call per TLD)
       │
       └─ "Continue" ──▶ account.serverizz.com/order.php?step=1&productGroup=…&domainName=…&tld=…
```

The browser only ever calls our own origin. The single cross-origin navigation is the
final Continue link to ClientExec's order page (plain navigation, no CORS concern).

## Components

### 1. `lib/domains.ts` (new — shared config + pure helpers)

Single source of truth, imported by the route handler, the search component, and the
domains pricing grid.

- `TLDS`: curated list with display price, e.g.
  `[{ tld: "com", price: "$11/yr" }, { tld: "co", price: "$24/yr" }, … ]`.
  Seeded from the existing `tlds` array in [app/domains/page.tsx](../../../app/domains/page.tsx)
  (`.com .co .io .org .shop .dev .app .studio`). The domains page pricing grid and hero
  pills are refactored to consume this, removing the inline duplication.
- `SUGGESTED_TLDS`: the subset shown as alternate suggestions in results (default: the
  full `TLDS` list, deduped against the typed TLD).
- `parseDomain(raw): { name, tld } | { error }` — strips protocol/path/whitespace,
  lowercases, splits label from extension; bare input (`yourbakery`) defaults to `com`;
  rejects illegal characters and empty input.
- `buildOrderUrl({ name, tld }): string` — constructs the ClientExec order URL with
  `step=1`, `productGroup`, `domainName`, `tld`.
- `priceForTld(tld): string | undefined` — lookup into `TLDS`.
- Reads `CLIENTEXEC_URL` and `CLIENTEXEC_DOMAIN_GROUP_ID` from env (see Config).

### 2. `app/api/domain-search/route.ts` (new — server route handler)

- Accepts the search input (domain string).
- Computes the TLD set: typed TLD + `SUGGESTED_TLDS` (deduped, typed domain first).
- Fans out one ClientExec `checkdomain` POST per TLD **in parallel**, server-side:
  - Endpoint: `${CLIENTEXEC_URL}/index.php?fuse=clients&action=checkdomain`
  - Params: `name`, `tld`, `group` (= `CLIENTEXEC_DOMAIN_GROUP_ID`)
  - Reads `search_results.status` to determine availability.
- Normalizes each result to:
  `{ domain, name, tld, available: boolean, price, continueUrl }`
  where `price` = `priceForTld(tld)` and `continueUrl` = `buildOrderUrl(...)`.
- Returns `{ query, results: [...] }`.
- A single TLD lookup that errors/times out is marked unavailable-or-omitted and does
  **not** fail the whole response. If ClientExec is wholly unreachable, returns a
  structured `{ error }` with a non-2xx status; never throws an unhandled error.

### 3. `components/szz/domain-search.tsx` (new — shared client component)

- Drop-in replacement for the current `Input mono` + `Button`→`Link` markup in both heroes.
- States, all in `szz-*` styling:
  - **idle** — search bar only (current look).
  - **loading** — skeleton result rows / spinner.
  - **results** — list of rows: ✔ available (green) / ✕ taken (muted), price, and a
    `Continue →` button linking to `result.continueUrl`. Typed domain shown first,
    suggestions below.
  - **error** — branded inline message with a retry affordance.
- Props: `size`/`variant` and `placeholder` so the two heroes can keep their existing
  copy ("find yourbakery.com" vs "search yourbusiness.com") while sharing behavior.
- Client-side: parse + validate via `parseDomain` before calling the API; debounce-safe
  submit (button + Enter).

## Configuration (env)

| Var | Value | Notes |
| --- | --- | --- |
| `CLIENTEXEC_URL` | `https://account.serverizz.com` | Confirmed install host (also serves the affiliate script). Defaulted in code. |
| `CLIENTEXEC_DOMAIN_GROUP_ID` | `7` | Confirmed domain product group ID. Used for `group` param and `productGroup`. |

Values are read only in server code (`lib/domains.ts` / route handler), never shipped to
the client. Documented in an `.env.example`.

## Error handling

- Invalid input (empty / illegal chars) → inline validation, no API call.
- ClientExec unreachable / malformed JSON → branded error state with retry; rest of page
  unaffected.
- One TLD failing ≠ whole search failing.

## Testing

- Unit: `parseDomain` (bare label, full domain, protocol/path noise, illegal input) and
  `buildOrderUrl`.
- Route handler: mocked ClientExec responses — available, taken, malformed, unreachable.
- Component: manual verification of idle / loading / results / error against brand styling
  on both heroes.

## Out of scope (YAGNI)

- No cart/checkout on our side — ClientExec owns the flow after Continue.
- No transfer / WHOIS flow changes; "Transfer a domain" CTA unchanged.
- No live pricing from the API (local price map is the display source of truth).

## Files touched

- **New:** `lib/domains.ts`, `app/api/domain-search/route.ts`,
  `components/szz/domain-search.tsx`, `.env.example`, tests.
- **Edited:** `app/page.tsx` (hero search → `<DomainSearch />`),
  `app/domains/page.tsx` (hero search → `<DomainSearch />`; pricing grid + hero pills
  consume `lib/domains.ts`).

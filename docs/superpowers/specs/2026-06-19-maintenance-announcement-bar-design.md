# Maintenance-aware announcement bar — design

**Date:** 2026-06-19
**Status:** Approved (pending spec review)

## Problem

The site's announcement bar (top of every page) shows a static marketing line:

> Free site migrations on every plan — we do the moving for you.

When an Uptime Kuma maintenance window is active, this line should be replaced
with a performance-degradation notice that links to the public status page at
`status.serverizz.com`.

## Goals

- Detect an active maintenance window from the self-hosted Uptime Kuma instance.
- While a window is active, replace the marketing line with an amber-dot notice
  about possible slower performance, with the whole bar linking to the status page.
- Fail safe: any error, timeout, or "no active maintenance" state shows the
  existing marketing line — the notice only appears on a confident positive.

## Non-goals

- Building a status page (Uptime Kuma already serves one at `status.serverizz.com`).
- Surfacing per-monitor up/down state, incident history, or uptime percentages.
- Authenticated Uptime Kuma API usage — the status-page JSON endpoint is public,
  so the API key is not required (see Secrets).

## Data source

- **Endpoint:** `GET https://status.serverizz.com/api/status-page/web`
  (status-page slug is `web`, served at `/status/web`).
- This is Uptime Kuma's **public** status-page JSON API — no API key needed.
- The response includes a `maintenanceList` of currently-relevant maintenance
  entries. Exact field names vary by Uptime Kuma version and **must be verified
  against the live endpoint during implementation** (see Open verification item).

## Architecture (Approach A: route handler + light client polling)

```
Browser (SiteNav, client component)
   │  fetch on mount + poll every 60s
   ▼
GET /api/maintenance-status          ← Next.js App Router route handler (server)
   │  server-side fetch, cached ~45s
   ▼
GET https://status.serverizz.com/api/status-page/web   ← Uptime Kuma (public)
```

`SiteNav` renders the marketing line by default. The client hook polls the
internal route handler; when it returns `{ active: true }` the bar swaps to the
maintenance notice. Because the default (marketing line) is correct in the common
case, there is no jarring flash on load.

Rationale for A over alternatives:
- **B (server-rendered prop via ISR):** on a mostly-static marketing site the
  bar would lag the actual maintenance start by the page revalidate window, and
  it changes the layout/SiteNav render model.
- **C (hybrid server prop + polling):** most robust but unnecessary moving parts
  for this use case.

## Components & boundaries

### `lib/uptime-kuma.ts` — data + evaluation module
- Exports `getMaintenanceStatus(): Promise<MaintenanceStatus>`.
- `MaintenanceStatus = { active: boolean; title: string | null }`.
- Responsibilities: fetch the status-page JSON, evaluate whether *now* is inside
  an active maintenance window, return the typed result.
- All Uptime-Kuma-shape knowledge is isolated here.
- Server fetch uses an `AbortController` timeout (~3s).
- Any failure (network error, non-200, malformed JSON, timeout) is caught and
  returned as `{ active: false, title: null }` (fail-safe).
- Base URL read from `process.env.UPTIME_KUMA_STATUS_URL`, defaulting to
  `https://status.serverizz.com/api/status-page/web`, matching the existing
  `CLIENTEXEC_URL` env pattern.

### `app/api/maintenance-status/route.ts` — route handler
- Thin wrapper: calls `getMaintenanceStatus()`, returns it as JSON.
- Caches the upstream call (~45s, via `next: { revalidate: 45 }` and/or
  `Cache-Control`) so visitor polling is shared and never hammers Uptime Kuma.

### `components/szz/site-nav.tsx` — announcement bar
- A `useMaintenanceStatus()` client hook fetches `/api/maintenance-status` on
  mount and polls every 60s.
- The announcement bar's dot color and text/link switch on `active`.
- Hook may live inline in the component or in `lib/`; it must not import the
  server-only `lib/uptime-kuma.ts` (which reads env / does the upstream fetch).

## "Is maintenance active now?" logic

Uptime Kuma `maintenanceList` entries carry a `strategy`
(`single`, `recurring-interval`, `recurring-weekday`, `recurring-day-of-month`,
`manual`) plus timeslots. A window is treated as **active** when:
- a `manual` maintenance is currently on, OR
- the current time falls within a timeslot's start/end.

The evaluator is written behind a clean interface so version-specific field
names are isolated and unit-testable. **Exact field names must be confirmed by
curling the live endpoint before finalizing this function.**

## UI states

| State | Dot | Text | Link |
|---|---|---|---|
| Normal (default) | green (`--szz-green`) | "Free site migrations on every plan — we do the moving for you." | none |
| Maintenance active | amber (reuse existing warning token if present, else inline `#f5a623`) | "Scheduled maintenance in progress — you may notice slower performance. View status →" | whole bar links to `https://status.serverizz.com` |

Check for an existing amber/warning CSS token first (the `warning` badge variant
suggests one exists) and reuse it before adding a new color.

## Secrets / config

- `UPTIME_KUMA_STATUS_URL` (optional) — overrides the status-page JSON URL.
  Defaults to `https://status.serverizz.com/api/status-page/web`.
- `UPTIME_KUMA_API_KEY` — **not required** for the public endpoint. Add a
  commented entry in `.env.example` documenting it as a fallback only.
- No secret is ever read in client code; all env access is server-side
  (route handler / `lib/uptime-kuma.ts`).

## Error handling

- Fail-safe everywhere: failure, non-200, malformed JSON, or timeout → marketing
  line. The notice appears only on a confident `active: true`.
- Server fetch has a ~3s `AbortController` timeout.

## Testing

- **Unit tests** for the evaluator in `lib/uptime-kuma.ts` against captured/sample
  JSON fixtures: active window, scheduled-but-not-yet, none, malformed. This is
  the logic most worth locking down.
- Route handler and client hook are thin enough to verify manually.

## Defaults (confirmed with user)

- Client poll interval: 60s. Server cache: ~45s.
- Maintenance bar links to `https://status.serverizz.com` (not the `/status/web`
  deep link).

## Open verification item (during implementation)

- Curl `https://status.serverizz.com/api/status-page/web` to confirm the real
  shape of `maintenanceList` and finalize the evaluator field mapping before
  wiring it up.

# /support Ticket Form → ClientExec — Design

**Date:** 2026-06-21
**Status:** Approved (design), pending spec review

## Goal

Make the "Send us a message" form on `/support` submit a real support ticket to
ClientExec (CE) as a guest, with a user-selectable **ticket type** drawn from the
11 publicly-available types CE exposes. The form is protected by Cloudflare
Turnstile using the site's existing keys.

## Background — what CE's public ticket form does

CE's guest ticket form lives at:

```
GET  https://go.serverizz.com/index.php?fuse=support&controller=ticket&view=submitticket
POST https://go.serverizz.com/index.php?fuse=support&controller=ticket&action=saveticket
```

The POST is `multipart/form-data` with these fields (confirmed by scraping the live form):

| field        | value / meaning                                  |
|--------------|--------------------------------------------------|
| `userid`     | `0` (guest submission)                            |
| `guestName`  | First and last name                               |
| `guestEmail` | Email                                             |
| `subject`    | Ticket subject (required by CE)                   |
| `message`    | Ticket body                                       |
| `ticket-type`| Numeric type id (see table below)                 |
| `validExtns` | `png,jpg,jpeg,gif,zip,txt,log` (file-upload hint) |
| _(file)_     | optional attachment — **out of scope**            |

**Public ticket types** (value → label), parsed from the live `ticket-type` select:

| value | label                          |
|-------|--------------------------------|
| 3     | Plan & Pricing Questions       |
| 4     | Pre-sales Technical Question   |
| 5     | Migration Inquiry              |
| 6     | Partners & Bulk Purchases      |
| 7     | Custom / Enterprise Requests   |
| 8     | Spam / Outbound Mail           |
| 9     | Malware / Compromised Account  |
| 10    | Phishing Report                |
| 11    | DMCA / Copyright Complaint     |
| 12    | Terms of Service Violation     |
| 13    | Network Abuse                  |

(Value `0` = "Select below …" placeholder, not a valid submission value.)

### Key constraints discovered (probed against the live instance)

1. **CE's own form is Turnstile-protected** (CE sitekey `0x4AAAAAADnk709J_uwZIr-X`).
   A server-side proxy POST with no Turnstile token is **bounced to logout/login —
   no ticket is created.**
2. **CE does not prefill from URL query params**, so "redirect with prefilled
   values" is not viable.
3. **Cross-origin AJAX** from `www.serverizz.com` → `go.serverizz.com` is blocked
   by CORS.

### Decision (owner-approved)

Turnstile will be **disabled on CE's `saveticket` endpoint** so that an
authenticated-by-our-own-Turnstile server-side proxy can submit. This mirrors the
existing `createAccount()` / `verifyCredentials()` web-scrape pattern in
`lib/clientexec.ts`. The /support form keeps **our** Turnstile (existing
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`).

**Accepted tradeoff:** CE's raw `saveticket` endpoint loses its bot guard and is
exposed to direct spam. Our /support form remains Turnstile-protected.

**Prerequisite (owner action, outside this codebase):** disable Turnstile on CE's
guest ticket form. Until this is done, the proxy POST will fail; this is the first
thing to verify after implementation.

## Architecture

Mirrors the existing register flow exactly (`register-form.tsx` →
`/api/register` → `createAccount()` + `verifyTurnstile`).

```
/support page (server component)
  └─ <SupportForm> (new client component)         ← controlled inputs + our Turnstile
        │  POST /api/support-ticket (JSON)
        ▼
  /api/support-ticket (new route)
        │  1. validate fields
        │  2. verifyTurnstile(token, ip)           ← lib/turnstile.ts (existing)
        │  3. createSupportTicket({...})           ← new in lib/clientexec.ts
        ▼
  ClientExec saveticket (multipart POST, two-step GET→POST for session cookie)
```

### Component / unit breakdown

**1. `lib/clientexec.ts` — new exports**

- `SUPPORT_TICKET_TYPES_FALLBACK: TicketType[]` — the 11 types above, hardcoded.
  Type: `type TicketType = { value: string; label: string }`.
- `buildSubmitTicketUrl()` / `buildSaveTicketUrl()` — URL builders (consistent with
  `buildRegisterFormUrl` etc.), using `CE_URL`.
- `parseTicketTypes(html: string): TicketType[]` — parse the `ticket-type` select's
  `<option>`s, excluding `value="0"`. Pure, unit-tested.
- `getSupportTicketTypes(): Promise<TicketType[]>` — live-fetch the submitticket
  page (`{ next: { revalidate: 86400 } }`), parse, fall back to
  `SUPPORT_TICKET_TYPES_FALLBACK` on any failure. **Mirrors `getPopularKbTopics`.**
- `isTicketSuccess(status, location, body): boolean` — success heuristic, isolated
  for tuning against the live instance (mirrors `isRegisterSuccess`). A 3xx redirect
  that does **not** go back to the submit-ticket view (and is not the logout/login
  bounce) → success; a 200 with an error marker → failure.
- `createSupportTicket(input): Promise<boolean>` — two-step:
  GET submitticket for a session cookie, then `multipart/form-data` POST to
  saveticket with `userid=0`, `guestName`, `guestEmail`, `subject`, `message`,
  `ticket-type`, `validExtns`; `redirect: "manual"`, `cache: "no-store"`.
  Input: `{ name, email, subject, message, ticketType }`.
  Throws if CE is unreachable (caller maps to 502), returns boolean otherwise.

  *Note on multipart:* build the body with `FormData` (Web API) rather than
  `URLSearchParams`, since CE's form is `enctype="multipart/form-data"`. Do **not**
  set `Content-Type` manually — `fetch` sets the boundary. The two-step GET handles
  the session cookie the same way `createAccount` does.

**2. `app/api/support-ticket/route.ts` — new route** (clone of `/api/register`)

- Parse JSON: `name`, `email`, `subject`, `message`, `ticketType`, `turnstileToken`.
- Validate: all required; `email` matches `EMAIL_RE`; `ticketType` is one of the
  known type values (validate against the fallback set — defends the CE endpoint
  even though it's now Turnstile-free).
- `verifyTurnstile(token, ip)` with `CF-Connecting-IP`.
- `createSupportTicket(...)` → `{ ok: true }` or `{ ok: false, error }`; CE
  unreachable → 502.

**3. `components/szz/support-form.tsx` — new client component**

- Props: `{ turnstileSiteKey: string; ticketTypes: TicketType[] }`.
- Controlled inputs: Name, Email, **Subject** (new), Ticket type (`<select>` from
  `ticketTypes`), Message. `TurnstileWidget`. Status machine
  `idle | submitting | error | done` (mirrors `RegisterForm`).
- On `done`: replace form with a branded success panel ("Ticket received — we'll
  reply by email", reusing the register success-panel styling).
- Styling: keep the existing card/markup look from `support/page.tsx` (the dropdown
  becomes a real `<select>`; a Subject field is added). Self-contained styling, no
  new design system work.

**4. `app/(site)/support/page.tsx` — wiring**

- Server component fetches `getSupportTicketTypes()` alongside the existing
  `getPopularKbTopics()`.
- Read `siteKey` (same `NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? TEST_SITE_KEY` pattern as
  register/login).
- Replace the static `<form>` (lines ~93–117) with
  `<SupportForm turnstileSiteKey={siteKey} ticketTypes={types} />`.
- Leave the hero search, channels, popular topics, and hours sections unchanged.

## Data flow

1. Visitor fills Name, Email, Subject, Ticket type, Message; solves Turnstile.
2. Client validates, POSTs JSON to `/api/support-ticket`.
3. Route validates + verifies Turnstile (our secret) + checks `ticketType`.
4. `createSupportTicket` GETs submitticket (session cookie), POSTs multipart to
   saveticket.
5. Success heuristic → `{ ok: true }` → client shows branded confirmation. CE emails
   the guest its ticket confirmation as usual.

## Error handling

| Condition                       | Result                                              |
|---------------------------------|-----------------------------------------------------|
| Missing/invalid field           | 400, inline message                                 |
| Unknown `ticketType`            | 400                                                 |
| Turnstile fails                 | 400, "Verification failed. Please try again."       |
| Turnstile siteverify unreachable| 502, "Verification is temporarily unavailable."     |
| CE unreachable / non-success    | 502 / `{ok:false}`, "Couldn't submit — try again or email help@serverizz.com." |
| Live type fetch fails           | Silent fallback to hardcoded 11 types               |

## Testing

Extend `lib/clientexec.test.ts` (Vitest, existing `mockFetchOnce` helpers):

- `parseTicketTypes` — parses the 11 options, excludes `value="0"`, handles entities.
- `getSupportTicketTypes` — returns parsed types; falls back on non-ok / parse-empty / throw.
- `isTicketSuccess` — redirect-away → true; submit-ticket/logout redirect → false;
  200-with-error → false.
- `createSupportTicket` — asserts the two-step (GET then POST), multipart body
  fields, forwarded cookie; maps success/failure via the heuristic.

Route-level validation can be covered by a focused test of `/api/support-ticket`
input handling if a route test harness exists; otherwise rely on the `lib` tests
plus manual verification.

## Manual verification (post-implementation, after CE Turnstile is disabled)

1. Confirm CE Turnstile is disabled on `saveticket`.
2. Submit a real ticket from `/support`; confirm it appears in CE and the guest
   gets CE's confirmation email; tune `isTicketSuccess` if the heuristic misfires.
3. Confirm Turnstile gates our form (no token → blocked).

## Out of scope (YAGNI)

- File attachments.
- Hero "Search help articles" box (still unwired — separate concern).
- Logged-in (non-guest) ticket submission.
- Any CE-side configuration beyond disabling Turnstile.
```

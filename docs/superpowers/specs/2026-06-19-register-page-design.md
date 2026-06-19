# Register page + login emblem fix — design

**Date:** 2026-06-19
**Status:** Approved (pending spec review)

## Summary

Two pieces of work, both derived from the SERVERIZZ Website Claude Design file
(`SERVERIZZ Website.dc.html`, LOGIN + REGISTER screens):

1. **Login emblem fix** — keep the terminal-chip emblem dark inside the
   always-dark login brand panel, regardless of site theme.
2. **`/register` page** — a branded "Create your account" page collecting first
   name, last name, and email, gated by a real Cloudflare Turnstile widget, that
   creates a ClientExec account server-side and shows an on-site confirmation.

The register page mirrors the structure and conventions already established by
the login page (`app/login/page.tsx`, `components/szz/login-form.tsx`,
`lib/clientexec.ts`, `app/api/login/route.ts`).

## Decisions (from brainstorming)

- **Route:** `/register` (indexable — public conversion page, unlike the
  noindex login page).
- **Submission flow:** server-side via a Next.js `/api/register` route. The
  Turnstile secret never reaches the client.
- **Post-submission:** on-site confirmation ("Account created — check your
  email") with a link to sign in. No cross-domain handoff.
- **Turnstile UI:** the real Cloudflare managed widget (not a restyled mock).

## 1. Login emblem fix

The login brand aside (`.szz-login-aside` in `app/globals.css`) is hardcoded to
a dark gradient "regardless of theme," but only overrides the text color tokens.
The terminal-chip emblem uses `background: var(--szz-bg-card)` and
`border-color: var(--szz-border)`, which flip to light values in light theme —
so the emblem renders white-on-dark inside the dark panel.

**Fix:** scope the dark surface tokens to `.szz-login-aside` alongside the
existing text overrides:

```css
.szz-login-aside {
  --szz-bg-card: #111827;   /* emblem chip stays dark */
  --szz-border: #1e3a5f;    /* chip hairline stays dark */
  /* existing text token overrides remain */
}
```

The right-hand form panel is a separate element and keeps using the theme's
`--szz-bg-card`, so it still renders light in light mode (intended). Only the
brand panel and its emblem are pinned dark. This same `.szz-login-aside` panel
is reused by the register page, so the fix benefits both screens.

## 2. `/register` page

### Files

- `app/register/page.tsx` — server component. Dark brand aside (`Get_started`
  eyebrow, headline "Online this afternoon. / Migration included.", supporting
  copy, and the rocket / badge-check / user-round feature rows from the design)
  plus a form panel that renders `<RegisterForm>`. Indexable; canonical
  `/register`. Mirrors `app/login/page.tsx`.
- `components/szz/register-form.tsx` — client component, analog of `LoginForm`.
  Holds first/last/email state and the Turnstile token, renders the widget,
  submits to `/api/register`, and drives the idle / verifying / error /
  confirmation UI states.
- `components/szz/turnstile-widget.tsx` — client component. Loads Cloudflare's
  `api.js`, renders the managed widget, and reports the token back through an
  `onVerify(token)` callback (and `onExpire`). Isolated so it has one clear job
  and can be reused/tested independently.
- `app/api/register/route.ts` — server route. Validates input, verifies the
  Turnstile token, calls `createAccount`, returns `{ ok: true }` or
  `{ error }`.
- `lib/turnstile.ts` — `verifyTurnstile(token, ip?)` server helper.
- `lib/clientexec.ts` — extended with account-creation helpers (below).

### Data flow

```
RegisterForm
  → POST /api/register { firstName, lastName, email, turnstileToken }
      1. validate: firstName & lastName non-empty; email shape valid
      2. verifyTurnstile(turnstileToken)  // Turnstile secret server-side only
      3. createAccount({ firstName, lastName, email })  // → ClientExec
      4. respond { ok: true } | { error, status }
  → on ok: RegisterForm shows on-site confirmation
           "Account created — check your email" + Sign in link
  → on error: inline error message, form stays editable
```

The submit button is disabled until the Turnstile widget yields a token. Field
validation errors are shown inline before any network call (mirrors
`LoginForm`).

### Turnstile integration

- `lib/turnstile.ts` → `verifyTurnstile(token, ip?)` POSTs `secret`, `response`,
  and optional `remoteip` (form-encoded) to
  `https://challenges.cloudflare.com/turnstile/v0/siteverify` and returns the
  parsed `{ success: boolean }`. Throws on network failure so the route can
  return a 502, consistent with `verifyCredentials`.
- Env vars (added to `.env.example`):
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — public, used by the widget.
  - `TURNSTILE_SECRET_KEY` — server-only, used by `verifyTurnstile`.
- Local/dev uses Cloudflare's documented always-pass test keys
  (site `1x00000000000000000000AA`, secret `1x0000000000000000000000000000000AA`)
  so the flow works without a configured domain.

### ClientExec account creation

ClientExec's external registration form posts to
`index.php?fuse=home&action=createaccount` with fields `guestFirstName`,
`guestLastName`, `guestEmail`, and a hidden `sessionHash` (CSRF token tied to a
CE PHP session). A cross-domain browser POST has no valid `sessionHash`, so the
server route acquires one before posting.

Additions to `lib/clientexec.ts`, following the existing isolated-heuristic
style (`isLoginSuccess`):

- `buildCreateAccountUrl()` → `${CE_URL}/index.php?fuse=home&action=createaccount`.
- `createAccount({ firstName, lastName, email })`:
  1. GET a CE page that renders the registration form to obtain a session
     cookie (`Set-Cookie`) and the rendered `sessionHash` value.
  2. POST `guestFirstName` / `guestLastName` / `guestEmail` / `sessionHash`
     with that cookie.
  3. Interpret the response via `isRegisterSuccess`.
- `parseSessionHash(html)` — pure: extract the `sessionHash` hidden-field value
  from CE's HTML. Unit-tested with a fixture.
- `isRegisterSuccess(status, location, body)` — pure: decide success from the
  response. Unit-tested.

**Verify-against-live-instance:** the exact page to GET for the session hash,
the cookie name, and the success signal are CE-instance-specific. They are
confined to `createAccount` / `parseSessionHash` / `isRegisterSuccess` and will
be confirmed against `account.serverizz.com` during the build, then annotated
with a `// verify-against-live-instance` note as elsewhere in the file.

## 3. Link wiring (final step)

Once `/register` works end to end, repoint the public entry points from CE's
hosted order page to the on-site page:

- Nav **Get Started** (`components/szz/site-nav.tsx`) → `/register`.
- Login "Create an account" link (`components/szz/login-form.tsx`, via
  `app/login/page.tsx`'s `ceSignupUrl`) → `/register`.

## 4. Testing (TDD)

- `lib/clientexec.test.ts` — extend with `parseSessionHash` and
  `isRegisterSuccess` cases.
- `lib/turnstile.test.ts` — `verifyTurnstile` success/failure via mocked fetch.
- `app/api/register/route.test.ts` — validation rejects, Turnstile failure → 4xx,
  CE unreachable → 502, happy path → `{ ok: true }` (CE + Turnstile fetch mocked).

Each new pure function is written test-first.

## Out of scope

- Password collection (CE creates a guest account; password is set later in the
  CE flow).
- Cross-domain session handoff / auto-login after registration.
- Any restyling of the Turnstile widget internals.

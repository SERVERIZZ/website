# /support Ticket Form → ClientExec Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `/support` "Send us a message" form submit a guest support ticket to ClientExec with a user-selectable public ticket type, protected by the site's existing Cloudflare Turnstile.

**Architecture:** Mirror the existing register flow. A new client component (`support-form.tsx`) collects fields + a Turnstile token and POSTs JSON to a new route (`/api/support-ticket`). The route verifies Turnstile with the site secret, then `createSupportTicket()` in `lib/clientexec.ts` does a two-step GET→POST (session cookie then multipart submit) against CE's `saveticket` endpoint — exactly like the existing `createAccount()`. Ticket types are live-fetched from CE with a hardcoded fallback, like `getPopularKbTopics()`.

**Tech Stack:** Next.js 16 (App Router), React client components, Vitest, Cloudflare Turnstile, ClientExec web endpoints.

## Global Constraints

- ClientExec base URL: `process.env.CLIENTEXEC_URL ?? "https://go.serverizz.com"` (the existing `CE_URL` constant in `lib/clientexec.ts`). Never hardcode the host.
- `lib/clientexec.ts` is server-only (`/** ... Do not import from client components. */`). The new types-list and ticket functions live there.
- Turnstile: client uses `NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? TEST_SITE_KEY` (`TEST_SITE_KEY = "1x00000000000000000000AA"`); server verifies via existing `verifyTurnstile()` in `lib/turnstile.ts` (`TURNSTILE_SECRET_KEY`).
- Email validation regex (reuse verbatim): `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
- Tests run with `npm test` (`vitest run`). Test file: `lib/clientexec.test.ts` (existing).
- Public ticket types (value → label): 3 Plan & Pricing Questions, 4 Pre-sales Technical Question, 5 Migration Inquiry, 6 Partners & Bulk Purchases, 7 Custom / Enterprise Requests, 8 Spam / Outbound Mail, 9 Malware / Compromised Account, 10 Phishing Report, 11 DMCA / Copyright Complaint, 12 Terms of Service Violation, 13 Network Abuse. (`value="0"` is the placeholder — never a valid submission.)
- CE `saveticket` POST fields: `userid=0`, `guestName`, `guestEmail`, `subject`, `message`, `ticket-type`, `validExtns=png,jpg,jpeg,gif,zip,txt,log`; `enctype="multipart/form-data"`.
- **Prerequisite (owner action, not code):** Turnstile must be disabled on CE's `saveticket` endpoint, or live submission will be bounced to logout. Verify before claiming end-to-end success.

---

### Task 1: Ticket-type list (constant, parser, live-fetch with fallback)

**Files:**
- Modify: `lib/clientexec.ts` (add near the KB section, after `getPopularKbTopics`)
- Test: `lib/clientexec.test.ts`

**Interfaces:**
- Consumes: existing `CE_URL`, `decodeEntities` (already in file).
- Produces:
  - `type TicketType = { value: string; label: string }`
  - `SUPPORT_TICKET_TYPES_FALLBACK: TicketType[]`
  - `buildSubmitTicketUrl(): string`
  - `parseTicketTypes(html: string): TicketType[]`
  - `getSupportTicketTypes(): Promise<TicketType[]>`

- [ ] **Step 1: Write the failing tests**

Add to the imports at the top of `lib/clientexec.test.ts`:

```typescript
import { parseTicketTypes, getSupportTicketTypes, SUPPORT_TICKET_TYPES_FALLBACK } from "@/lib/clientexec";
```

Append to `lib/clientexec.test.ts`:

```typescript
const TICKET_FORM_HTML = `
<form id="support-ticket-form">
  <select name="ticket-type" class="drop-ticket-type form-control searchSelect2">
    <option value="0" >Select below ...</option>
    <option value="3" >Plan &amp; Pricing Questions</option>
    <option value="4" >Pre-sales Technical Question</option>
    <option value="13" >Network Abuse</option>
  </select>
</form>`;

describe("parseTicketTypes", () => {
  it("parses options, excludes the placeholder, decodes entities", () => {
    const types = parseTicketTypes(TICKET_FORM_HTML);
    expect(types).toEqual([
      { value: "3", label: "Plan & Pricing Questions" },
      { value: "4", label: "Pre-sales Technical Question" },
      { value: "13", label: "Network Abuse" },
    ]);
  });

  it("returns [] when the select is absent", () => {
    expect(parseTicketTypes("<form>no select here</form>")).toEqual([]);
  });
});

describe("getSupportTicketTypes", () => {
  it("returns parsed types on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve(TICKET_FORM_HTML) }));
    const types = await getSupportTicketTypes();
    expect(types.map((t) => t.value)).toEqual(["3", "4", "13"]);
  });

  it("falls back when the response is not ok", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve("") }));
    expect(await getSupportTicketTypes()).toEqual(SUPPORT_TICKET_TYPES_FALLBACK);
  });

  it("falls back when parsing yields nothing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, text: () => Promise.resolve("<p>nope</p>") }));
    expect(await getSupportTicketTypes()).toEqual(SUPPORT_TICKET_TYPES_FALLBACK);
  });

  it("falls back when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    expect(await getSupportTicketTypes()).toEqual(SUPPORT_TICKET_TYPES_FALLBACK);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- lib/clientexec.test.ts`
Expected: FAIL — `parseTicketTypes`/`getSupportTicketTypes`/`SUPPORT_TICKET_TYPES_FALLBACK` not exported.

- [ ] **Step 3: Implement in `lib/clientexec.ts`**

Add after `getPopularKbTopics` (around line 139):

```typescript
// ---- Support ticket types + guest ticket submission ----
// CE's guest ticket form posts userid=0 + guestName/guestEmail/subject/message/
// ticket-type as multipart/form-data. We live-fetch the type list (with a fallback)
// and submit via a two-step GET (session cookie) → POST, like createAccount.
// verify-against-live-instance: confirm the success signal on go.serverizz.com,
// and that Turnstile is disabled on saveticket (else POSTs bounce to logout).

export type TicketType = { value: string; label: string };

const SUBMIT_TICKET_URL = `${CE_URL}/index.php?fuse=support&controller=ticket&view=submitticket`;
const SAVE_TICKET_URL = `${CE_URL}/index.php?fuse=support&controller=ticket&action=saveticket`;
const TICKET_VALID_EXTNS = "png,jpg,jpeg,gif,zip,txt,log";

export function buildSubmitTicketUrl(): string {
  return SUBMIT_TICKET_URL;
}

/** Public ticket types, used when the live fetch/parse fails. */
export const SUPPORT_TICKET_TYPES_FALLBACK: TicketType[] = [
  { value: "3", label: "Plan & Pricing Questions" },
  { value: "4", label: "Pre-sales Technical Question" },
  { value: "5", label: "Migration Inquiry" },
  { value: "6", label: "Partners & Bulk Purchases" },
  { value: "7", label: "Custom / Enterprise Requests" },
  { value: "8", label: "Spam / Outbound Mail" },
  { value: "9", label: "Malware / Compromised Account" },
  { value: "10", label: "Phishing Report" },
  { value: "11", label: "DMCA / Copyright Complaint" },
  { value: "12", label: "Terms of Service Violation" },
  { value: "13", label: "Network Abuse" },
];

const TICKET_SELECT = /<select[^>]*name=["']ticket-type["'][^>]*>([\s\S]*?)<\/select>/i;
const TICKET_OPTION = /<option\s+value=["'](\d+)["'][^>]*>([\s\S]*?)<\/option>/gi;

/** Parse CE's `ticket-type` <select>, excluding the value="0" placeholder. */
export function parseTicketTypes(html: string): TicketType[] {
  const block = html.match(TICKET_SELECT);
  if (!block) return [];
  const types: TicketType[] = [];
  for (const m of block[1].matchAll(TICKET_OPTION)) {
    const value = m[1];
    if (value === "0") continue;
    const label = decodeEntities(m[2]).trim();
    if (label) types.push({ value, label });
  }
  return types;
}

/** Live public ticket types for the support form; falls back on any failure. */
export async function getSupportTicketTypes(): Promise<TicketType[]> {
  try {
    const res = await fetch(SUBMIT_TICKET_URL, { next: { revalidate: 86400 } } as RequestInit);
    if (!res.ok) return SUPPORT_TICKET_TYPES_FALLBACK;
    const types = parseTicketTypes(await res.text());
    return types.length ? types : SUPPORT_TICKET_TYPES_FALLBACK;
  } catch {
    return SUPPORT_TICKET_TYPES_FALLBACK;
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- lib/clientexec.test.ts`
Expected: PASS (all `parseTicketTypes` and `getSupportTicketTypes` tests green).

- [ ] **Step 5: Commit**

```bash
git add lib/clientexec.ts lib/clientexec.test.ts
git commit -m "feat: live-fetch ClientExec support ticket types with fallback"
```

---

### Task 2: Guest ticket submission (`createSupportTicket` + success heuristic)

**Files:**
- Modify: `lib/clientexec.ts` (after Task 1's additions)
- Test: `lib/clientexec.test.ts`

**Interfaces:**
- Consumes: `CE_URL`, `SAVE_TICKET_URL`, `SUBMIT_TICKET_URL`, `TICKET_VALID_EXTNS` (from Task 1).
- Produces:
  - `isTicketSuccess(status: number, location: string | null, body: string): boolean`
  - `createSupportTicket(input: { name: string; email: string; subject: string; message: string; ticketType: string }): Promise<boolean>`

- [ ] **Step 1: Write the failing tests**

Add to the `@/lib/clientexec` import line in `lib/clientexec.test.ts`:

```typescript
import { isTicketSuccess, createSupportTicket } from "@/lib/clientexec";
```

Append to `lib/clientexec.test.ts`:

```typescript
describe("isTicketSuccess", () => {
  it("treats a redirect away from the ticket view as success", () => {
    expect(isTicketSuccess(302, "index.php?fuse=support&view=ticketsubmitted", "")).toBe(true);
  });
  it("treats a bounce back to the submit-ticket view as failure", () => {
    expect(isTicketSuccess(302, "index.php?fuse=support&controller=ticket&view=submitticket", "")).toBe(false);
  });
  it("treats a logout/login bounce as failure", () => {
    expect(isTicketSuccess(302, "index.php?fuse=admin&action=Logout", "")).toBe(false);
  });
  it("treats a 200 with an error marker as failure", () => {
    expect(isTicketSuccess(200, null, "There was an error, please try again")).toBe(false);
  });
});

describe("createSupportTicket", () => {
  it("GETs for a cookie then POSTs multipart, and maps success", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, headers: { get: () => "CESESSION=abc; path=/" }, text: () => Promise.resolve("<form></form>") })
      .mockResolvedValueOnce({ ok: false, status: 302, headers: { get: (h: string) => (h.toLowerCase() === "location" ? "index.php?fuse=support&view=ticketsubmitted" : null) }, text: () => Promise.resolve("") });
    vi.stubGlobal("fetch", fetchMock);

    const ok = await createSupportTicket({ name: "Jane Baker", email: "jane@x.com", subject: "Hi", message: "Help", ticketType: "4" });

    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const [url, init] = fetchMock.mock.calls[1];
    expect(String(url)).toContain("action=saveticket");
    expect(init.method).toBe("POST");
    expect(init.body).toBeInstanceOf(FormData);
    expect((init.body as FormData).get("userid")).toBe("0");
    expect((init.body as FormData).get("guestName")).toBe("Jane Baker");
    expect((init.body as FormData).get("guestEmail")).toBe("jane@x.com");
    expect((init.body as FormData).get("subject")).toBe("Hi");
    expect((init.body as FormData).get("message")).toBe("Help");
    expect((init.body as FormData).get("ticket-type")).toBe("4");
    expect(init.headers.Cookie).toBe("CESESSION=abc");
  });

  it("returns false when CE bounces the POST to logout", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, status: 200, headers: { get: () => "" }, text: () => Promise.resolve("<form></form>") })
      .mockResolvedValueOnce({ ok: false, status: 302, headers: { get: (h: string) => (h.toLowerCase() === "location" ? "index.php?fuse=admin&action=Logout" : null) }, text: () => Promise.resolve("") });
    vi.stubGlobal("fetch", fetchMock);
    expect(await createSupportTicket({ name: "A", email: "a@x.com", subject: "S", message: "M", ticketType: "3" })).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- lib/clientexec.test.ts`
Expected: FAIL — `isTicketSuccess`/`createSupportTicket` not exported.

- [ ] **Step 3: Implement in `lib/clientexec.ts`**

Append after Task 1's `getSupportTicketTypes`:

```typescript
/**
 * Decide whether a saveticket POST succeeded, from the (redirect:"manual")
 * response. Heuristic — isolated for tuning against the live instance:
 *   - a 3xx redirect that does NOT go back to the submit-ticket view and is
 *     NOT the logout/login bounce → success
 *   - a 200 with an error marker → failure
 *   - everything else → failure
 */
export function isTicketSuccess(status: number, location: string | null, body: string): boolean {
  const isRedirect = status >= 300 && status < 400;
  if (isRedirect) {
    const loc = (location ?? "").toLowerCase();
    if (!loc) return false;
    if (loc.includes("view=submitticket")) return false;
    if (loc.includes("action=logout") || loc.includes("action=login") || loc.includes("/login")) return false;
    return true;
  }
  return false;
}

/** Submit a ClientExec guest support ticket. Throws if CE is unreachable. */
export async function createSupportTicket(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  ticketType: string;
}): Promise<boolean> {
  const formRes = await fetch(SUBMIT_TICKET_URL, { cache: "no-store" });
  const setCookie = formRes.headers.get("set-cookie") ?? "";
  const cookie = setCookie.split(";")[0];

  const body = new FormData();
  body.set("userid", "0");
  body.set("guestName", input.name);
  body.set("guestEmail", input.email);
  body.set("subject", input.subject);
  body.set("message", input.message);
  body.set("ticket-type", input.ticketType);
  body.set("validExtns", TICKET_VALID_EXTNS);

  const res = await fetch(SAVE_TICKET_URL, {
    method: "POST",
    // No Content-Type: fetch sets the multipart boundary for FormData.
    headers: { ...(cookie ? { Cookie: cookie } : {}) },
    body,
    redirect: "manual",
    cache: "no-store",
  });
  return isTicketSuccess(res.status, res.headers.get("location"), await res.text());
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- lib/clientexec.test.ts`
Expected: PASS (Task 1 + Task 2 tests all green).

- [ ] **Step 5: Commit**

```bash
git add lib/clientexec.ts lib/clientexec.test.ts
git commit -m "feat: createSupportTicket guest submission to ClientExec"
```

---

### Task 3: API route `/api/support-ticket`

**Files:**
- Create: `app/api/support-ticket/route.ts`

**Interfaces:**
- Consumes: `createSupportTicket`, `SUPPORT_TICKET_TYPES_FALLBACK` (Tasks 1–2); `verifyTurnstile` (`lib/turnstile.ts`).
- Produces: `POST(request: Request): Promise<Response>` — accepts JSON `{ name, email, subject, message, ticketType, turnstileToken }`; returns `{ ok: true }` on success, `{ error }`/`{ ok: false, error }` otherwise.

- [ ] **Step 1: Create the route**

Create `app/api/support-ticket/route.ts`:

```typescript
import { createSupportTicket, SUPPORT_TICKET_TYPES_FALLBACK } from "@/lib/clientexec";
import { verifyTurnstile } from "@/lib/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TYPES = new Set(SUPPORT_TICKET_TYPES_FALLBACK.map((t) => t.value));

export async function POST(request: Request): Promise<Response> {
  let name = "", email = "", subject = "", message = "", ticketType = "", turnstileToken = "";
  try {
    const body = await request.json();
    name = typeof body?.name === "string" ? body.name.trim() : "";
    email = typeof body?.email === "string" ? body.email.trim() : "";
    subject = typeof body?.subject === "string" ? body.subject.trim() : "";
    message = typeof body?.message === "string" ? body.message.trim() : "";
    ticketType = typeof body?.ticketType === "string" ? body.ticketType.trim() : "";
    turnstileToken = typeof body?.turnstileToken === "string" ? body.turnstileToken : "";
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!name || !email || !subject || !message || !ticketType) {
    return Response.json({ error: "All fields are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!VALID_TYPES.has(ticketType)) {
    return Response.json({ error: "Choose a topic from the list." }, { status: 400 });
  }
  if (!turnstileToken) {
    return Response.json({ error: "Please complete the verification." }, { status: 400 });
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? undefined;
  try {
    const human = await verifyTurnstile(turnstileToken, ip);
    if (!human) {
      return Response.json({ error: "Verification failed. Please try again." }, { status: 400 });
    }
  } catch {
    return Response.json({ error: "Verification is temporarily unavailable. Please try again." }, { status: 502 });
  }

  try {
    const sent = await createSupportTicket({ name, email, subject, message, ticketType });
    if (sent) return Response.json({ ok: true });
    return Response.json({ ok: false, error: "We couldn't submit your ticket. Please try again or email help@serverizz.com." });
  } catch {
    return Response.json({ error: "Support is temporarily unavailable. Please try again." }, { status: 502 });
  }
}
```

- [ ] **Step 2: Verify it type-checks / builds**

Run: `npx tsc --noEmit`
Expected: no errors from `app/api/support-ticket/route.ts`.

- [ ] **Step 3: Commit**

```bash
git add app/api/support-ticket/route.ts
git commit -m "feat: /api/support-ticket route with Turnstile verification"
```

---

### Task 4: Client component `support-form.tsx`

**Files:**
- Create: `components/szz/support-form.tsx`

**Interfaces:**
- Consumes: `TicketType` shape `{ value, label }` (passed as plain props); `Input` (`components/ui/input`), `Button` (`components/ui/button`), `TurnstileWidget` (`components/szz/turnstile-widget`).
- Produces: `export function SupportForm({ turnstileSiteKey, ticketTypes }: { turnstileSiteKey: string; ticketTypes: { value: string; label: string }[] }): JSX.Element`

- [ ] **Step 1: Create the component**

Create `components/szz/support-form.tsx`:

```tsx
"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TurnstileWidget } from "@/components/szz/turnstile-widget";

type Status = "idle" | "submitting" | "error" | "done";

const display = "var(--font-heading)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";

const fieldStyle: React.CSSProperties = {
  height: 44,
  background: "var(--szz-bg-deep)",
  border: "1px solid var(--szz-border)",
  borderRadius: 8,
  padding: "0 14px",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  color: primary,
  outline: "none",
};

export function SupportForm({
  turnstileSiteKey,
  ticketTypes,
}: {
  turnstileSiteKey: string;
  ticketTypes: { value: string; label: string }[];
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [ticketType, setTicketType] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [token, setToken] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const onVerify = React.useCallback((t: string) => setToken(t), []);
  const onExpire = React.useCallback(() => setToken(null), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim(), em = email.trim(), su = subject.trim(), ms = message.trim();
    if (!n || !em || !su || !ms || !ticketType) {
      setStatus("error");
      setError("Please fill in every field and choose a topic.");
      return;
    }
    if (!token) {
      setStatus("error");
      setError("Please complete the verification.");
      return;
    }
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/support-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, email: em, subject: su, message: ms, ticketType, turnstileToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setStatus("done");
        return;
      }
      setStatus("error");
      setError(typeof data?.error === "string" ? data.error : "We couldn't submit your ticket.");
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
    }
  }

  const submitting = status === "submitting";

  if (status === "done") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <span style={{ width: 44, height: 44, borderRadius: 999, background: "var(--szz-green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "#06240f" }}>✓</span>
        </span>
        <h2 style={{ margin: 0, fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>Ticket received</h2>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--szz-text-muted)" }}>
          Thanks — we've logged your ticket and emailed you a confirmation. We'll reply by email shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <h2 style={{ margin: 0, fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>Send us a message</h2>

      {status === "error" && error && (
        <div role="alert" style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid var(--szz-red)", borderRadius: 8, background: "var(--szz-bg-deep)", padding: "11px 14px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-red)" }}>{error}</span>
        </div>
      )}

      <div className="szz-grid-2" style={{ gap: 14 }}>
        <Input label="Name" name="name" autoComplete="name" placeholder="Jane Baker" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email" type="email" name="email" autoComplete="email" placeholder="jane@mybakery.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <Input label="Subject" name="subject" placeholder="Brief summary" value={subject} onChange={(e) => setSubject(e.target.value)} required />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: light }}>Topic</span>
        <select
          aria-label="Topic"
          value={ticketType}
          onChange={(e) => setTicketType(e.target.value)}
          required
          style={{ ...fieldStyle, appearance: "auto" }}
        >
          <option value="" disabled>Select a topic…</option>
          {ticketTypes.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: light }}>Message</span>
        <textarea
          placeholder="Tell us what's up…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          style={{ minHeight: 120, background: "var(--szz-bg-deep)", border: "1px solid var(--szz-border)", borderRadius: 8, padding: "12px 14px", fontFamily: "var(--font-body)", fontSize: 14, color: primary, resize: "vertical", outline: "none" }}
        />
      </div>

      <TurnstileWidget siteKey={turnstileSiteKey} onVerify={onVerify} onExpire={onExpire} />

      <div>
        <Button type="submit" variant="primary" size="lg" disabled={submitting || !token}>
          {submitting ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Verify it type-checks**

Run: `npx tsc --noEmit`
Expected: no errors from `components/szz/support-form.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/szz/support-form.tsx
git commit -m "feat: SupportForm client component with Turnstile + ticket type"
```

---

### Task 5: Wire the form into `/support`

**Files:**
- Modify: `app/(site)/support/page.tsx`

**Interfaces:**
- Consumes: `getSupportTicketTypes` (Task 1), `SupportForm` (Task 4).

- [ ] **Step 1: Update imports**

In `app/(site)/support/page.tsx`, change the clientexec import (line 3) and add the form + a `TEST_SITE_KEY` constant:

```typescript
import { getPopularKbTopics, getSupportTicketTypes } from "@/lib/clientexec";
import { SupportForm } from "@/components/szz/support-form";
```

Add near the other module constants (after line 23):

```typescript
const TEST_SITE_KEY = "1x00000000000000000000AA";
```

- [ ] **Step 2: Fetch types + site key in the component**

Replace the body start (line 52–53):

```typescript
export default async function SupportPage() {
  const topics = await getPopularKbTopics();
```

with:

```typescript
export default async function SupportPage() {
  const [topics, ticketTypes] = await Promise.all([getPopularKbTopics(), getSupportTicketTypes()]);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? TEST_SITE_KEY;
```

- [ ] **Step 3: Replace the static form**

Replace the entire `<Card>` block containing the old `<form>` (lines 93–117) with:

```tsx
          <Card>
            <SupportForm turnstileSiteKey={siteKey} ticketTypes={ticketTypes} />
          </Card>
```

- [ ] **Step 4: Verify build + tests**

Run: `npx tsc --noEmit && npm test`
Expected: type-check clean; all tests pass.

- [ ] **Step 5: Commit**

```bash
git add "app/(site)/support/page.tsx"
git commit -m "feat: wire ClientExec ticket form into /support page"
```

---

## Manual verification (after CE Turnstile is disabled — owner action)

1. Confirm Turnstile is disabled on CE's `saveticket` endpoint.
2. `npm run dev`, open `/support`, complete the form (each ticket type selectable), submit.
3. Confirm the ticket appears in ClientExec and the guest receives CE's confirmation email.
4. If submission reports failure despite the ticket landing (or vice-versa), tune `isTicketSuccess` against the observed redirect `Location`.
5. Confirm an empty Turnstile blocks submission (button disabled until solved; server rejects a missing token).

## Self-Review notes

- **Spec coverage:** types live-fetch+fallback (Task 1) ✓; guest submission two-step multipart (Task 2) ✓; our-Turnstile API route w/ type validation (Task 3) ✓; client form w/ Subject + dropdown + branded success (Task 4) ✓; page wiring (Task 5) ✓; tests in `lib/clientexec.test.ts` ✓; manual verification + CE-Turnstile prerequisite ✓.
- **Type consistency:** `TicketType = { value, label }` used as `SUPPORT_TICKET_TYPES_FALLBACK`, `getSupportTicketTypes`, route `VALID_TYPES`, and `SupportForm` props (passed structurally). `createSupportTicket` input `{ name, email, subject, message, ticketType }` matches the route call and `isTicketSuccess` signature `(status, location, body)`.
- **Out of scope:** file attachments, hero search box, logged-in submission.

# Maintenance-aware Announcement Bar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static "Free site migrations…" announcement-bar line with an amber-dot performance-degradation notice (linking to status.serverizz.com) whenever an Uptime Kuma maintenance window is active.

**Architecture:** A server-only module (`lib/uptime-kuma.ts`) fetches Uptime Kuma's public status-page JSON and evaluates whether a maintenance window is active right now. A thin App Router route handler (`app/api/maintenance-status/route.ts`) exposes that as `{ active, title }`. The client `SiteNav` component polls the route handler every 60s and swaps the announcement bar's dot/text/link when `active` is true, defaulting to the existing marketing line on any error.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19, TypeScript, Vitest (node env). No new dependencies.

## Global Constraints

- **No API key needed.** The status-page JSON endpoint is public. Never read a secret in client code.
- **Fail safe.** Any error, non-200, malformed JSON, timeout, or "no active maintenance" → `{ active: false }` → marketing line shows. The notice appears ONLY on a confident `active: true`.
- **Endpoint:** `https://status.serverizz.com/api/status-page/web` (status-page slug is `web`). Overridable via `process.env.UPTIME_KUMA_STATUS_URL`.
- **Env convention:** read with `process.env.X ?? "<default>"`, matching `lib/clientexec.ts`.
- **Test convention:** Vitest, `import { describe, it, expect, vi, afterEach } from "vitest"`, `@/` path alias, mock fetch via `vi.stubGlobal("fetch", …)` + `afterEach(() => vi.unstubAllGlobals())`. Test files end in `.test.ts`.
- **Amber color:** reuse the existing `var(--szz-yellow)` token (`#f59e0b`). Green dot uses `var(--szz-green)`.
- **Bar link target:** `https://status.serverizz.com` (NOT the `/status/web` deep link).
- **Copy (verbatim):**
  - Normal: `Free site migrations on every plan — we do the moving for you.`
  - Maintenance: `Scheduled maintenance in progress — you may notice slower performance. View status →`
- **This is a non-standard Next.js 16 (per AGENTS.md).** Before writing the route handler (Task 3), skim `node_modules/next/dist/docs/` for the current route-handler + fetch-caching conventions; adapt the code below if they differ.

## File Structure

- `lib/uptime-kuma.ts` (create) — types, the pure `evaluateMaintenance()` evaluator, and the `getMaintenanceStatus()` fetch wrapper. All Uptime-Kuma-shape knowledge lives here.
- `lib/uptime-kuma.test.ts` (create) — unit tests for the evaluator and the fetch wrapper.
- `app/api/maintenance-status/route.ts` (create) — GET route handler returning `MaintenanceStatus` JSON.
- `app/api/maintenance-status/route.test.ts` (create) — route handler test.
- `components/szz/site-nav.tsx` (modify, announcement bar at lines 72–103) — add `useMaintenanceStatus()` hook and conditional bar rendering.
- `.env.example` (modify) — document the new optional env vars.

---

### Task 1: Maintenance evaluator (pure logic)

The pure, time-injectable core: given the parsed status-page JSON and a `now`, decide if maintenance is active. Isolating this from `fetch` makes the version-specific Uptime Kuma shape fully unit-testable.

**Files:**
- Create: `lib/uptime-kuma.ts`
- Test: `lib/uptime-kuma.test.ts`

**Interfaces:**
- Consumes: nothing (first task).
- Produces:
  - `type MaintenanceStatus = { active: boolean; title: string | null }`
  - `type StatusPageResponse = { maintenanceList?: MaintenanceEntry[] }` (and `MaintenanceEntry`, `Timeslot` below)
  - `export function evaluateMaintenance(data: StatusPageResponse, now: Date): MaintenanceStatus`

> **Shape note / verification:** Uptime Kuma serves each maintenance entry with a computed `status` string (`"under-maintenance"`, `"scheduled"`, `"inactive"`, `"ended"`) plus a `timeslotList`. The evaluator prefers `status === "under-maintenance"` when present (Kuma already accounts for recurrence + timezone) and falls back to timeslot start/end comparison for older versions. During implementation, `curl -s https://status.serverizz.com/api/status-page/web | jq '.maintenanceList'` to confirm the field names; if they differ, adjust the types and the two checks in `isEntryActive` accordingly (and update the fixtures in the test).

- [ ] **Step 1: Write the failing test**

Create `lib/uptime-kuma.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { evaluateMaintenance } from "@/lib/uptime-kuma";

const NOW = new Date("2026-06-19T12:00:00.000Z");

describe("evaluateMaintenance", () => {
  it("is inactive when maintenanceList is missing or empty", () => {
    expect(evaluateMaintenance({}, NOW)).toEqual({ active: false, title: null });
    expect(evaluateMaintenance({ maintenanceList: [] }, NOW)).toEqual({ active: false, title: null });
  });

  it("is active when an entry has status 'under-maintenance'", () => {
    const data = { maintenanceList: [{ title: "DB upgrade", status: "under-maintenance" }] };
    expect(evaluateMaintenance(data, NOW)).toEqual({ active: true, title: "DB upgrade" });
  });

  it("is inactive for scheduled/inactive/ended statuses", () => {
    for (const status of ["scheduled", "inactive", "ended"]) {
      const data = { maintenanceList: [{ title: "Later", status }] };
      expect(evaluateMaintenance(data, NOW)).toEqual({ active: false, title: null });
    }
  });

  it("falls back to timeslot window when no status field is present", () => {
    const data = {
      maintenanceList: [
        {
          title: "Network work",
          timeslotList: [{ startDate: "2026-06-19T11:00:00.000Z", endDate: "2026-06-19T13:00:00.000Z" }],
        },
      ],
    };
    expect(evaluateMaintenance(data, NOW)).toEqual({ active: true, title: "Network work" });
  });

  it("is inactive when now is outside every timeslot", () => {
    const data = {
      maintenanceList: [
        { title: "Past", timeslotList: [{ startDate: "2026-06-19T08:00:00.000Z", endDate: "2026-06-19T09:00:00.000Z" }] },
      ],
    };
    expect(evaluateMaintenance(data, NOW)).toEqual({ active: false, title: null });
  });

  it("ignores timeslot entries explicitly marked active:false", () => {
    const data = {
      maintenanceList: [
        { title: "Disabled", active: false, timeslotList: [{ startDate: "2026-06-19T11:00:00.000Z", endDate: "2026-06-19T13:00:00.000Z" }] },
      ],
    };
    expect(evaluateMaintenance(data, NOW)).toEqual({ active: false, title: null });
  });

  it("returns null title when the active entry has no usable title", () => {
    const data = { maintenanceList: [{ title: "   ", status: "under-maintenance" }] };
    expect(evaluateMaintenance(data, NOW)).toEqual({ active: true, title: null });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/uptime-kuma.test.ts`
Expected: FAIL — `evaluateMaintenance` is not exported / module not found.

- [ ] **Step 3: Write minimal implementation**

Create `lib/uptime-kuma.ts`:

```ts
/** Server-side Uptime Kuma status-page access. Do not import from client components. */

export type MaintenanceStatus = { active: boolean; title: string | null };

type Timeslot = { startDate?: string; endDate?: string };
type MaintenanceEntry = {
  title?: string;
  /** Kuma sets this to false for disabled maintenances. */
  active?: boolean;
  /** Computed by Kuma: "under-maintenance" | "scheduled" | "inactive" | "ended". */
  status?: string;
  timeslotList?: Timeslot[];
};
export type StatusPageResponse = { maintenanceList?: MaintenanceEntry[] };

function isEntryActive(m: MaintenanceEntry, now: Date): boolean {
  // Prefer Kuma's computed status (handles recurrence + timezone for us).
  if (typeof m.status === "string") return m.status === "under-maintenance";
  // Fallback for versions without a computed status: check timeslot windows.
  if (m.active === false) return false;
  const t = now.getTime();
  return (m.timeslotList ?? []).some((s) => {
    const start = s.startDate ? Date.parse(s.startDate) : NaN;
    const end = s.endDate ? Date.parse(s.endDate) : NaN;
    return Number.isFinite(start) && Number.isFinite(end) && t >= start && t <= end;
  });
}

export function evaluateMaintenance(data: StatusPageResponse, now: Date): MaintenanceStatus {
  for (const m of data?.maintenanceList ?? []) {
    if (isEntryActive(m, now)) {
      return { active: true, title: m.title?.trim() || null };
    }
  }
  return { active: false, title: null };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/uptime-kuma.test.ts`
Expected: PASS (all 7 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/uptime-kuma.ts lib/uptime-kuma.test.ts
git commit -m "feat: add Uptime Kuma maintenance evaluator"
```

---

### Task 2: Status fetch wrapper

Wrap the public status-page fetch with an env-configurable URL, a 3s abort timeout, and fail-safe error handling, delegating the decision to `evaluateMaintenance`.

**Files:**
- Modify: `lib/uptime-kuma.ts` (append)
- Test: `lib/uptime-kuma.test.ts` (append)

**Interfaces:**
- Consumes: `evaluateMaintenance`, `MaintenanceStatus`, `StatusPageResponse` from Task 1.
- Produces: `export async function getMaintenanceStatus(): Promise<MaintenanceStatus>`

- [ ] **Step 1: Write the failing test**

Append to `lib/uptime-kuma.test.ts`:

```ts
import { vi, afterEach } from "vitest";
import { getMaintenanceStatus } from "@/lib/uptime-kuma";

function mockFetchOnce(json: unknown, ok = true) {
  return vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(json) });
}

afterEach(() => vi.unstubAllGlobals());

describe("getMaintenanceStatus", () => {
  it("reports active when the upstream shows an in-progress maintenance", async () => {
    vi.stubGlobal("fetch", mockFetchOnce({ maintenanceList: [{ title: "DB upgrade", status: "under-maintenance" }] }));
    expect(await getMaintenanceStatus()).toEqual({ active: true, title: "DB upgrade" });
  });

  it("fails safe to inactive on a non-200 response", async () => {
    vi.stubGlobal("fetch", mockFetchOnce({}, false));
    expect(await getMaintenanceStatus()).toEqual({ active: false, title: null });
  });

  it("fails safe to inactive when the fetch rejects (network/timeout)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    expect(await getMaintenanceStatus()).toEqual({ active: false, title: null });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/uptime-kuma.test.ts`
Expected: FAIL — `getMaintenanceStatus` is not exported.

- [ ] **Step 3: Write minimal implementation**

Append to `lib/uptime-kuma.ts`:

```ts
const STATUS_URL =
  process.env.UPTIME_KUMA_STATUS_URL ?? "https://status.serverizz.com/api/status-page/web";
const TIMEOUT_MS = 3000;

export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(STATUS_URL, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      // Share one upstream call across visitors for ~45s.
      next: { revalidate: 45 },
    });
    if (!res.ok) return { active: false, title: null };
    const data = (await res.json()) as StatusPageResponse;
    return evaluateMaintenance(data, new Date());
  } catch {
    return { active: false, title: null };
  } finally {
    clearTimeout(timer);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/uptime-kuma.test.ts`
Expected: PASS (all tests, including the 3 new ones).

- [ ] **Step 5: Commit**

```bash
git add lib/uptime-kuma.ts lib/uptime-kuma.test.ts
git commit -m "feat: add fail-safe Uptime Kuma status fetch wrapper"
```

---

### Task 3: Maintenance-status route handler

Expose the status to the client as a tiny JSON endpoint. The upstream cache (Task 2's `revalidate: 45`) keeps visitor polling from hitting Kuma directly.

**Files:**
- Create: `app/api/maintenance-status/route.ts`
- Test: `app/api/maintenance-status/route.test.ts`

**Interfaces:**
- Consumes: `getMaintenanceStatus` from Task 2.
- Produces: `export async function GET(): Promise<Response>` returning JSON `{ active: boolean, title: string | null }`.

> Before writing, skim `node_modules/next/dist/docs/` for this Next version's route-handler conventions (per AGENTS.md). The shape below follows the existing `app/api/domain-search/route.ts` pattern (`Response.json(...)`); match whatever that file does.

- [ ] **Step 1: Write the failing test**

Create `app/api/maintenance-status/route.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { GET } from "@/app/api/maintenance-status/route";

afterEach(() => vi.unstubAllGlobals());

describe("GET /api/maintenance-status", () => {
  it("returns active:true with the title during a maintenance window", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ maintenanceList: [{ title: "DB upgrade", status: "under-maintenance" }] }),
      }),
    );
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ active: true, title: "DB upgrade" });
  });

  it("returns active:false when the upstream fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ active: false, title: null });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run app/api/maintenance-status/route.test.ts`
Expected: FAIL — module `@/app/api/maintenance-status/route` not found.

- [ ] **Step 3: Write minimal implementation**

Create `app/api/maintenance-status/route.ts`:

```ts
import { getMaintenanceStatus } from "@/lib/uptime-kuma";

export async function GET(): Promise<Response> {
  const status = await getMaintenanceStatus();
  return Response.json(status, {
    headers: { "Cache-Control": "public, max-age=30, s-maxage=45" },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run app/api/maintenance-status/route.test.ts`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add app/api/maintenance-status/route.ts app/api/maintenance-status/route.test.ts
git commit -m "feat: add /api/maintenance-status route handler"
```

---

### Task 4: Wire the announcement bar + document env

Poll the route handler from `SiteNav` and swap the bar's dot/text/link when maintenance is active. Document the new env vars. (The hook + JSX render in a browser; Vitest's node env can't render them, so this task is verified by build + manual check rather than a unit test — matching how the project treats its other client components.)

**Files:**
- Modify: `components/szz/site-nav.tsx` (announcement bar, lines 72–103; add hook near the top of the file)
- Modify: `.env.example`

**Interfaces:**
- Consumes: `GET /api/maintenance-status` (Task 3) → `{ active, title }`.
- Produces: no exports consumed by later tasks (final task).

- [ ] **Step 1: Add the polling hook**

In `components/szz/site-nav.tsx`, after the imports (below line 8) and before `const NAV_LINKS`, add:

```tsx
type MaintenanceState = { active: boolean; title: string | null };

function useMaintenanceStatus(): MaintenanceState {
  const [state, setState] = React.useState<MaintenanceState>({ active: false, title: null });
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/maintenance-status");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setState({ active: !!data.active, title: data.title ?? null });
      } catch {
        /* keep the default marketing line on any error */
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);
  return state;
}
```

- [ ] **Step 2: Read the maintenance state in `SiteNav`**

In `components/szz/site-nav.tsx`, inside `SiteNav`, add below `const pathname = usePathname();` (line 58):

```tsx
  const maintenance = useMaintenanceStatus();
```

- [ ] **Step 3: Replace the announcement bar markup**

Replace the entire `{/* announcement bar */}` block (lines 72–103) with:

```tsx
      {/* announcement bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderBottom: "1px solid var(--szz-border-subtle)",
          background: "var(--szz-bg-card)",
          padding: "8px 20px",
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: maintenance.active ? "var(--szz-yellow)" : "var(--szz-green)",
          }}
        />
        {maintenance.active ? (
          <Link
            href="https://status.serverizz.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: ".5px",
              color: "var(--szz-text-muted)",
              textDecoration: "none",
            }}
          >
            Scheduled maintenance in progress — you may notice slower performance. View status →
          </Link>
        ) : (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: ".5px",
              color: "var(--szz-text-muted)",
            }}
          >
            Free site migrations on every plan — we do the moving for you.
          </span>
        )}
      </div>
```

- [ ] **Step 4: Document the env vars**

Add to `.env.example`:

```
# Uptime Kuma status page (public JSON API) used to detect active maintenance windows.
# Optional — defaults to the production status page if unset.
UPTIME_KUMA_STATUS_URL=https://status.serverizz.com/api/status-page/web
# Not required: the status-page endpoint is public. Documented only as a fallback.
# UPTIME_KUMA_API_KEY=
```

- [ ] **Step 5: Verify the full suite, types, and build**

Run: `npm test`
Expected: PASS (all suites including the new `lib/uptime-kuma.test.ts` and `app/api/maintenance-status/route.test.ts`).

Run: `npx tsc --noEmit`
Expected: no type errors.

Run: `npm run build`
Expected: build succeeds (route `/api/maintenance-status` listed).

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, open the site.
- Default: green dot + "Free site migrations…" line (status endpoint returns `active:false`).
- Curl the endpoint directly: `curl -s localhost:3000/api/maintenance-status` → `{"active":false,"title":null}`.
- To see the active state without a real maintenance window: temporarily set `UPTIME_KUMA_STATUS_URL` to a local file/mock returning `{"maintenanceList":[{"title":"Test","status":"under-maintenance"}]}`, reload, confirm the amber dot + "Scheduled maintenance in progress…" link to status.serverizz.com appears, then revert.

- [ ] **Step 7: Commit**

```bash
git add components/szz/site-nav.tsx .env.example
git commit -m "feat: show maintenance notice in announcement bar during Uptime Kuma windows"
```

---

## Self-Review

**Spec coverage:**
- Detect active maintenance from Uptime Kuma → Tasks 1–2 (`evaluateMaintenance` + `getMaintenanceStatus`). ✓
- Public status-page endpoint `/api/status-page/web`, no API key → Task 2 default URL + Global Constraints. ✓
- Replace marketing line with degradation notice linking to status.serverizz.com → Task 4. ✓
- Amber dot + linked text, exact copy → Task 4, Global Constraints. ✓
- Route handler + 60s client poll + ~45s server cache → Task 2 (`revalidate: 45`), Task 3, Task 4 (`setInterval 60_000`). ✓
- Fail safe everywhere → Tasks 1–4 all default to inactive/marketing line; tested in Tasks 1–3. ✓
- 3s abort timeout → Task 2. ✓
- Env-configurable URL + `.env.example` doc + API-key fallback note → Task 2, Task 4 Step 4. ✓
- Unit tests for evaluator against active/scheduled/none/malformed fixtures → Task 1. ✓
- Reuse existing CSS token → Task 4 uses `var(--szz-yellow)`. ✓

**Placeholder scan:** No TBD/TODO; every code step shows full code and exact commands. The single deferred item (confirming Uptime Kuma's live JSON field names) is an explicit verification action in Task 1 with a concrete `curl | jq` command and a fallback already implemented — not a placeholder.

**Type consistency:** `MaintenanceStatus = { active: boolean; title: string | null }` is defined in Task 1 and used unchanged in Tasks 2 (return type), 3 (JSON body), and 4 (`MaintenanceState` mirrors it). `evaluateMaintenance(data, now)` and `getMaintenanceStatus()` signatures match across tasks. Endpoint path `/api/maintenance-status` is identical in Tasks 3 and 4.

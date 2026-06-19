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
  // A disabled maintenance is never active, regardless of computed status.
  if (m.active === false) return false;
  // Prefer Kuma's computed status (handles recurrence + timezone for us).
  if (typeof m.status === "string") return m.status === "under-maintenance";
  // Fallback for versions without a computed status: check timeslot windows.
  const t = now.getTime();
  return (m.timeslotList ?? []).some((s) => {
    const start = s.startDate ? Date.parse(s.startDate) : NaN;
    const end = s.endDate ? Date.parse(s.endDate) : NaN;
    return Number.isFinite(start) && Number.isFinite(end) && t >= start && t <= end;
  });
}

export function evaluateMaintenance(data: StatusPageResponse | null | undefined, now: Date): MaintenanceStatus {
  for (const m of data?.maintenanceList ?? []) {
    if (isEntryActive(m, now)) {
      return { active: true, title: m.title?.trim() || null };
    }
  }
  return { active: false, title: null };
}

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

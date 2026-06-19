import { describe, it, expect, vi, afterEach } from "vitest";
import { evaluateMaintenance, getMaintenanceStatus } from "@/lib/uptime-kuma";

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

  it("treats active:false as never active even when status says under-maintenance", () => {
    const data = { maintenanceList: [{ title: "Disabled", active: false, status: "under-maintenance" }] };
    expect(evaluateMaintenance(data, NOW)).toEqual({ active: false, title: null });
  });

  it("returns null title when the active entry has no usable title", () => {
    const data = { maintenanceList: [{ title: "   ", status: "under-maintenance" }] };
    expect(evaluateMaintenance(data, NOW)).toEqual({ active: true, title: null });
  });
});

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

  it("fails safe to inactive when the response body is malformed JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.reject(new SyntaxError("Unexpected token")) }));
    expect(await getMaintenanceStatus()).toEqual({ active: false, title: null });
  });
});

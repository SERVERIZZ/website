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

  it("treats active:false as never active even when status says under-maintenance", () => {
    const data = { maintenanceList: [{ title: "Disabled", active: false, status: "under-maintenance" }] };
    expect(evaluateMaintenance(data, NOW)).toEqual({ active: false, title: null });
  });

  it("returns null title when the active entry has no usable title", () => {
    const data = { maintenanceList: [{ title: "   ", status: "under-maintenance" }] };
    expect(evaluateMaintenance(data, NOW)).toEqual({ active: true, title: null });
  });
});

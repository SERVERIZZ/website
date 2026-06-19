import { describe, it, expect, vi, afterEach } from "vitest";
import { POST } from "@/app/api/domain-search/route";

const AVAILABLE = {
  error: false, success: true,
  search_results: { status: 0, available_options: [{ tld: "com", price: [{ period_id: "12", formated_price: "$16.68 USD" }] }] },
};

function req(body: unknown) {
  return new Request("http://localhost/api/domain-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => vi.unstubAllGlobals());

describe("POST /api/domain-search", () => {
  it("400s on invalid input", async () => {
    const res = await POST(req({ domain: "   " }));
    expect(res.status).toBe(400);
  });

  it("returns 502 when every lookup fails (total outage)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const res = await POST(req({ domain: "yourbakery.com" }));
    expect(res.status).toBe(502);
  });

  it("returns results with the typed domain first", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(AVAILABLE) }));
    const res = await POST(req({ domain: "yourbakery.io" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.query).toEqual({ name: "yourbakery", tld: "io" });
    expect(json.results[0].tld).toBe("io"); // typed tld first
    expect(json.results.length).toBeGreaterThan(1); // plus suggestions
  });
});

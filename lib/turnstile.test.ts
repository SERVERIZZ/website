import { describe, it, expect, vi, afterEach } from "vitest";
import { verifyTurnstile, resolveTurnstileSiteKey, TURNSTILE_TEST_SITE_KEY } from "@/lib/turnstile";

function mockSiteverify(json: unknown, ok = true) {
  return vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 500, json: () => Promise.resolve(json) });
}

afterEach(() => vi.unstubAllGlobals());

describe("verifyTurnstile", () => {
  it("returns true when Cloudflare reports success", async () => {
    vi.stubGlobal("fetch", mockSiteverify({ success: true }));
    expect(await verifyTurnstile("token")).toBe(true);
  });
  it("returns false when Cloudflare reports failure", async () => {
    vi.stubGlobal("fetch", mockSiteverify({ success: false, "error-codes": ["invalid-input-response"] }));
    expect(await verifyTurnstile("bad")).toBe(false);
  });
  it("passes remoteip when provided", async () => {
    const fetchMock = mockSiteverify({ success: true });
    vi.stubGlobal("fetch", fetchMock);
    await verifyTurnstile("token", "203.0.113.7");
    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.get("remoteip")).toBe("203.0.113.7");
  });
  it("throws when siteverify is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    await expect(verifyTurnstile("token")).rejects.toThrow();
  });
});

describe("resolveTurnstileSiteKey", () => {
  it("returns a configured real key", () => {
    expect(resolveTurnstileSiteKey("0xREALKEY123")).toBe("0xREALKEY123");
  });
  it("trims surrounding whitespace", () => {
    expect(resolveTurnstileSiteKey("  0xREALKEY123  ")).toBe("0xREALKEY123");
  });
  // The bug: a present-but-empty env var must fall back, not pass "" to Turnstile.
  it("falls back to the test key on an empty string", () => {
    expect(resolveTurnstileSiteKey("")).toBe(TURNSTILE_TEST_SITE_KEY);
  });
  it("falls back to the test key on whitespace only", () => {
    expect(resolveTurnstileSiteKey("   ")).toBe(TURNSTILE_TEST_SITE_KEY);
  });
  it("falls back to the test key when undefined", () => {
    expect(resolveTurnstileSiteKey(undefined)).toBe(TURNSTILE_TEST_SITE_KEY);
  });
});

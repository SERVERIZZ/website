/** Server-side Cloudflare Turnstile verification. Do not import from client components. */
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SECRET = process.env.TURNSTILE_SECRET_KEY ?? "";

/** Cloudflare's documented always-pass test site key (dev / unconfigured environments). */
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

/**
 * Resolve the client-side Turnstile site key, falling back to the test key when
 * none is configured. `??` alone is not enough: a present-but-empty env var (e.g.
 * `NEXT_PUBLIC_TURNSTILE_SITE_KEY=` in a build) yields "", which the widget rejects
 * with `Invalid input for parameter "sitekey"`. Treat blank/whitespace as missing.
 */
export function resolveTurnstileSiteKey(
  raw: string | undefined = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
): string {
  const key = raw?.trim();
  return key ? key : TURNSTILE_TEST_SITE_KEY;
}

/** Verify a Turnstile token with Cloudflare. Throws if siteverify is unreachable. */
export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const body = new URLSearchParams({ secret: SECRET, response: token });
  if (ip) body.set("remoteip", ip);
  const res = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Turnstile HTTP ${res.status}`);
  const json = (await res.json()) as { success?: boolean };
  return json.success === true;
}

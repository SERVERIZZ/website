/** Server-side Cloudflare Turnstile verification. Do not import from client components. */
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SECRET = process.env.TURNSTILE_SECRET_KEY ?? "";

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

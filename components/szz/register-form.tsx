"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TurnstileWidget } from "@/components/szz/turnstile-widget";
import { trackEvent } from "@/lib/analytics";

type Status = "idle" | "submitting" | "error" | "done";

export function RegisterForm({
  turnstileSiteKey,
  loginHref,
}: {
  turnstileSiteKey: string;
  loginHref: string;
}) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [token, setToken] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const onVerify = React.useCallback((t: string) => setToken(t), []);
  const onExpire = React.useCallback(() => setToken(null), []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fn = firstName.trim();
    const ln = lastName.trim();
    const em = email.trim();
    if (!fn || !ln || !em) {
      setStatus("error");
      setError("Enter your first name, last name and email.");
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
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: fn, lastName: ln, email: em, turnstileToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setStatus("done");
        // GA4 recommended event — no PII, just the conversion + method.
        trackEvent("sign_up", { method: "email" });
        return;
      }
      setStatus("error");
      setError(typeof data?.error === "string" ? data.error : "We couldn't create your account.");
      trackEvent("sign_up_error", { reason: "rejected" });
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
      trackEvent("sign_up_error", { reason: "network_error" });
    }
  }

  const submitting = status === "submitting";

  if (status === "done") {
    return (
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span style={{ width: 44, height: 44, borderRadius: 999, background: "var(--szz-green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, color: "#06240f" }}>✓</span>
          </span>
          <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, letterSpacing: "-.5px", color: "var(--szz-text-primary)" }}>
            Account created
          </h2>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--szz-text-muted)" }}>
            Check your email to confirm your address and finish setting up your account.
          </p>
          <p style={{ marginTop: 8, fontSize: 13, color: "var(--szz-text-muted)" }}>
            Ready to continue?{" "}
            <a href={loginHref} style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--szz-accent-blue)" }}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 400 }}>
      <div style={{ marginBottom: 30, display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 28, fontWeight: 700, letterSpacing: "-.5px", color: "var(--szz-text-primary)" }}>
          Create your account
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: "var(--szz-text-muted)" }}>
          Start with your details — no card required yet.
        </p>
      </div>

      {submitting && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, border: "1px solid var(--szz-border)", borderRadius: 8, background: "var(--szz-bg-deep)", padding: "11px 14px" }}>
          <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--szz-green)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-text-light)" }}>
            Creating your account…
          </span>
        </div>
      )}

      {status === "error" && error && (
        <div role="alert" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, border: "1px solid var(--szz-red)", borderRadius: 8, background: "var(--szz-bg-deep)", padding: "11px 14px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--szz-red)" }}>{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <Input label="First name" name="firstName" autoComplete="given-name" placeholder="Jane" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          <Input label="Last name" name="lastName" autoComplete="family-name" placeholder="Baker" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
        <Input label="Email" type="email" name="email" autoComplete="email" placeholder="you@yourbusiness.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TurnstileWidget siteKey={turnstileSiteKey} onVerify={onVerify} onExpire={onExpire} />
        <Button type="submit" variant="primary" size="lg" disabled={submitting || !token}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5, color: "var(--szz-text-faint)" }}>
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>

      <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "var(--szz-text-muted)" }}>
        Already have an account?{" "}
        <a href={loginHref} style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600, color: "var(--szz-accent-blue)" }}>
          Sign in
        </a>
      </p>
    </div>
  );
}

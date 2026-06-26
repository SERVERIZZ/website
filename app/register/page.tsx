import type { Metadata } from "next";
import Link from "next/link";
import { Rocket, BadgeCheck, UserRound, type LucideIcon } from "lucide-react";
import { TerminalLogo } from "@/components/szz/terminal-logo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { RegisterForm } from "@/components/szz/register-form";
import { resolveTurnstileSiteKey } from "@/lib/turnstile";

export const metadata: Metadata = {
  title: "Get started",
  description: "Create your SERVERIZZ account — migration included.",
  alternates: { canonical: "/register" },
};

const features: { Icon: LucideIcon; color: string; text: string }[] = [
  { Icon: Rocket, color: "var(--szz-accent-blue)", text: "Free, hands-off migration" },
  { Icon: BadgeCheck, color: "var(--szz-accent-blue)", text: "30-day money-back guarantee" },
  { Icon: UserRound, color: "var(--szz-green)", text: "A real account manager from day one" },
];

export default function RegisterPage() {
  const siteKey = resolveTurnstileSiteKey(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--szz-bg-deep)" }}>
      {/* left brand panel */}
      <div
        className="szz-login-aside"
        style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 40, padding: "56px 64px", background: "linear-gradient(135deg,#0B0E18 0%,#111827 50%,#0F172A 100%)", borderRight: "1px solid var(--szz-border)" }}
      >
        <Link href="/" aria-label="SERVERIZZ home" style={{ alignSelf: "flex-start" }}>
          <TerminalLogo size={28} />
        </Link>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <SectionEyebrow>Get_started</SectionEyebrow>
          <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 40, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1.5px", color: "#fff" }}>
            Online this afternoon. <br />Migration included.
          </h1>
          <p style={{ margin: 0, maxWidth: 420, fontSize: 16, lineHeight: 1.6, color: "var(--szz-text-muted)" }}>
            Create your account in under a minute. Pick a plan next — your dedicated account manager handles the setup and the move.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
            {features.map(({ Icon, color, text }) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Icon size={18} style={{ color }} />
                <span style={{ fontSize: 14, color: "var(--szz-text-light)" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <span style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "var(--szz-text-faint)" }}>
          © 2026 Rizz Enterprises, LLC
        </span>
      </div>

      {/* right form panel */}
      <div style={{ width: 560, maxWidth: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 64px", background: "var(--szz-bg-card)" }}>
        <RegisterForm turnstileSiteKey={siteKey} loginHref="/login" />
      </div>
    </div>
  );
}

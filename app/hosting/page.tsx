import type { Metadata } from "next";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Card } from "@/components/ui/card";
import { PlanPricing } from "@/components/szz/plan-pricing";

export const metadata: Metadata = {
  title: "Hosting plans",
  description:
    "Two fully-managed hosting plans — Entrepreneur and Engineer. Free migration, SSL, daily backups and a dedicated account manager as standard.",
};

const display = "var(--font-heading)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";

const included = [
  ["5 email mailboxes", "on your own domain"],
  ["cPanel & WHM", "the control panel you know"],
  ["CloudLinux 10", "stable, isolated tenancy"],
  ["MultiPHP Selector", "PHP 5.6 to current"],
  ["Imunify360", "proactive security & WAF"],
  ["CageFS", "per-account isolation"],
  ["SITEJET builder", "AI website generation"],
  ["WP Toolkit", "manage every WordPress site"],
  ["Site Quality Monitoring", "catch issues early"],
];

const compareRows: { feature: string; ent: string; eng: string; entGreen?: boolean; engGreen?: boolean }[] = [
  { feature: "Websites", ent: "5", eng: "Unlimited" },
  { feature: "Storage", ent: "25 GB SSD", eng: "100 GB SSD" },
  { feature: "Bandwidth", ent: "1 TB", eng: "1 TB" },
  { feature: "Email mailboxes", ent: "5", eng: "5" },
  { feature: "Node.js & Python apps", ent: "—", eng: "✓", engGreen: true },
  { feature: "SSH & Git deploy", ent: "—", eng: "✓", engGreen: true },
  { feature: "Dedicated account manager", ent: "✓", eng: "✓", entGreen: true, engGreen: true },
];

const faqs = [
  ["Can I switch plans later?", "Anytime — upgrades are instant, no re-migration."],
  ["Do you really migrate my site free?", "Yes — your account manager handles the move."],
  ["What's the refund policy?", "30 days, money back, no questions asked."],
];

const cell = { padding: "14px 20px" } as const;

export default function HostingPage() {
  return (
    <div>
      {/* hero */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          padding: "80px 24px 40px",
          textAlign: "center",
          maxWidth: 680,
          margin: "0 auto",
        }}
      >
        <SectionEyebrow>Plans</SectionEyebrow>
        <h1 style={{ margin: 0, fontFamily: display, fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-1.5px", color: primary }}>
          Pick a plan. Change it whenever.
        </h1>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: muted }}>
          Both plans are fully managed — free migration, SSL, daily backups and a dedicated account
          manager included as standard.
        </p>
      </section>

      {/* pricing (client toggle) */}
      <section style={{ padding: "20px 24px 90px" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
          <PlanPricing />
        </div>

        <div style={{ maxWidth: 840, margin: "32px auto 0" }}>
          <Card surface="deep">
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <SectionEyebrow tone="green" slashes={false}>Both plans also include</SectionEyebrow>
                <h3 style={{ margin: 0, fontFamily: display, fontSize: 24, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
                  A serious managed stack — as standard
                </h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: muted }}>
                  Every account runs on a cPanel &amp; WHM server with CloudLinux 10 — hardened,
                  isolated and fully managed by us.
                </p>
              </div>
              <div className="szz-grid-3" style={{ gap: "18px 24px" }}>
                {included.map(([title, sub]) => (
                  <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ color: "var(--szz-green)", fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>✓</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: light }}>{title}</span>
                      <span style={{ fontSize: 12, color: "var(--szz-text-dim)" }}>{sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* comparison */}
      <section style={{ background: "var(--szz-bg-card)", padding: "80px 24px" }}>
        <div style={{ maxWidth: 840, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
          <h2 style={{ margin: 0, textAlign: "center", fontFamily: display, fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
            Compare the details
          </h2>
          <div style={{ border: "1px solid var(--szz-border)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", background: "var(--szz-bg-raised)", borderBottom: "1px solid var(--szz-border)" }}>
              <div style={{ ...cell, fontSize: 13, fontWeight: 600, color: light }}>Feature</div>
              <div style={{ ...cell, textAlign: "center", fontSize: 13, fontWeight: 600, color: primary }}>Entrepreneur</div>
              <div style={{ ...cell, textAlign: "center", fontSize: 13, fontWeight: 600, color: primary }}>Engineer</div>
            </div>
            {compareRows.map((row, i) => (
              <div
                key={row.feature}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.8fr 1fr 1fr",
                  borderBottom: i === compareRows.length - 1 ? "none" : "1px solid var(--szz-border)",
                  fontSize: 14,
                  color: muted,
                }}
              >
                <div style={cell}>{row.feature}</div>
                <div style={{ ...cell, textAlign: "center", color: row.ent === "—" ? "var(--szz-text-faint)" : row.entGreen ? "var(--szz-green)" : light }}>{row.ent}</div>
                <div style={{ ...cell, textAlign: "center", color: row.eng === "—" ? "var(--szz-text-faint)" : row.engGreen ? "var(--szz-green)" : light }}>{row.eng}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <h2 style={{ margin: "0 0 12px", textAlign: "center", fontFamily: display, fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
            Questions, answered
          </h2>
          {faqs.map(([q, a]) => (
            <div
              key={q}
              style={{
                border: "1px solid var(--szz-border)",
                borderRadius: 10,
                padding: "18px 22px",
                background: "var(--szz-bg-card)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 15, color: primary }}>{q}</span>
              <span style={{ fontSize: 14, color: muted }}>{a}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

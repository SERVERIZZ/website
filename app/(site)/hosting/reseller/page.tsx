import type { Metadata } from "next";
import Link from "next/link";
import {
  EyeOff,
  LayoutDashboard,
  Box,
  ShieldCheck,
  Lock,
  UserRound,
} from "lucide-react";
import { BreadcrumbJsonLd } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Terminal } from "@/components/szz/terminal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { rsLines } from "@/lib/szz-data";
import { breadcrumbTrail, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Reseller hosting",
  description:
    "A boutique, single-node reseller plan for web designers and agencies. Spin up white-label cPanel accounts for your clients in WHM — they never see SERVERIZZ.",
  path: "/hosting/reseller",
});

const display = "var(--font-heading)";
const mono = "var(--font-mono)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";
const dim = "var(--szz-text-dim)";

const pills = ["WHM & cPanel", "White-label nameservers", "Free migration", "$0 setup fee"];

const plans = [
  {
    name: "Reseller 10x",
    badge: "10 accounts",
    blurb: "For your first handful of clients.",
    price: "$59",
    annual: "$708/yr billed annually",
    cta: "Choose Reseller 10x",
    variant: "secondary" as const,
    popular: false,
    features: [
      "10 cPanel accounts",
      "30 GB pooled SSD disk",
      "1 TB/mo bandwidth (soft)",
      "White-label WHM & nameservers",
      "ClientExec license (billing & support)",
      "Free migration · $0 setup",
      "Dedicated account manager",
    ],
  },
  {
    name: "Reseller 25x",
    badge: "Best value",
    blurb: "For a growing book of business.",
    price: "$129",
    annual: "$1,548/yr billed annually",
    cta: "Choose Reseller 25x",
    variant: "primary" as const,
    popular: true,
    features: [
      "25 cPanel accounts",
      "75 GB pooled SSD disk",
      "2 TB/mo bandwidth (soft)",
      "White-label WHM & nameservers",
      "ClientExec license (billing & support)",
      "Free migration · $0 setup",
      "Dedicated account manager",
    ],
  },
];

const reasons = [
  { Icon: EyeOff, color: "var(--szz-accent-blue)", title: "Fully white-label", body: "Your nameservers, your brand in cPanel. Clients never see us." },
  { Icon: LayoutDashboard, color: "var(--szz-accent-blue)", title: "WHM control", body: "Create, suspend and manage accounts and packages from full WHM." },
  { Icon: Box, color: "var(--szz-accent-blue)", title: "CageFS isolation", body: "Every account is isolated on CloudLinux — one noisy site can't sink the rest." },
  { Icon: ShieldCheck, color: "var(--szz-accent-blue)", title: "Imunify360", body: "Proactive malware scanning and a WAF protecting every client site." },
  { Icon: Lock, color: "var(--szz-accent-blue)", title: "Free AutoSSL", body: "SSL issued and renewed automatically on every account you create." },
  { Icon: UserRound, color: "var(--szz-green)", title: "Account manager", body: "A real person who knows your node — and helps you grow into it." },
];

const compare: [string, string, string][] = [
  ["cPanel accounts", "10", "25"],
  ["Pooled SSD disk", "30 GB", "75 GB"],
  ["Bandwidth (soft)", "1 TB/mo", "2 TB/mo"],
  ["Annual price", "$708/yr", "$1,548/yr"],
  ["White-label & WHM", "✓", "✓"],
  ["ClientExec license", "✓", "✓"],
  ["Setup fee", "$0", "$0"],
];

const faqs = [
  ["Is it really white-label?", "Yes — your own nameservers and branding; clients never see SERVERIZZ."],
  ["What's a “soft” bandwidth limit?", "A guideline, not a hard cap — we'll reach out before anything is throttled."],
  ["Can I move from 10 to 25 later?", "Anytime — your account manager bumps the pool with no re-migration."],
  ["Is there a setup fee?", "No — $0 to start. Optional one-time provisioning is available on request."],
];

export default function ResellerPage() {
  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 24px 0" }}>
      <BreadcrumbJsonLd items={breadcrumbTrail("Reseller hosting", "/hosting/reseller")} />
      {/* breadcrumb */}
      <div style={{ fontFamily: mono, fontSize: 12, color: dim, marginBottom: 24 }}>
        <Link href="/hosting" className="szz-link-accent" style={{ fontFamily: mono, fontSize: 12, color: dim }}>
          Plans
        </Link>{" "}
        / <span style={{ color: "var(--szz-accent-blue)" }}>Reseller Hosting</span>
      </div>

      {/* hero */}
      <section className="szz-hero-grid" style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 40, alignItems: "start", paddingBottom: 70 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SectionEyebrow>Reseller Hosting</SectionEyebrow>
          <h1 style={{ margin: 0, fontFamily: display, fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-1.5px", color: primary }}>
            Sell hosting under your own brand.
          </h1>
          <p style={{ margin: 0, maxWidth: 480, fontSize: 17, lineHeight: 1.6, color: muted }}>
            A boutique, single-node reseller plan for web designers and agencies. Spin up
            white-label cPanel accounts for your clients in WHM — they never see SERVERIZZ.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {pills.map((p) => (
              <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 6, border: "1px solid var(--szz-border)", borderRadius: 999, padding: "6px 14px", fontSize: 13, color: light }}>
                <span style={{ color: "var(--szz-green)" }}>✓</span> {p}
              </span>
            ))}
          </div>
        </div>

        <Terminal title="WHM — reseller" lines={rsLines} />
      </section>

      {/* pricing: two plans */}
      <section style={{ paddingBottom: 30 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center", marginBottom: 36 }}>
          <SectionEyebrow>Plans</SectionEyebrow>
          <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(24px, 5vw, 32px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
            Two sizes. Both billed annually.
          </h2>
          <p style={{ margin: 0, fontSize: 15, color: muted }}>
            Start with ten accounts, move up to twenty-five as your book grows.
          </p>
        </div>
        <div className="fill-cards" style={{ maxWidth: 840, margin: "0 auto", display: "flex", gap: 24, alignItems: "stretch", flexWrap: "wrap" }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{ flex: 1, minWidth: 300 }}>
              <Card popular={plan.popular}>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: display, fontSize: 24, fontWeight: 700, color: primary }}>{plan.name}</span>
                    <Badge variant="accent">{plan.badge}</Badge>
                  </div>
                  <span style={{ fontSize: 14, color: muted }}>{plan.blurb}</span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontFamily: display, fontSize: 48, fontWeight: 700, color: primary }}>{plan.price}</span>
                    <span style={{ fontSize: 15, color: dim }}>/mo</span>
                  </div>
                  <span style={{ fontFamily: mono, fontSize: 12, color: dim, marginTop: -8 }}>{plan.annual}</span>
                  <Button asChild variant={plan.variant} size="lg" style={{ width: "100%" }}>
                    <Link href="/support">{plan.cta}</Link>
                  </Button>
                  <div style={{ height: 1, background: "var(--szz-border)" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {plan.features.map((f) => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: light }}>
                        <span style={{ color: "var(--szz-green)", fontWeight: 700 }}>✓</span> {f}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* why resell with us */}
      <section style={{ padding: "60px 0 70px" }}>
        <h2 style={{ margin: "0 0 28px", fontFamily: display, fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
          Why resell with SERVERIZZ
        </h2>
        <div className="szz-grid-3" style={{ gap: 18 }}>
          {reasons.map(({ Icon, color, title, body }) => (
            <Card key={title}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Icon size={22} style={{ color }} />
                <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: primary }}>{title}</span>
                <span style={{ fontSize: 14, lineHeight: 1.5, color: muted }}>{body}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* spec comparison */}
      <section style={{ paddingBottom: 80 }}>
        <h2 style={{ margin: "0 0 24px", fontFamily: display, fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
          Compare the two
        </h2>
        <div style={{ border: "1px solid var(--szz-border)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", background: "var(--szz-bg-raised)", borderBottom: "1px solid var(--szz-border)" }}>
            <div style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, color: light }}>Feature</div>
            <div style={{ padding: "14px 20px", textAlign: "center", fontSize: 13, fontWeight: 600, color: primary }}>Reseller 10x</div>
            <div style={{ padding: "14px 20px", textAlign: "center", fontSize: 13, fontWeight: 600, color: primary }}>Reseller 25x</div>
          </div>
          {compare.map(([feature, a, b], i) => {
            const isCheck = (v: string) => v === "✓";
            return (
              <div key={feature} style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr", borderBottom: i === compare.length - 1 ? "none" : "1px solid var(--szz-border)", fontSize: 14, color: muted }}>
                <div style={{ padding: "14px 20px" }}>{feature}</div>
                <div style={{ padding: "14px 20px", textAlign: "center", color: isCheck(a) ? "var(--szz-green)" : light }}>{a}</div>
                <div style={{ padding: "14px 20px", textAlign: "center", color: isCheck(b) ? "var(--szz-green)" : light }}>{b}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ paddingBottom: 80 }}>
        <h2 style={{ margin: "0 0 20px", fontFamily: display, fontSize: "clamp(24px, 4vw, 30px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
          Reseller questions
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map(([q, a]) => (
            <div key={q} style={{ border: "1px solid var(--szz-border)", borderRadius: 10, padding: "18px 22px", background: "var(--szz-bg-card)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 15, color: primary }}>{q}</span>
              <span style={{ fontSize: 14, color: muted }}>{a}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingBottom: 90 }}>
        <Card surface="deep">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center", padding: 18 }}>
            <h3 style={{ margin: 0, fontFamily: display, fontSize: 26, fontWeight: 700, letterSpacing: "-.5px", color: primary }}>
              Ready to start reselling?
            </h3>
            <p style={{ margin: 0, maxWidth: 460, fontSize: 15, color: muted }}>
              Talk to us about your client base and we&apos;ll size the right node — and move your
              existing accounts in for free.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <Button asChild variant="primary" size="lg">
                <Link href="/register">Get started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/support">Talk to us</Link>
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  ArrowDownUp,
  Server,
  Terminal,
  ShieldCheck,
  Rocket,
  Zap,
  UserRound,
  DatabaseBackup,
  Layers,
  Globe,
  UserRoundCog,
  type LucideIcon,
} from "lucide-react";
import { BreadcrumbJsonLd, JsonLdScript } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { breadcrumbTrail, pageMetadataFor, serviceJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadataFor("/dedicated");

const display = "var(--font-heading)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";

const heroBody =
  "Single-tenant bare metal, hardened and monitored. Dedicated cores, NVMe-class storage, and a guided migration — without the ops burden.";

const ctaBody =
  "Tell us what you're running and your account manager will spec the right machine — and handle the move.";

type Spec = { Icon: LucideIcon; label: string };

type Plan = {
  name: string;
  blurb: string;
  price: string;
  popular?: boolean;
  variant: "primary" | "secondary";
  orderUrl: string;
  specs: Spec[];
};

const plans: Plan[] = [
  {
    name: "METAL 4",
    blurb: "A server that's yours alone — ready to grow into.",
    price: "$279",
    variant: "secondary",
    orderUrl: "https://go.serverizz.com/order.php?step=1&productGroup=6&product=590",
    specs: [
      { Icon: Cpu, label: "4 cores / 8 threads Xeon" },
      { Icon: MemoryStick, label: "32 GB RAM" },
      { Icon: HardDrive, label: "2 × 240 GB SSD" },
      { Icon: ArrowDownUp, label: "10 TB transfer" },
    ],
  },
  {
    name: "METAL 8",
    blurb: "Serious capacity for high-traffic sites and portfolios.",
    price: "$549",
    popular: true,
    variant: "primary",
    orderUrl: "https://go.serverizz.com/order.php?step=1&productGroup=6&product=591",
    specs: [
      { Icon: Cpu, label: "8 cores / 16 threads Xeon" },
      { Icon: MemoryStick, label: "128 GB RAM" },
      { Icon: HardDrive, label: "2 × 1.92 TB NVMe" },
      { Icon: ArrowDownUp, label: "10 TB transfer" },
    ],
  },
  {
    name: "METAL 24",
    blurb: "Enterprise-grade power, configured to your specs.",
    price: "$999",
    variant: "secondary",
    orderUrl: "https://go.serverizz.com/order.php?step=1&productGroup=6&product=592",
    specs: [
      { Icon: Cpu, label: "24 cores AMD EPYC" },
      { Icon: MemoryStick, label: "256 GB RAM" },
      { Icon: HardDrive, label: "2 × 480 GB SSD + 2 × 1.92 TB NVMe" },
      { Icon: ArrowDownUp, label: "10 TB transfer" },
    ],
  },
];

const included: { Icon: LucideIcon; color: string; title: string; body: string }[] = [
  {
    Icon: Server,
    color: "var(--szz-accent-blue)",
    title: "Single-tenant hardware",
    body: "The whole machine is yours — no neighbors, no contention, predictable performance.",
  },
  {
    Icon: Terminal,
    color: "var(--szz-accent-blue)",
    title: "Full root access",
    body: "SSH in as root and run your stack your way — any OS, any control panel you license.",
  },
  {
    Icon: ShieldCheck,
    color: "var(--szz-green)",
    title: "Managed security",
    body: "Proactive hardening, patching and monitoring handled by our team.",
  },
  {
    Icon: Rocket,
    color: "var(--szz-accent-blue)",
    title: "Guided migration",
    body: "We move your sites and accounts across for you — planned and zero-drama.",
  },
  {
    Icon: Zap,
    color: "var(--szz-accent-blue)",
    title: "NVMe-class storage",
    body: "Fast, consistent I/O on enterprise drives — built for busy databases.",
  },
  {
    Icon: UserRound,
    color: "var(--szz-green)",
    title: "Dedicated account manager",
    body: "A real person who knows your server — on every plan.",
  },
];

const addOns: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: DatabaseBackup,
    title: "Off-server backups",
    body: "Scheduled full backups stored off the box, with one-click restore.",
  },
  {
    Icon: Layers,
    title: "Expanded cPanel accounts",
    body: "Scale your account tier as you add sites and clients to the server.",
  },
  {
    Icon: Globe,
    title: "Additional IPv4",
    body: "Extra dedicated addresses for SSL, segmentation or compliance.",
  },
  {
    Icon: UserRoundCog,
    title: "Priority managed hours",
    body: "Reserve hands-on engineering time for tuning, audits and projects.",
  },
];

export default function DedicatedPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={breadcrumbTrail("Dedicated Servers", "/dedicated")} />
      <JsonLdScript
        id="dedicated-service-jsonld"
        scriptKey="dedicated-service-jsonld"
        data={serviceJsonLd("/dedicated")}
      />

      {/* hero */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          padding: "80px 24px 44px",
          maxWidth: 760,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <SectionEyebrow>Dedicated Servers</SectionEyebrow>
        <h1 style={{ margin: 0, fontFamily: display, fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-1.5px", color: primary }}>
          A whole machine. Managed end to end.
        </h1>
        <p style={{ margin: 0, maxWidth: 580, fontSize: 17, lineHeight: 1.6, color: muted }}>{heroBody}</p>
      </section>

      {/* plan cards */}
      <section style={{ padding: "10px 24px 70px" }}>
        <div className="szz-grid-3 fill-cards" style={{ maxWidth: 1080, margin: "0 auto", alignItems: "stretch" }}>
          {plans.map((plan) => (
            <Card key={plan.name} popular={plan.popular} style={{ height: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 18, height: "100%" }}>
                {plan.popular ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>{plan.name}</span>
                    <Badge variant="accent">Most popular</Badge>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>{plan.name}</span>
                    <span style={{ fontSize: 13, color: muted }}>{plan.blurb}</span>
                  </div>
                )}
                {plan.popular && <span style={{ fontSize: 13, color: muted }}>{plan.blurb}</span>}
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: display, fontSize: 42, fontWeight: 700, color: plan.popular ? "var(--szz-accent-blue)" : primary }}>{plan.price}</span>
                  <span style={{ fontSize: 15, color: "var(--szz-text-dim)" }}>/mo</span>
                </div>
                <Button asChild variant={plan.variant} size="lg" style={{ width: "100%" }}>
                  <a href={plan.orderUrl} target="_blank" rel="noopener noreferrer">
                    Configure {plan.name}
                  </a>
                </Button>
                <div style={{ height: 1, background: "var(--szz-border)" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                  {plan.specs.map(({ Icon, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: light }}>
                      <Icon size={16} style={{ flexShrink: 0, color: "var(--szz-accent-blue)" }} /> {label}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <p style={{ maxWidth: 1080, margin: "18px auto 0", textAlign: "center", fontSize: 13, color: "var(--szz-text-dim)" }}>
          Single-tenant hardware in our Miami region. Prices billed monthly; multi-year terms available for METAL 24.
        </p>
      </section>

      {/* everything included */}
      <section style={{ background: "var(--szz-bg-card)", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>
            <SectionEyebrow>Every_server_includes</SectionEyebrow>
            <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
              Dedicated, but never on your own
            </h2>
          </div>
          <div className="szz-grid-3" style={{ gap: 18 }}>
            {included.map(({ Icon, color, title, body }) => (
              <Card key={title} surface="deep">
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Icon size={24} style={{ color }} />
                  <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: primary }}>{title}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>{body}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* add-ons */}
      <section style={{ padding: "80px 48px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>
            <SectionEyebrow tone="green" slashes={false}>Optional add-ons</SectionEyebrow>
            <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(24px, 4vw, 28px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
              Tailor it to your workload
            </h2>
          </div>
          <div className="szz-grid-2" style={{ gap: 18 }}>
            {addOns.map(({ Icon, title, body }) => (
              <Card key={title}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Icon size={20} style={{ color: "var(--szz-accent-blue)" }} />
                    <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: primary }}>{title}</span>
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>{body}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 24px 90px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <Card glow>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 540 }}>
                <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(24px, 4vw, 28px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
                  Outgrowing shared or VPS?
                </h2>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: muted }}>{ctaBody}</p>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button asChild variant="primary" size="lg">
                  <Link href="/support">Talk to our team</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/vps">Compare VPS</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import {
  Cpu,
  MemoryStick,
  HardDrive,
  ArrowDownUp,
  Terminal,
  Disc3,
  Zap,
  Globe,
  Shield,
  Camera,
  UserRoundCog,
  DatabaseBackup,
  type LucideIcon,
} from "lucide-react";
import { BreadcrumbJsonLd, JsonLdScript } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { breadcrumbTrail, pageMetadataFor, serviceJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadataFor("/vps");

const display = "var(--font-heading)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";

const heroBody =
  "High-performance NVMe virtual servers with complete control — pick your OS, install anything, and scale when you're ready. Deploy in any of our 32 regions.";

const ctaBody =
  "Pick a size, choose a region, and you're root before your coffee's poured. Not sure which fits? Your account manager will help you size it.";

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
    name: "VPS 2",
    blurb: "For a first server or side project.",
    price: "$29",
    variant: "secondary",
    orderUrl: "https://go.serverizz.com/order.php?step=1&productGroup=5&product=587",
    specs: [
      { Icon: Cpu, label: "1 vCPU" },
      { Icon: MemoryStick, label: "2 GB RAM" },
      { Icon: HardDrive, label: "50 GB NVMe SSD" },
      { Icon: ArrowDownUp, label: "2 TB transfer" },
    ],
  },
  {
    name: "VPS 4",
    blurb: "The sweet spot for most production apps.",
    price: "$52",
    popular: true,
    variant: "primary",
    orderUrl: "https://go.serverizz.com/order.php?step=1&productGroup=5&product=588",
    specs: [
      { Icon: Cpu, label: "2 vCPU" },
      { Icon: MemoryStick, label: "4 GB RAM" },
      { Icon: HardDrive, label: "100 GB NVMe SSD" },
      { Icon: ArrowDownUp, label: "3 TB transfer" },
    ],
  },
  {
    name: "VPS 8",
    blurb: "For demanding, multi-service workloads.",
    price: "$96",
    variant: "secondary",
    orderUrl: "https://go.serverizz.com/order.php?step=1&productGroup=5&product=589",
    specs: [
      { Icon: Cpu, label: "4 vCPU" },
      { Icon: MemoryStick, label: "8 GB RAM" },
      { Icon: HardDrive, label: "200 GB NVMe SSD" },
      { Icon: ArrowDownUp, label: "4 TB transfer" },
    ],
  },
];

const included: { Icon: LucideIcon; color: string; title: string; body: string }[] = [
  {
    Icon: Terminal,
    color: "var(--szz-accent-blue)",
    title: "Full root access",
    body: "SSH in as root and run whatever you like — your server, your rules.",
  },
  {
    Icon: Disc3,
    color: "var(--szz-accent-blue)",
    title: "Your choice of OS",
    body: "Ubuntu, Debian, AlmaLinux, Rocky, Windows — or bring your own ISO.",
  },
  {
    Icon: Zap,
    color: "var(--szz-accent-blue)",
    title: "NVMe everywhere",
    body: "All-NVMe storage on high-frequency cores for fast, consistent I/O.",
  },
  {
    Icon: Globe,
    color: "var(--szz-accent-blue)",
    title: "32 global regions",
    body: "Deploy close to your users across six continents in a click.",
  },
  {
    Icon: Shield,
    color: "var(--szz-green)",
    title: "DDoS protection",
    body: "Network-level mitigation included on every instance, no add-on.",
  },
  {
    Icon: Camera,
    color: "var(--szz-accent-blue)",
    title: "Snapshots on demand",
    body: "Capture and clone your server state whenever you need to.",
  },
];

const addOns: { Icon: LucideIcon; title: string; body: string }[] = [
  {
    Icon: UserRoundCog,
    title: "Managed support",
    body: "Hand us the OS patching, hardening and monitoring. Priced to real hours — your dedicated account manager scopes it with you.",
  },
  {
    Icon: DatabaseBackup,
    title: "Automated backups",
    body: "Scheduled full-server backups with one-click restore. Add to any VPS for peace of mind that survives a bad deploy.",
  },
];

export default function VpsPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={breadcrumbTrail("Cloud VPS", "/vps")} />
      <JsonLdScript id="vps-service-jsonld" scriptKey="vps-service-jsonld" data={serviceJsonLd("/vps")} />

      {/* hero */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          padding: "80px 24px 44px",
          maxWidth: 720,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <SectionEyebrow>Cloud VPS</SectionEyebrow>
        <h1 style={{ margin: 0, fontFamily: display, fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-1.5px", color: primary }}>
          Full root. Your stack. Our metal.
        </h1>
        <p style={{ margin: 0, maxWidth: 560, fontSize: 17, lineHeight: 1.6, color: muted }}>{heroBody}</p>
      </section>

      {/* plan cards */}
      <section style={{ padding: "10px 24px 80px" }}>
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
                    Deploy {plan.name}
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
          Prices billed monthly. Unmanaged by default — add managed support or automated backups any time.
        </p>
      </section>

      {/* everything included */}
      <section style={{ background: "var(--szz-bg-card)", padding: "80px 48px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 40 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>
            <SectionEyebrow>Every_VPS_includes</SectionEyebrow>
            <h2 style={{ margin: 0, fontFamily: display, fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 700, lineHeight: 1.15, letterSpacing: "-.5px", color: primary }}>
              Built for control, wired for speed
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
              Want us to drive? Bolt on more.
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
                  Spin up your server in under a minute.
                </h2>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: muted }}>{ctaBody}</p>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button asChild variant="primary" size="lg">
                  <Link href="/register">Get started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/support">Talk to us</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

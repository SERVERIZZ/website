import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  LayoutTemplate,
  CodeXml,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { BreadcrumbJsonLd, JsonLdScript } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { breadcrumbTrail, pageMetadataFor, serviceJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadataFor("/services/web-development");

const display = "var(--font-heading)";
const mono = "var(--font-mono)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";
const dim = "var(--szz-text-dim)";

const heroBody =
  "From a marketing site to a custom web application — designed, built and shipped by the same people who'll keep it running. One team, from first wireframe to live, for years.";

/** Top-of-page “what we do” trio. */
const capabilities: { Icon: LucideIcon; color: string; title: string; body: string }[] = [
  {
    Icon: LayoutTemplate,
    color: "var(--szz-accent-blue)",
    title: "Websites & CMS",
    body: "Fast, custom WordPress and CMS builds — from a clean brochure site to full commerce and membership.",
  },
  {
    Icon: CodeXml,
    color: "var(--szz-accent-blue)",
    title: "Custom web apps",
    body: "Bespoke applications and internal tools, scoped properly and built MVP-first so value ships early.",
  },
  {
    Icon: TrendingUp,
    color: "var(--szz-green)",
    title: "Brand & growth",
    body: "Logo and brand basics, copywriting, SEO and accessibility — the polish that makes a launch land.",
  },
];

/** Fixed-scope CMS / website packages. */
type Tier = {
  name: string;
  blurb: string;
  price: string;
  cta: string;
  popular?: boolean;
  variant: "primary" | "secondary";
  features: string[];
};

const tiers: Tier[] = [
  {
    name: "Launch",
    blurb: "Marketing & brochure sites.",
    price: "$3,500",
    cta: "Get a quote",
    variant: "secondary",
    features: [
      "5–7 page templates",
      "Customized theme design",
      "Standard integrations",
      "Basic on-page SEO",
      "1 revision round",
      "2–4 week timeline",
    ],
  },
  {
    name: "Growth",
    blurb: "Custom design & integrations.",
    price: "$8,000",
    cta: "Get a quote",
    popular: true,
    variant: "primary",
    features: [
      "8–15 page templates",
      "Fully custom design",
      "CRM, booking & 2–3 integrations",
      "Full on-page + technical SEO",
      "2 revision rounds + training",
      "4–8 week timeline",
    ],
  },
  {
    name: "Commerce",
    blurb: "E-commerce & complex CMS.",
    price: "$18,000",
    cta: "Talk to us",
    variant: "secondary",
    features: [
      "Custom content architecture",
      "Payments & membership",
      "Advanced / multi-system integrations",
      "SEO + structured data",
      "Core Web Vitals optimization",
      "Staged review + 2 training sessions",
    ],
  },
];

/** Phased custom-app engagement. */
type Phase = {
  tag: string;
  tagColor: string;
  badge: { label: string; variant: "accent" | "success"; dot?: boolean };
  title: string;
  body: string;
  price: string;
  priceColor: string;
  note: string;
  glow?: boolean;
};

const phases: Phase[] = [
  {
    tag: "PHASE 0",
    tagColor: "var(--szz-accent-blue)",
    badge: { label: "Always first", variant: "accent" },
    title: "Paid discovery & scoping",
    body: "A fixed-fee engagement that produces a spec, UX flows, architecture and a firm build estimate. You leave with a plan you own — whether or not you build with us.",
    price: "$3,000",
    priceColor: primary,
    note: "Credited toward your build when you proceed.",
  },
  {
    tag: "PHASE 1+",
    tagColor: "var(--szz-green)",
    badge: { label: "MVP-first", variant: "success", dot: true },
    title: "The build, in milestones",
    body: "We ship the core that delivers value first, then iterate. Billed against approved milestones — never one open-ended invoice — with each phase as its own statement of work.",
    price: "$15,000",
    priceColor: "var(--szz-accent-blue)",
    note: "Small tools to full platforms — scoped in discovery.",
    glow: true,
  },
];

/** Post-launch care plans. */
type CarePlan = {
  name: string;
  price: string;
  blurb: string;
  popular?: boolean;
  priceColor: string;
  features: string[];
};

const carePlans: CarePlan[] = [
  {
    name: "Care",
    price: "$75",
    blurb: "Keep-the-lights-on.",
    priceColor: primary,
    features: [
      "Managed hosting",
      "Security, backups & updates",
      "Monitoring & uptime window",
      "Small monthly content edits",
    ],
  },
  {
    name: "Care+",
    price: "$300",
    blurb: "Steady improvement.",
    popular: true,
    priceColor: "var(--szz-accent-blue)",
    features: [
      "Everything in Care",
      "Priority support response",
      "2–3 hrs dev/design time",
      "Monthly performance + SEO check",
    ],
  },
  {
    name: "Partner",
    price: "$1,000",
    blurb: "Your team, on retainer.",
    priceColor: primary,
    features: [
      "Everything in Care+",
      "Dedicated monthly dev/design hours",
      "Roadmap & quarterly planning",
      "Same-day priority response",
    ],
  },
];

/** À la carte add-on services (two-column price list). */
type AddOn = { label: string; price: string; green?: boolean };

const addOns: AddOn[] = [
  { label: "Logo & brand basics", price: "$1,500+" },
  { label: "Copywriting / content", price: "$150/pg" },
  { label: "Advanced SEO audit", price: "$1,500+" },
  { label: "Accessibility (WCAG) pass", price: "$2,000+" },
  { label: "Platform migration", price: "$750+" },
  { label: "Additional language / locale", price: "$1,000+" },
  { label: "Extra revision round", price: "$400+" },
  { label: "Rush / expedited delivery", price: "+25–50%", green: true },
];

/** "How we work" process steps. */
type Step = { num: string; title: string; body: string; green?: boolean };

const steps: Step[] = [
  {
    num: "01",
    title: "Scope",
    body: "We agree exactly what's included — in writing — before a pixel moves.",
  },
  {
    num: "02",
    title: "Build",
    body: "Design and development in approved milestones you sign off as we go.",
  },
  {
    num: "03",
    title: "Launch",
    body: "We deploy to our managed infrastructure, test, and hand over the keys.",
  },
  {
    num: "04",
    title: "Care",
    body: "A care plan keeps it secure, fast and improving — for the long haul.",
    green: true,
  },
];

const h2 = (children: ReactNode, max?: number) => (
  <h2
    style={{
      margin: 0,
      fontFamily: display,
      fontSize: "clamp(24px, 4vw, 34px)",
      fontWeight: 700,
      lineHeight: 1.12,
      letterSpacing: "-1px",
      color: primary,
      ...(max ? { maxWidth: max } : {}),
    }}
  >
    {children}
  </h2>
);

const check = (label: string, size = 14) => (
  <div
    key={label}
    style={{ display: "flex", alignItems: "center", gap: 10, fontSize: size, color: light }}
  >
    <span style={{ color: "var(--szz-green)", fontWeight: 700 }}>✓</span> {label}
  </div>
);

export default function WebDevelopmentPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={breadcrumbTrail("Web & Software", "/services/web-development")}
      />
      <JsonLdScript
        id="websoft-service-jsonld"
        scriptKey="websoft-service-jsonld"
        data={serviceJsonLd("/services/web-development")}
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
        <SectionEyebrow>Web &amp; Software</SectionEyebrow>
        <h1
          style={{
            margin: 0,
            fontFamily: display,
            fontSize: "clamp(32px, 6vw, 48px)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-1.5px",
            color: primary,
          }}
        >
          We build it. We host it. We keep it sharp.
        </h1>
        <p style={{ margin: 0, maxWidth: 600, fontSize: 17, lineHeight: 1.6, color: muted }}>
          {heroBody}
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 6,
          }}
        >
          <Button asChild variant="primary" size="lg">
            <Link href="/support">Start a project</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/support">Book a call</Link>
          </Button>
        </div>
      </section>

      {/* what we do */}
      <section style={{ padding: "30px 48px 20px" }}>
        <div className="szz-grid-3" style={{ maxWidth: 1080, margin: "0 auto", gap: 18 }}>
          {capabilities.map(({ Icon, color, title, body }) => (
            <Card key={title} surface="deep">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <Icon size={24} style={{ color }} />
                <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: primary }}>
                  {title}
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>{body}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CMS tiers */}
      <section style={{ padding: "60px 24px 30px" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            textAlign: "center",
            alignItems: "center",
          }}
        >
          <SectionEyebrow>Websites &amp; CMS</SectionEyebrow>
          {h2("Three ways to launch")}
          <p style={{ margin: 0, maxWidth: 580, fontSize: 16, lineHeight: 1.6, color: muted }}>
            Fixed-scope packages with a clear deliverable and a clear boundary. Most clients land in
            the middle.
          </p>
        </div>
        <div
          className="szz-grid-3 fill-cards"
          style={{ maxWidth: 1080, margin: "36px auto 0", alignItems: "stretch" }}
        >
          {tiers.map((tier) => (
            <Card key={tier.name} popular={tier.popular} style={{ height: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
                {tier.popular ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>
                        {tier.name}
                      </span>
                      <Badge variant="accent">Most popular</Badge>
                    </div>
                    <span style={{ fontSize: 13, color: muted }}>{tier.blurb}</span>
                  </>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>
                      {tier.name}
                    </span>
                    <span style={{ fontSize: 13, color: muted }}>{tier.blurb}</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span style={{ fontSize: 13, color: dim }}>from</span>
                  <span
                    style={{
                      fontFamily: display,
                      fontSize: 36,
                      fontWeight: 700,
                      color: tier.popular ? "var(--szz-accent-blue)" : primary,
                    }}
                  >
                    {tier.price}
                  </span>
                </div>
                <Button asChild variant={tier.variant} size="md" style={{ width: "100%" }}>
                  <Link href="/support">{tier.cta}</Link>
                </Button>
                <div style={{ height: 1, background: "var(--szz-border)" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {tier.features.map((f) => check(f))}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <p
          style={{
            maxWidth: 1080,
            margin: "18px auto 0",
            textAlign: "center",
            fontSize: 13,
            color: dim,
          }}
        >
          Every package covers exactly what&rsquo;s listed; new pages, integrations or revision
          rounds are quoted up front — never a surprise.
        </p>
      </section>

      {/* custom apps, phased */}
      <section style={{ background: "var(--szz-bg-card)", padding: "80px 48px" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 40,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 640 }}>
            <SectionEyebrow>Custom web apps</SectionEyebrow>
            {h2("Scoped, not guessed")}
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: muted }}>
              Real software can&rsquo;t be priced off a hunch. We start with a paid discovery, then
              build in milestones — so you always know what&rsquo;s next and what it costs.
            </p>
          </div>
          <div className="szz-grid-2 fill-cards" style={{ alignItems: "stretch" }}>
            {phases.map((phase) => (
              <Card key={phase.tag} glow={phase.glow} style={{ height: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span
                      style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: phase.tagColor }}
                    >
                      {phase.tag}
                    </span>
                    <Badge variant={phase.badge.variant} dot={phase.badge.dot}>
                      {phase.badge.label}
                    </Badge>
                  </div>
                  <span style={{ fontFamily: display, fontSize: 20, fontWeight: 700, color: primary }}>
                    {phase.title}
                  </span>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: muted }}>
                    {phase.body}
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: "auto" }}>
                    <span style={{ fontSize: 13, color: dim }}>from</span>
                    <span
                      style={{ fontFamily: display, fontSize: 30, fontWeight: 700, color: phase.priceColor }}
                    >
                      {phase.price}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: dim }}>{phase.note}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* care plans */}
      <section style={{ padding: "80px 48px" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            textAlign: "center",
            alignItems: "center",
          }}
        >
          <SectionEyebrow tone="green" slashes={false}>
            Ongoing care
          </SectionEyebrow>
          {h2("Launch day isn't the finish line")}
          <p style={{ margin: 0, maxWidth: 600, fontSize: 16, lineHeight: 1.6, color: muted }}>
            Every build can roll onto a care plan — hosted on our own managed infrastructure, looked
            after by the team that built it.
          </p>
        </div>
        <div
          className="szz-grid-3 fill-cards"
          style={{ maxWidth: 1080, margin: "36px auto 0", alignItems: "stretch" }}
        >
          {carePlans.map((plan) => (
            <Card
              key={plan.name}
              surface={plan.popular ? "card" : "deep"}
              popular={plan.popular}
              style={{ height: "100%" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 12, height: "100%" }}>
                {plan.popular ? (
                  <div
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                  >
                    <span style={{ fontFamily: display, fontSize: 20, fontWeight: 700, color: primary }}>
                      {plan.name}
                    </span>
                    <Badge variant="accent">Most popular</Badge>
                  </div>
                ) : (
                  <span style={{ fontFamily: display, fontSize: 20, fontWeight: 700, color: primary }}>
                    {plan.name}
                  </span>
                )}
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontFamily: display, fontSize: 30, fontWeight: 700, color: plan.priceColor }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 14, color: dim }}>/mo</span>
                </div>
                <span style={{ fontSize: 13, color: muted }}>{plan.blurb}</span>
                <div style={{ height: 1, background: "var(--szz-border)" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {plan.features.map((f) => check(f, 13))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* à la carte */}
      <section style={{ padding: "20px 48px 60px" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <SectionEyebrow>À la carte</SectionEyebrow>
          {h2("Add what you need")}
          <div
            className="szz-grid-2"
            style={{ marginTop: 22, columnGap: 56, rowGap: 0, alignItems: "start" }}
          >
            {addOns.map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "18px 2px",
                  borderBottom: "1px solid var(--szz-border)",
                }}
              >
                <span style={{ fontSize: 16, color: light }}>{item.label}</span>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 15,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    color: item.green ? "var(--szz-green)" : "var(--szz-accent-blue)",
                  }}
                >
                  {item.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* how we work */}
      <section style={{ background: "var(--szz-bg-card)", padding: "80px 48px" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <SectionEyebrow>How we work</SectionEyebrow>
          {h2("Clear scope. No surprises.")}
          <div className="szz-grid-4" style={{ marginTop: 32, gap: 24, alignItems: "start" }}>
            {steps.map((step) => (
              <div
                key={step.num}
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: step.green ? "var(--szz-green)" : "var(--szz-accent-blue)",
                  }}
                >
                  {step.num}
                </span>
                <span style={{ fontFamily: display, fontSize: 20, fontWeight: 700, color: primary }}>
                  {step.title}
                </span>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: muted }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--szz-bg-card)", padding: "0 24px 90px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <Card glow>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 32,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 560 }}>
                {h2("Have a project in mind?")}
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: muted }}>
                  Tell us what you&rsquo;re building. We&rsquo;ll scope it honestly, build it
                  MVP-first, and keep it running long after launch.
                </p>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <Button asChild variant="primary" size="lg">
                  <Link href="/support">Start a project</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/support">Book a call</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

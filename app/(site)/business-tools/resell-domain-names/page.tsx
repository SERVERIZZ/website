import type { Metadata } from "next";
import {
  Globe,
  ShieldCheck,
  Layers,
  Plug,
  UserRound,
  Wallet,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { BreadcrumbJsonLd } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { breadcrumbTrail, pageMetadataFor } from "@/lib/seo";

export const metadata: Metadata = pageMetadataFor("/business-tools/resell-domain-names");

const display = "var(--font-heading)";
const mono = "var(--font-mono)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";

// "Start reselling" opens the eNom reseller sign-up form in a new tab. It's a
// self-serve snap-in on the SERVERIZZ portal — no support ticket needed to begin.
const START_RESELLING_URL =
  "https://go.serverizz.com/index.php?fuse=admin&view=snapin&controller=snapins&h=IHB1YmxpY21haW46MA%3D%3D&plugin=enomform";
const SUPPORT_URL = "/support";

const heroChips = ["1,000+ TLDs", "Wholesale pricing", "No ticket to start"];

const benefits: { Icon: LucideIcon; color: string; title: string; body: string }[] = [
  {
    Icon: Wallet,
    color: "var(--szz-green)",
    title: "Your prices, your margin",
    body: "Buy at wholesale and set whatever retail price you like. The spread on every registration, renewal and transfer is yours to keep.",
  },
  {
    Icon: Globe,
    color: "var(--szz-accent-blue)",
    title: "1,000+ extensions",
    body: "Offer the classics and the long tail — .com, .co, .io, .org and a thousand more gTLDs and ccTLDs from one catalog.",
  },
  {
    Icon: Layers,
    color: "var(--szz-accent-blue)",
    title: "White-label storefront",
    body: "Sell domains under your own brand, powered by eNom behind the scenes. Your customers see you, not the registrar.",
  },
  {
    Icon: ShieldCheck,
    color: "var(--szz-green)",
    title: "Privacy & protection",
    body: "Resell WHOIS privacy, registrar lock and auto-renew so the names you sell stay safe and stay yours to manage.",
  },
  {
    Icon: Plug,
    color: "var(--szz-accent-blue)",
    title: "API & DNS control",
    body: "Automate provisioning through the eNom API and manage every zone's DNS records from a single reseller dashboard.",
  },
  {
    Icon: UserRound,
    color: "var(--szz-green)",
    title: "A real account manager",
    body: "A person who knows your account and helps you price, migrate and grow — not a queue and a canned reply.",
  },
];

const steps: { num: string; title: string; body: string }[] = [
  {
    num: "01",
    title: "Open your reseller account",
    body: "Click Start reselling and fill in the short eNom sign-up form. It's self-serve — no support ticket required to get going.",
  },
  {
    num: "02",
    title: "Set your retail pricing",
    body: "Mark up the wholesale rates however you like, per TLD, and pocket the difference on every sale and renewal.",
  },
  {
    num: "03",
    title: "Start selling",
    body: "Point customers at your white-label storefront, or register on their behalf. Manage everything from your reseller dashboard.",
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Do I need a support ticket to start?",
    a: "No — it's fully self-serve. Click Start reselling, complete the eNom form, and your reseller account is on its way.",
  },
  {
    q: "Can I set my own retail prices?",
    a: "Yes. You buy at wholesale and price retail however you like, per extension. The margin on every transaction is yours.",
  },
  {
    q: "Is it really white-label?",
    a: "Yes — your customers buy under your brand. eNom powers registration in the background; they never have to see it.",
  },
  {
    q: "Which domains can I resell?",
    a: "Over a thousand TLDs — common gTLDs like .com and .org, newer ones like .io and .app, and country-code domains worldwide.",
  },
];

export default function ResellDomainNamesPage() {
  return (
    <div>
      <BreadcrumbJsonLd
        items={breadcrumbTrail("Wholesale Domains", "/business-tools/resell-domain-names")}
      />

      {/* hero */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          padding: "80px 24px 50px",
          maxWidth: 760,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <SectionEyebrow>Wholesale_domains</SectionEyebrow>
        <h1
          style={{
            margin: 0,
            fontFamily: display,
            fontSize: "clamp(32px, 6vw, 48px)",
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-1.5px",
            color: primary,
          }}
        >
          Resell domains under your own brand.
        </h1>
        <p style={{ margin: 0, maxWidth: 600, fontSize: 17, lineHeight: 1.6, color: muted }}>
          Become a domain reseller on the SERVERIZZ × eNom platform. Buy 1,000+ extensions at
          wholesale, set your own retail prices, and keep the margin — all from a white-label
          storefront. Self-serve sign-up, no ticket needed to get started.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
          <Button asChild variant="primary" size="lg">
            <a href={START_RESELLING_URL} target="_blank" rel="noopener noreferrer">
              Start reselling
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={SUPPORT_URL}>Talk to us</a>
          </Button>
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          {heroChips.map((chip) => (
            <span
              key={chip}
              style={{
                fontFamily: mono,
                fontSize: 12,
                color: "var(--szz-text-dim)",
                border: "1px solid var(--szz-border)",
                borderRadius: 999,
                padding: "5px 12px",
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </section>

      {/* why resell with us */}
      <section className="szz-section" style={{ background: "var(--szz-bg-card)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SectionEyebrow tone="green">Why_resell_with_us</SectionEyebrow>
            <h2
              style={{
                margin: 0,
                fontFamily: display,
                fontSize: "clamp(26px, 5vw, 32px)",
                fontWeight: 700,
                letterSpacing: "-.5px",
                color: primary,
              }}
            >
              A domain business, ready to brand
            </h2>
          </div>
          <div className="szz-grid-3" style={{ gap: 18 }}>
            {benefits.map(({ Icon, color, title, body }) => (
              <Card key={title}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Icon size={22} style={{ color }} />
                  <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: primary }}>
                    {title}
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>{body}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* how to start */}
      <section className="szz-section" style={{ background: "var(--szz-bg-deep)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", textAlign: "center" }}>
            <SectionEyebrow>
              <Rocket size={13} style={{ display: "inline", verticalAlign: "-1px", marginRight: 6 }} />
              Start_in_minutes
            </SectionEyebrow>
            <h2
              style={{
                margin: 0,
                fontFamily: display,
                fontSize: "clamp(26px, 5vw, 32px)",
                fontWeight: 700,
                letterSpacing: "-.5px",
                color: primary,
              }}
            >
              Three steps to your first sale
            </h2>
          </div>
          <div className="szz-grid-3" style={{ gap: 18 }}>
            {steps.map(({ num, title, body }) => (
              <Card key={num}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <span style={{ fontFamily: mono, fontSize: 13, color: "var(--szz-accent-blue)" }}>
                    {num}
                  </span>
                  <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: primary }}>
                    {title}
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>{body}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="szz-section" style={{ background: "var(--szz-bg-card)" }}>
        <div className="szz-split" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionEyebrow tone="accent">Reseller_questions</SectionEyebrow>
            <h2
              style={{
                margin: 0,
                fontFamily: display,
                fontSize: "clamp(26px, 5vw, 32px)",
                fontWeight: 700,
                letterSpacing: "-.5px",
                color: primary,
              }}
            >
              Questions, answered
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: muted }}>
              Reselling domains should be the easy part. Here&apos;s how it works on the SERVERIZZ ×
              eNom platform — and your account manager is a click away for the rest.
            </p>
            <div style={{ marginTop: 4 }}>
              <Button asChild variant="primary" size="lg">
                <a href={START_RESELLING_URL} target="_blank" rel="noopener noreferrer">
                  Start reselling
                </a>
              </Button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map(({ q, a }) => (
              <Card key={q}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontFamily: display, fontSize: 16, fontWeight: 700, color: primary }}>
                    {q}
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>{a}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          background: "var(--gradient-cta)",
          padding: "100px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
          textAlign: "center",
        }}
      >
        <h2
          style={{
            margin: 0,
            maxWidth: 640,
            fontFamily: display,
            fontSize: "clamp(28px, 6vw, 42px)",
            fontWeight: 700,
            letterSpacing: "-1.5px",
            lineHeight: 1.1,
            color: primary,
          }}
        >
          Ready to start reselling?
        </h2>
        <p style={{ margin: 0, maxWidth: 480, fontSize: 16, lineHeight: 1.6, color: light }}>
          Open your wholesale domain account in minutes and put your own brand on every name you
          sell. No ticket, no setup wait.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Button asChild variant="primary" size="lg">
            <a href={START_RESELLING_URL} target="_blank" rel="noopener noreferrer">
              Start reselling
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={SUPPORT_URL}>Talk to us</a>
          </Button>
        </div>
      </section>
    </div>
  );
}

"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const display = "var(--font-heading)";
const mono = "var(--font-mono)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";
const dim = "var(--szz-text-dim)";

/** Annual savings vs monthly — shown on the billing toggle. Keep in sync with the prices below. */
const ANNUAL_SAVINGS_LABEL = "Save ~11%";

type Tier = {
  name: string;
  blurb: string;
  monthly: string;
  annual: string;
  cta: string;
  /** External order URL — opens in a new tab. */
  href: string;
  bestFor: string;
  popular?: boolean;
  variant: "primary" | "secondary";
  features: string[];
};

const tiers: Tier[] = [
  {
    name: "SEO Foundation",
    blurb: "For a single site that needs to rank.",
    monthly: "169",
    annual: "149",
    cta: "Start with Foundation",
    href: "https://go.serverizz.com/order.php?step=1&productGroup=7&product=593",
    bestFor: "Best for new sites & single local businesses.",
    variant: "secondary",
    features: [
      "Continuous technical SEO",
      "On-page optimization of key pages",
      "Keyword rank tracking",
      "Clear monthly performance report",
      "Hands-off — we run it for you",
    ],
  },
  {
    name: "SEO Growth",
    blurb: "Active content and local presence.",
    monthly: "449",
    annual: "399",
    cta: "Choose Growth",
    href: "https://go.serverizz.com/order.php?step=1&productGroup=7&product=594",
    bestFor: "Best for growing local & service businesses.",
    popular: true,
    variant: "primary",
    features: [
      "Everything in Foundation",
      "Managed content — fresh articles each month",
      "Local SEO & Google Business Profile",
      "Expanded keyword targeting",
      "Monthly strategy report",
    ],
  },
  {
    name: "SEO Authority",
    blurb: "Authority signals and AI-search visibility.",
    monthly: "899",
    annual: "799",
    cta: "Choose Authority",
    href: "https://go.serverizz.com/order.php?step=1&productGroup=7&product=595",
    bestFor: "Best for competitive niches & market leaders.",
    variant: "secondary",
    features: [
      "Everything in Growth",
      "Digital PR & press distribution",
      "Backlink & citation building",
      "AI-search visibility tracking",
      "Priority handling & monthly review",
    ],
  },
];

function Check() {
  return <span style={{ color: "var(--szz-green)", fontWeight: 700 }}>✓</span>;
}

export function SeoPlans() {
  const [billing, setBilling] = React.useState<"monthly" | "annual">("monthly");
  const annual = billing === "annual";
  const billNote = annual ? "per month, billed annually" : "per month, billed monthly";

  const toggleBtn = (active: boolean): React.CSSProperties => ({
    border: "none",
    cursor: "pointer",
    borderRadius: 999,
    padding: "8px 18px",
    fontFamily: "var(--font-body)",
    fontSize: 14,
    fontWeight: 600,
    background: active ? "var(--szz-cta-blue)" : "transparent",
    color: active ? "#ffffff" : muted,
    display: "flex",
    alignItems: "center",
    gap: 8,
  });

  return (
    <>
      {/* billing toggle (centered) */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div
          role="group"
          aria-label="Billing period"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--szz-bg-card)",
            border: "1px solid var(--szz-border)",
            borderRadius: 999,
            padding: 5,
          }}
        >
          <button type="button" onClick={() => setBilling("monthly")} aria-pressed={!annual} style={toggleBtn(!annual)}>
            Monthly
          </button>
          <button type="button" onClick={() => setBilling("annual")} aria-pressed={annual} style={toggleBtn(annual)}>
            Annual{" "}
            <span
              style={{
                fontFamily: mono,
                fontSize: 10,
                letterSpacing: ".5px",
                color: annual ? "#ffffff" : "var(--szz-green)",
              }}
            >
              {ANNUAL_SAVINGS_LABEL}
            </span>
          </button>
        </div>
      </div>

      {/* tier cards */}
      <div
        className="szz-grid-3 fill-cards"
        style={{ maxWidth: 1080, margin: "36px auto 0", alignItems: "stretch" }}
      >
        {tiers.map((tier) => (
          <Card key={tier.name} popular={tier.popular} style={{ height: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, height: "100%" }}>
              {tier.popular ? (
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <span style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>
                    {tier.name}
                  </span>
                  <Badge variant="accent">Most popular</Badge>
                </div>
              ) : (
                <span style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: primary }}>
                  {tier.name}
                </span>
              )}
              <span style={{ fontSize: 13, color: muted }}>{tier.blurb}</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span
                  style={{
                    fontFamily: display,
                    fontSize: 40,
                    fontWeight: 700,
                    color: tier.popular ? "var(--szz-accent-blue)" : primary,
                  }}
                >
                  ${annual ? tier.annual : tier.monthly}
                </span>
                <span style={{ fontSize: 15, color: dim }}>/mo</span>
              </div>
              <span style={{ fontFamily: mono, fontSize: 12, color: dim, marginTop: -8 }}>
                {billNote}
              </span>
              <Button asChild variant={tier.variant} size="md" style={{ width: "100%" }}>
                <a href={tier.href} target="_blank" rel="noopener noreferrer">
                  {tier.cta}
                </a>
              </Button>
              <div style={{ height: 1, background: "var(--szz-border)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {tier.features.map((f) => (
                  <div
                    key={f}
                    style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: light }}
                  >
                    <Check /> {f}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 12, color: dim, marginTop: "auto" }}>{tier.bestFor}</span>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { BreadcrumbJsonLd, JsonLdScript } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Stat } from "@/components/szz/stat";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SeoPlans } from "@/components/szz/seo-plans";
import { breadcrumbTrail, pageMetadataFor, serviceJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadataFor("/services/seo");

const display = "var(--font-heading)";
const mono = "var(--font-mono)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";

const heroBody =
  "Managed SEO that runs in the background while you run your business. We handle the technical work, the content, and the reporting — you watch the rankings climb.";

type Step = { num: string; title: string; body: string };

const steps: Step[] = [
  {
    num: "01",
    title: "Free audit & roadmap",
    body: "We scan your site, find what's holding it back, and map the plan — before you commit a dollar.",
  },
  {
    num: "02",
    title: "We do the work",
    body: "Technical fixes, on-page optimization, content and authority — handled by us, every month.",
  },
  {
    num: "03",
    title: "You get the report",
    body: "A clear monthly report shows rankings, traffic and exactly what we shipped. No jargon.",
  },
];

type AddOn = { label: string; price: string; description: string };

const addOns: AddOn[] = [
  {
    label: "Extra managed article",
    price: "$79",
    description: "An additional optimized article, written and published for you.",
  },
  {
    label: "Press release",
    price: "$149",
    description: "A distributed press release to build authority and reach.",
  },
  {
    label: "Backlink pack (10)",
    price: "$199",
    description: "Ten quality backlinks from relevant, credible sources.",
  },
  {
    label: "Additional location",
    price: "$99/mo",
    description: "Local SEO for another business location or service area.",
  },
  {
    label: "SEO audit & roadmap",
    price: "$199",
    description: "A one-time deep audit with a prioritized action plan to keep.",
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

export default function SeoPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={breadcrumbTrail("SEO", "/services/seo")} />
      <JsonLdScript
        id="seo-service-jsonld"
        scriptKey="seo-service-jsonld"
        data={serviceJsonLd("/services/seo")}
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
        <SectionEyebrow>Search_Engine_Optimization</SectionEyebrow>
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
          Get found. Get traffic. Get customers.
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
            <Link href="/support">Get a free audit</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/support">Talk to us</Link>
          </Button>
        </div>
        <div
          className="szz-grid-3"
          style={{ width: "100%", maxWidth: 620, margin: "16px auto 0", gap: 24 }}
        >
          <Stat center value="24/7" label="continuous optimization" />
          <Stat center value="100%" label="managed for you" />
          <Stat center value="AI-ready" label="visibility in ChatGPT & Gemini" />
        </div>
      </section>

      {/* plans */}
      <section style={{ padding: "60px 24px 30px" }}>
        <div
          style={{
            maxWidth: 1080,
            margin: "0 auto 28px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            textAlign: "center",
            alignItems: "center",
          }}
        >
          {h2("Pick a plan. We do the rest.")}
        </div>
        <SeoPlans />
        {/* custom & multi-location */}
        <div style={{ maxWidth: 1080, margin: "24px auto 0" }}>
          <Card surface="deep">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 640 }}>
                <span style={{ fontFamily: display, fontSize: 20, fontWeight: 700, color: primary }}>
                  Custom &amp; Multi-Location
                </span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>
                  {"Ecommerce, multi-location and large-catalog sites — scoped and priced to your footprint."}
                </span>
              </div>
              <Button asChild variant="outline" size="md">
                <Link href="/support">Request a quote</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* how it works */}
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
          <SectionEyebrow>How_it_works</SectionEyebrow>
          {h2("Set it, and watch it climb")}
          <div className="szz-grid-3" style={{ marginTop: 32, gap: 24, alignItems: "start" }}>
            {steps.map((step) => (
              <div key={step.num} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--szz-accent-blue)",
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

      {/* à la carte */}
      <section style={{ padding: "80px 48px" }}>
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
          {h2("Add more when you need it")}
          <div
            className="szz-grid-3 fill-cards"
            style={{ marginTop: 28, alignItems: "stretch" }}
          >
            {addOns.map((item) => (
              <Card key={item.label} surface="deep" style={{ height: "100%" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontFamily: display, fontSize: 17, fontWeight: 700, color: primary }}>
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 15,
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        color: "var(--szz-accent-blue)",
                      }}
                    >
                      {item.price}
                    </span>
                  </div>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>
                    {item.description}
                  </span>
                </div>
              </Card>
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
                {h2("Not ranking where you should be?")}
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: muted }}>
                  {"Start with a free audit. We'll show you exactly where you stand and what it takes to climb — no obligation."}
                </p>
              </div>
              <Button asChild variant="primary" size="lg">
                <Link href="/support">Get a free audit</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

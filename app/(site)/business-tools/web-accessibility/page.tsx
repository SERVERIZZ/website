import type { Metadata } from "next";
import {
  Eye,
  Keyboard,
  AudioLines,
  Type,
  MousePointer2,
  Languages,
  ScanSearch,
  SlidersHorizontal,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { BreadcrumbJsonLd } from "next-seo";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { breadcrumbTrail, pageMetadataFor } from "@/lib/seo";

export const metadata: Metadata = pageMetadataFor("/business-tools/web-accessibility");

const display = "var(--font-heading)";
const mono = "var(--font-mono)";
const muted = "var(--szz-text-muted)";
const primary = "var(--szz-text-primary)";
const light = "var(--szz-text-light)";

// Destinations open in a new tab. "Add AccessWidget" goes to the SERVERIZZ
// order page for the product; "Get a free scan" to accessiBe's free audit tool.
const ADD_WIDGET_URL = "https://go.serverizz.com/order.php?step=1&productGroup=8&product=596";
const FREE_SCAN_URL = "https://accessibe.com/ace";

const technologies: { Icon: LucideIcon; color: string; title: string; body: string }[] = [
  {
    Icon: ScanSearch,
    color: "var(--szz-accent-blue)",
    title: "AI remediation engine",
    body: "Scans your site, understands its structure, and applies the ARIA attributes and screen-reader optimizations needed for compliance — then re-scans every 24 hours to catch new content.",
  },
  {
    Icon: SlidersHorizontal,
    color: "var(--szz-green)",
    title: "Accessibility interface",
    body: "A visitor-facing menu for profiles and on-the-fly adjustments — contrast, text size, spacing, cursor, keyboard navigation and more — so people tailor your site to their needs.",
  },
];

const adjustments: { Icon: LucideIcon; color: string; title: string; body: string }[] = [
  {
    Icon: Eye,
    color: "var(--szz-accent-blue)",
    title: "Vision adjustments",
    body: "Contrast, saturation, text size, spacing and font tuning for low-vision and color-blind users.",
  },
  {
    Icon: Keyboard,
    color: "var(--szz-accent-blue)",
    title: "Keyboard navigation",
    body: "Full keyboard operation for motor-impaired visitors who can't use a mouse.",
  },
  {
    Icon: AudioLines,
    color: "var(--szz-green)",
    title: "Screen-reader ready",
    body: "ARIA attributes and optimizations so assistive tech reads your site correctly.",
  },
  {
    Icon: Type,
    color: "var(--szz-accent-blue)",
    title: "Content adjustments",
    body: "Readable fonts, highlighted links and titles, and a built-in dictionary.",
  },
  {
    Icon: MousePointer2,
    color: "var(--szz-accent-blue)",
    title: "Orientation tools",
    body: "Reading guides, big cursor, animation pause and sound muting for focus.",
  },
  {
    Icon: Languages,
    color: "var(--szz-green)",
    title: "Multi-language",
    body: "Accessibility profiles and the interface itself available in many languages.",
  },
];

const compliance = [
  "WCAG 2.1 success criteria",
  "ADA, Section 508, EAA & AODA aligned",
  "Accessibility statement & certification",
  "Monthly accessibility compliance audit",
];

const statusRows: { label: string; value: string; tone?: string }[] = [
  { label: "status", value: "operational", tone: "var(--szz-green)" },
  { label: "last scan", value: "✓ 4 hours ago", tone: "var(--szz-green)" },
  { label: "conformance target", value: "WCAG 2.1 AA", tone: "var(--szz-accent-blue)" },
];

export default function AccessibilityPage() {
  return (
    <div>
      <BreadcrumbJsonLd items={breadcrumbTrail("Web Accessibility", "/business-tools/web-accessibility")} />

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
        <SectionEyebrow>Official accessiBe partner</SectionEyebrow>
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
          Make your site accessible to everyone.
        </h1>
        <p style={{ margin: 0, maxWidth: 600, fontSize: 17, lineHeight: 1.6, color: muted }}>
          AccessWidget by accessiBe is an AI-powered accessibility tool that helps your website meet
          ADA and WCAG standards — installed in two lines, working around the clock. Now available
          to every SERVERIZZ customer.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginTop: 6 }}>
          <Button asChild variant="primary" size="lg">
            <a href={ADD_WIDGET_URL} target="_blank" rel="noopener noreferrer">
              Add AccessWidget
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={FREE_SCAN_URL} target="_blank" rel="noopener noreferrer">
              Get a free scan
            </a>
          </Button>
        </div>
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 10,
            fontFamily: mono,
            fontSize: 12,
            color: "var(--szz-text-dim)",
          }}
        >
          {statusRows.map((row) => (
            <span key={row.label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {row.label}: <span style={{ color: row.tone }}>{row.value}</span>
            </span>
          ))}
        </div>
      </section>

      {/* install — live in minutes */}
      <section className="szz-section" style={{ background: "var(--szz-bg-card)" }}>
        <div className="szz-split" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionEyebrow tone="green" slashes={false}>
              Live in minutes, not months
            </SectionEyebrow>
            <h2
              style={{
                margin: 0,
                fontFamily: display,
                fontSize: "clamp(26px, 5vw, 32px)",
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-.5px",
                color: primary,
              }}
            >
              Drop one snippet in your site
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: muted }}>
              The AI gets to work immediately — no redesign, no developer backlog. Paste the loader
              once and AccessWidget handles the rest, re-scanning every 24 hours as your content
              changes.
            </p>
          </div>
          <Card surface="deep" glow>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span style={{ fontFamily: mono, fontSize: 12, color: "var(--szz-text-dim)" }}>
                index.html
              </span>
              <pre
                style={{
                  margin: 0,
                  fontFamily: mono,
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: light,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                <span style={{ color: "var(--szz-text-dim)" }}>&lt;!-- AccessWidget --&gt;</span>
                {"\n"}
                &lt;script src=&quot;https://acsbapp.com/apps/app/dist/js/app.js&quot;&gt;&lt;/script&gt;
              </pre>
            </div>
          </Card>
        </div>
      </section>

      {/* two technologies */}
      <section className="szz-section" style={{ background: "var(--szz-bg-deep)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center", textAlign: "center" }}>
            <SectionEyebrow>How_it_works</SectionEyebrow>
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
              Two technologies, one widget
            </h2>
          </div>
          <div className="szz-grid-2" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 20 }}>
            {technologies.map(({ Icon, color, title, body }) => (
              <Card key={title}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <Icon size={22} style={{ color }} />
                  <span style={{ fontFamily: display, fontSize: 19, fontWeight: 700, color: primary }}>
                    {title}
                  </span>
                  <span style={{ fontSize: 14, lineHeight: 1.6, color: muted }}>{body}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* adjustments */}
      <section className="szz-section" style={{ background: "var(--szz-bg-card)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <SectionEyebrow tone="green">What_visitors_get</SectionEyebrow>
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
              Adjustments for every kind of visitor
            </h2>
          </div>
          <div className="szz-grid-3" style={{ gap: 18 }}>
            {adjustments.map(({ Icon, color, title, body }) => (
              <Card key={title}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Icon size={20} style={{ color }} />
                  <span style={{ fontFamily: display, fontSize: 18, fontWeight: 700, color: primary }}>
                    {title}
                  </span>
                  <span style={{ fontSize: 13, lineHeight: 1.5, color: muted }}>{body}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* compliance */}
      <section className="szz-section" style={{ background: "var(--szz-bg-deep)" }}>
        <div className="szz-split" style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SectionEyebrow tone="accent">Compliance_covered</SectionEyebrow>
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
              Compliance, covered
            </h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: muted }}>
              AccessWidget keeps your site aligned with the standards regulators and customers expect
              — backed by a published statement, certification and an audit every month.
            </p>
          </div>
          <Card glow>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {compliance.map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle2 size={18} style={{ flexShrink: 0, color: "var(--szz-green)" }} />
                  <span style={{ fontSize: 14, color: light }}>{item}</span>
                </div>
              ))}
            </div>
          </Card>
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
          Give every visitor a site they can use.
        </h2>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Button asChild variant="primary" size="lg">
            <a href={ADD_WIDGET_URL} target="_blank" rel="noopener noreferrer">
              Add AccessWidget
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={FREE_SCAN_URL} target="_blank" rel="noopener noreferrer">
              Get a free scan
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}

import * as React from "react";
import Link from "next/link";
import { Mail, Phone, Printer, MapPin } from "lucide-react";
import { TerminalLogo } from "@/components/szz/terminal-logo";
import { PaymentMarks } from "@/components/szz/payment-marks";
import { SocialLinks } from "@/components/szz/social-links";
import { ImpactBadges } from "@/components/szz/impact-badges";
import { LEGAL_DOCS } from "@/lib/legal";
import { ORG } from "@/lib/seo";

type FooterMenu = {
  heading: string;
  links: { label: string; href?: string; external?: boolean; indent?: boolean; header?: boolean }[];
};

// Each entry is a footer column; a column may stack more than one menu vertically.
const COLUMNS: FooterMenu[][] = [
  [
    {
      heading: "PRODUCTS",
      links: [
        { label: "Hosting", header: true },
        { label: "Shared", href: "/hosting/shared", indent: true },
        { label: "WordPress", href: "/hosting/wordpress", indent: true },
        { label: "VPS", href: "/vps" },
        { label: "Dedicated", href: "/dedicated" },
        { label: "Domains", href: "/domains" },
      ],
    },
  ],
  [
    {
      heading: "SERVICES",
      links: [
        { label: "Web & Software", href: "/services/web-development" },
        { label: "SEO", href: "/services/seo" },
      ],
    },
    {
      heading: "BUSINESS TOOLS",
      links: [
        { label: "AI Employees", href: "/business-tools/ai-employees" },
        { label: "Web Accessibility", href: "/business-tools/web-accessibility" },
        { label: "Wholesale Domains", href: "/business-tools/resell-domain-names" },
      ],
    },
    {
      heading: "SPECIAL OFFERS",
      links: [
        { label: "Students & Educators", href: "/offers/education" },
      ],
    },
  ],
  [
    {
      heading: "COMPANY",
      links: [
        { label: "Why Us", href: "/why" },
        { label: "About", href: "/about" },
        { label: "Regions", href: "/data-centers" },
        { label: "Newsroom", href: "/blog" },
      ],
    },
  ],
  [
    {
      heading: "SUPPORT",
      links: [
        { label: "Help Center", href: "/support" },
        { label: "Status", href: "https://status.serverizz.com", external: true },
        { label: "Contact", href: "/support" },
      ],
    },
  ],
  [
    {
      heading: "LEGAL",
      links: LEGAL_DOCS.map((doc) => ({
        label: doc.label,
        href: `/legal/${doc.slug}`,
      })),
    },
  ],
];

export function SiteFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--szz-border)",
        background: "var(--szz-bg-deep)",
        padding: "60px 48px 40px",
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          gap: 48,
          flexWrap: "wrap",
        }}
      >
        <div style={{ width: 300, display: "flex", flexDirection: "column", gap: 16 }}>
          <TerminalLogo size={24} />
          <span style={{ fontSize: 13, fontStyle: "italic", color: "var(--szz-text-dim)" }}>
            ship infrastructure. ship software. ship brands.
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a
              href={`mailto:${ORG.email}`}
              className="szz-foot-link"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Mail size={15} style={{ flexShrink: 0, color: "var(--szz-accent-blue)" }} />
              {ORG.email}
            </a>
            <a
              href={`tel:${ORG.phone}`}
              className="szz-foot-link"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <Phone size={15} style={{ flexShrink: 0, color: "var(--szz-accent-blue)" }} />
              {ORG.phoneDisplay}
            </a>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "var(--szz-text-muted)",
              }}
            >
              <Printer size={15} style={{ flexShrink: 0, color: "var(--szz-accent-blue)" }} />
              {ORG.faxDisplay} <span style={{ color: "var(--szz-text-dim)" }}>fax</span>
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                fontSize: 13,
                lineHeight: 1.6,
                color: "var(--szz-text-dim)",
              }}
            >
              <MapPin
                size={15}
                style={{ flexShrink: 0, marginTop: 3, color: "var(--szz-accent-blue)" }}
              />
              <span>
                {ORG.address.streetAddress}
                <br />
                {ORG.address.addressLocality}, {ORG.address.addressRegion}{" "}
                {ORG.address.postalCode}
              </span>
            </span>
          </div>
          <SocialLinks />
        </div>

        <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
          {COLUMNS.map((menus) => (
            <div
              key={menus[0].heading}
              style={{ display: "flex", flexDirection: "column", gap: 28 }}
            >
              {menus.map((menu) => (
                <div
                  key={menu.heading}
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 2,
                      color: "var(--szz-accent-blue)",
                    }}
                  >
                    {menu.heading}
                  </span>
                  {menu.links.map((link, i) =>
                    link.header || !link.href ? (
                      <span
                        key={`${link.label}-${i}`}
                        style={{
                          fontFamily: "var(--font-body)",
                          fontSize: 13,
                          color: "var(--szz-text-dim)",
                          cursor: "default",
                        }}
                      >
                        {link.label}
                      </span>
                    ) : (
                      <Link
                        key={`${link.label}-${i}`}
                        href={link.href}
                        className="szz-foot-link"
                        style={link.indent ? { paddingLeft: 12 } : undefined}
                        {...(link.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </Link>
                    )
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <ImpactBadges />

      <div style={{ maxWidth: 1180, margin: "40px auto 0", height: 1, background: "var(--szz-border)" }} />
      <div
        style={{
          maxWidth: 1180,
          margin: "20px auto 0",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--szz-text-dim)" }}>
          © 2026 Rizz Enterprises, LLC.
        </span>
        <PaymentMarks />
      </div>
    </footer>
  );
}

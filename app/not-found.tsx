import { Fragment } from "react";
import Link from "next/link";
import { SiteNav } from "@/components/szz/site-nav";
import { SiteFooter } from "@/components/szz/site-footer";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import { HeroMeshBackdrop } from "@/components/szz/hero-mesh";
import { NotFoundTerminal } from "@/components/szz/not-found-terminal";
import { Button } from "@/components/ui/button";

const primary = "var(--szz-text-primary)";
const muted = "var(--szz-text-muted)";

// Secondary "jump to" links under the CTAs, mirroring the design comp.
const quickLinks = [
  { href: "/hosting/shared", label: "Hosting" },
  { href: "/domains", label: "Domains" },
  { href: "/blog", label: "Newsroom" },
  { href: "/support", label: "Support" },
];

/**
 * Root not-found — renders for any unmatched URL across the site (and for any
 * `notFound()` thrown in a segment without its own boundary). The root layout
 * supplies fonts/scripts but not the site chrome, so we bring `SiteNav` /
 * `SiteFooter` ourselves to match the design's full-page 404.
 */
export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--szz-bg-deep)" }}>
      <SiteNav />
      <main>
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            minHeight: "72vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "90px 24px",
          }}
        >
          <HeroMeshBackdrop />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              maxWidth: 680,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 30,
              textAlign: "center",
            }}
          >
            <SectionEyebrow tone="green" slashes={false}>
              Error_404
            </SectionEyebrow>

            <NotFoundTerminal />

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(30px, 6vw, 40px)",
                  fontWeight: 700,
                  lineHeight: 1.06,
                  letterSpacing: "-1.5px",
                  color: primary,
                }}
              >
                This page took an unexpected exit.
              </h1>
              <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: muted }}>
                The link may be broken or the page may have moved. Your sites and
                data are safe — let&rsquo;s get you back on track.
              </p>
            </div>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <Button asChild variant="primary" size="lg">
                <Link href="/">Back to home</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/support">Contact support</Link>
              </Button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                flexWrap: "wrap",
                justifyContent: "center",
                paddingTop: 6,
                fontSize: 14,
              }}
            >
              {quickLinks.map(({ href, label }, i) => (
                <Fragment key={href}>
                  {i > 0 && (
                    <span
                      aria-hidden
                      style={{ width: 3, height: 3, borderRadius: 999, background: "var(--szz-text-faint)" }}
                    />
                  )}
                  <Link
                    href={href}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      color: "var(--szz-accent-blue)",
                    }}
                  >
                    {label}
                  </Link>
                </Fragment>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

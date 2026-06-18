import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

// Open Graph / social-share card, generated at build time.
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens (mirrors --szz-* in app/globals.css).
const BG = "#0b0e18";
const PANEL = "#111827";
const BORDER = "#1e3a5f";
const ACCENT = "#60a5fa";
const GREEN = "#22c55e";
const YELLOW = "#f59e0b";
const RED = "#ef4444";
const TEXT = "#ffffff";
const MUTED = "#94a3b8";
const DIM = "#64748b";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: `radial-gradient(900px 600px at 78% -8%, #16223f 0%, ${BG} 60%)`,
          fontFamily: "sans-serif",
        }}
      >
        {/* terminal window */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 560,
            borderRadius: 16,
            border: `1px solid ${BORDER}`,
            background: PANEL,
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 20px",
              borderBottom: `1px solid ${BORDER}`,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 99, background: RED }} />
            <div style={{ width: 14, height: 14, borderRadius: 99, background: YELLOW }} />
            <div style={{ width: 14, height: 14, borderRadius: 99, background: GREEN }} />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: "26px 28px 30px",
              fontSize: 26,
            }}
          >
            <div style={{ display: "flex", gap: 12, color: TEXT }}>
              <span style={{ color: GREEN }}>$</span>
              <span>serverizz launch mybakery.com</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, color: GREEN }}>
              {/* CSS-drawn check (avoids Satori fetching a font for the ✓ glyph) */}
              <span
                style={{
                  display: "flex",
                  width: 12,
                  height: 12,
                  borderRadius: 99,
                  background: GREEN,
                }}
              />
              <span>Site live — SSL issued, backups on</span>
            </div>
          </div>
        </div>

        {/* wordmark + tagline */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 56 }}>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: "-3px",
              color: TEXT,
            }}
          >
            {SITE_NAME}
          </div>
          <div style={{ display: "flex", marginTop: 14, fontSize: 34, color: MUTED }}>
            {SITE_TAGLINE}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 22,
              fontSize: 22,
              color: DIM,
            }}
          >
            <span style={{ color: ACCENT }}>ship infrastructure.</span>
            <span style={{ marginLeft: 10 }}>ship software. ship brands.</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * NotFoundTerminal — the 404 page's CLI window, ported from the design comp.
 * Traffic-light bar, a `serverizz-cli` title, and a faux `serverizz open <path>`
 * session that fails with a red "page not found" and a blinking green prompt.
 *
 * The opened path mirrors the URL the visitor actually hit (`usePathname`),
 * matching the design's `nf_path` — falling back to a placeholder for `/`.
 * Colours are pinned to the dark-console palette (not the theme tokens) so the
 * terminal reads identically in light and dark mode, like every other
 * `.szz-term` on the site.
 */
export function NotFoundTerminal() {
  const pathname = usePathname();
  const path =
    pathname && pathname !== "/" ? pathname : "/the-page-you-wanted";

  return (
    <div
      style={{
        width: "100%",
        textAlign: "left",
        border: "1px solid var(--szz-border)",
        borderRadius: 12,
        background: "#0B0E18",
        boxShadow: "var(--shadow-glow-blue)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          padding: "11px 16px",
          borderBottom: "1px solid var(--szz-border)",
        }}
      >
        <div style={{ display: "flex", gap: 7 }} aria-hidden>
          <span style={{ width: 11, height: 11, borderRadius: 999, background: "#e06c5b" }} />
          <span style={{ width: 11, height: 11, borderRadius: 999, background: "#e3b341" }} />
          <span style={{ width: 11, height: 11, borderRadius: 999, background: "#7bbf6a" }} />
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--szz-text-dim)" }}>
          serverizz-cli v4.2.0
        </span>
      </div>
      <div style={{ padding: 20, fontFamily: "var(--font-mono)", fontSize: 14, lineHeight: 1.9 }}>
        <div>
          <span style={{ color: "#7bbf6a" }}>$</span>{" "}
          <span style={{ color: "#60A5FA" }}>serverizz</span>{" "}
          <span style={{ color: "#cbd5e1" }}>open {path}</span>
        </div>
        <div style={{ color: "#e06c5b" }}>✗ error 404: page not found</div>
        <div style={{ color: "#94a3b8" }}># the resource you requested has moved or never existed</div>
        <div style={{ color: "#7bbf6a" }}>
          ${" "}
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 9,
              height: 17,
              verticalAlign: -3,
              background: "#7bbf6a",
              animation: "szz-blink 1.06s steps(1) infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}

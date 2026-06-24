"use client";

import * as React from "react";

type Mode = "hidden" | "animate" | "instant";

/**
 * HighlightSweep — the marker-pen highlight used on the Back to School campaign.
 * The colored band sweeps left-to-right (background-size 0% → 100%) the first
 * time the text scrolls into view. Honors prefers-reduced-motion by painting
 * the highlight with no transition, and falls back to fully painted if the
 * observer never fires.
 */
export function HighlightSweep({
  children,
  color = "#FCD34D",
  height = 56,
}: {
  children: React.ReactNode;
  /** Marker color. */
  color?: string;
  /** Where the band starts, as a % of line height (56 = bottom 44%). */
  height?: number;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [mode, setMode] = React.useState<Mode>("hidden");

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setMode("instant"));
      return () => cancelAnimationFrame(id);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMode("animate");
          observer.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    observer.observe(el);

    // Safety net: if the trigger is ever missed, the highlight must still show.
    const safety = window.setTimeout(() => setMode("animate"), 1600);

    return () => {
      observer.disconnect();
      window.clearTimeout(safety);
    };
  }, []);

  return (
    <span
      ref={ref}
      style={{
        backgroundImage: `linear-gradient(transparent ${height}%, ${color} ${height}%)`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        backgroundSize: mode === "hidden" ? "0% 100%" : "100% 100%",
        transition: mode === "animate" ? "background-size .75s cubic-bezier(.6,0,.2,1)" : undefined,
        padding: "0 6px",
      }}
    >
      {children}
    </span>
  );
}

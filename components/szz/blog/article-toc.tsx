"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/wp-prose";

// Distance from the viewport top that marks the "active" line — sits just below
// the sticky site nav, and matches the headings' scroll-margin-top in globals.css.
const TOP_OFFSET = 112;

export function ArticleToc({ toc }: { toc: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);

  useEffect(() => {
    if (!toc.length) return;
    const headings = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!headings.length) return;

    // Active section = the last heading whose top has scrolled past the offset line.
    const update = () => {
      let current = headings[0].id;
      for (const h of headings) {
        if (h.getBoundingClientRect().top - TOP_OFFSET <= 1) current = h.id;
        else break;
      }
      setActiveId(current);
    };

    update();
    // The observer just triggers a recompute whenever a heading crosses the line
    // near the top of the viewport — cheaper and smoother than a scroll listener.
    const observer = new IntersectionObserver(update, {
      rootMargin: `-${TOP_OFFSET}px 0px -66% 0px`,
      threshold: [0, 1],
    });
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [toc]);

  if (!toc.length) return null;
  return (
    <nav aria-label="On this page" style={{ position: "sticky", top: 120, display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--szz-text-faint)" }}>On this page</span>
      {toc.map((t) => {
        const active = t.id === activeId;
        return (
          <a
            key={t.id}
            href={`#${t.id}`}
            aria-current={active ? "location" : undefined}
            style={{
              fontSize: 14,
              lineHeight: 1.4,
              color: active ? "var(--szz-text-primary)" : "var(--szz-text-muted)",
              fontWeight: active ? 600 : 400,
              borderLeft: `2px solid ${active ? "var(--szz-accent-blue)" : "transparent"}`,
              paddingLeft: t.level === 3 ? 24 : 12,
              transition: "color .15s ease, border-color .15s ease",
            }}
          >
            {t.label}
          </a>
        );
      })}
    </nav>
  );
}

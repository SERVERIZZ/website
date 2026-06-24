import type { TocItem } from "@/lib/wp-prose";

export function ArticleToc({ toc }: { toc: TocItem[] }) {
  if (!toc.length) return null;
  return (
    <nav aria-label="On this page" style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "var(--szz-text-faint)" }}>On this page</span>
      {toc.map((t) => (
        <a key={t.id} href={`#${t.id}`} style={{ fontSize: 14, lineHeight: 1.4, color: "var(--szz-text-muted)", paddingLeft: t.level === 3 ? 12 : 0 }}>{t.label}</a>
      ))}
    </nav>
  );
}

import Link from "next/link";
import type React from "react";

/** basePath e.g. "/blog" → "/blog/page/2"; "/blog/category/x" → "/blog/category/x?page=2". */
export function Pagination({ basePath, page, totalPages }: { basePath: string; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const href = (n: number) =>
    basePath === "/blog" ? (n === 1 ? "/blog" : `/blog/page/${n}`) : `${basePath}?page=${n}`;
  const btn = (disabled: boolean): React.CSSProperties => ({
    fontFamily: "var(--font-body)", fontSize: 14, color: disabled ? "var(--szz-text-faint)" : "var(--szz-text-primary)",
    border: "1px solid var(--szz-border)", borderRadius: 8, padding: "8px 16px",
    pointerEvents: disabled ? "none" : "auto", opacity: disabled ? 0.5 : 1,
  });
  const newerDisabled = page <= 1;
  const olderDisabled = page >= totalPages;
  return (
    <nav aria-label="Pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, paddingTop: 24 }}>
      {newerDisabled
        ? <span style={btn(true)} aria-disabled="true">← Newer</span>
        : <Link href={href(page - 1)} style={btn(false)}>← Newer</Link>}
      <span style={{ fontSize: 13, color: "var(--szz-text-dim)" }}>Page {page} of {totalPages}</span>
      {olderDisabled
        ? <span style={btn(true)} aria-disabled="true">Older →</span>
        : <Link href={href(page + 1)} style={btn(false)}>Older →</Link>}
    </nav>
  );
}

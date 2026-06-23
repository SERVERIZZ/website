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
  return (
    <nav aria-label="Pagination" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, paddingTop: 24 }}>
      <Link href={href(Math.max(1, page - 1))} style={btn(page <= 1)} aria-disabled={page <= 1}>← Newer</Link>
      <span style={{ fontSize: 13, color: "var(--szz-text-dim)" }}>Page {page} of {totalPages}</span>
      <Link href={href(Math.min(totalPages, page + 1))} style={btn(page >= totalPages)} aria-disabled={page >= totalPages}>Older →</Link>
    </nav>
  );
}

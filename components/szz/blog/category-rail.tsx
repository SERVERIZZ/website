import Link from "next/link";
import type { Category } from "@/lib/wp-map";

export function CategoryRail({ categories, activeSlug }: { categories: Category[]; activeSlug?: string }) {
  return (
    <nav aria-label="Blog categories" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Link
        href="/blog"
        aria-current={!activeSlug ? "page" : undefined}
        style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: !activeSlug ? "#fff" : "var(--szz-text-muted)", background: !activeSlug ? "var(--szz-cta-blue)" : "transparent", border: "1px solid var(--szz-border)", borderRadius: 999, padding: "7px 15px" }}
      >
        Newsroom
      </Link>
      {categories.map((c) => {
        const active = c.slug === activeSlug;
        return (
          <Link
            key={c.slug}
            href={`/blog/category/${c.slug}`}
            aria-current={active ? "page" : undefined}
            style={{ fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 500, color: active ? "#fff" : "var(--szz-text-muted)", background: active ? c.colorVar : "transparent", border: `1px solid ${active ? c.colorVar : "var(--szz-border)"}`, borderRadius: 999, padding: "7px 15px" }}
          >
            {c.name}
          </Link>
        );
      })}
    </nav>
  );
}

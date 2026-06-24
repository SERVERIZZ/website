import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { Post } from "@/lib/wp-map";

export function ArticleHero({ post }: { post: Post }) {
  return (
    <header style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: "var(--szz-text-dim)" }}>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", gap: 4, alignItems: "center" }}>
          <li><Link href="/blog" style={{ color: "var(--szz-text-dim)" }}>Newsroom</Link></li>
          {post.category && (
            <>
              <li aria-hidden="true">/</li>
              <li><Link href={`/blog/category/${post.category.slug}`} style={{ color: post.category.colorVar }}>{post.category.name}</Link></li>
            </>
          )}
        </ol>
      </nav>
      {post.category && (
        <Badge variant="outline" style={{ alignSelf: "flex-start", color: post.category.colorVar, borderColor: post.category.colorVar }}>{post.category.name}</Badge>
      )}
      <h1 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: "clamp(30px,5vw,44px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-1.5px", color: "var(--szz-text-primary)" }}>{post.title}</h1>
      <div style={{ display: "flex", gap: 10, fontSize: 13.5, color: "var(--szz-text-dim)" }}>
        <span>{post.dateLabel}</span><span>·</span><span>{post.readingMinutes} min read</span>
      </div>
      {post.featuredImage && (
        <Image src={post.featuredImage.url} alt={post.featuredImage.alt} width={post.featuredImage.width ?? 1200} height={post.featuredImage.height ?? 630} style={{ width: "100%", height: "auto", borderRadius: 14, marginTop: 8 }} priority />
      )}
    </header>
  );
}

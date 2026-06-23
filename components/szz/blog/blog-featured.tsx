import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { PostSummary } from "@/lib/wp-map";

export function BlogFeatured({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{
        display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 0,
        border: "1px solid var(--szz-border)", borderRadius: 16,
        background: "var(--szz-bg-card)", overflow: "hidden",
      }}
    >
      {post.featuredImage ? (
        <Image src={post.featuredImage.url} alt={post.featuredImage.alt} width={post.featuredImage.width ?? 800} height={post.featuredImage.height ?? 500} style={{ width: "100%", height: "100%", minHeight: 280, objectFit: "cover" }} />
      ) : (
        <div style={{ minHeight: 280, background: "var(--szz-bg-raised)" }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 36, justifyContent: "center" }}>
        {post.category && (
          <Badge variant="outline" style={{ alignSelf: "flex-start", color: post.category.colorVar, borderColor: post.category.colorVar }}>{post.category.name}</Badge>
        )}
        <h2 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 30, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-1px", color: "var(--szz-text-primary)" }}>{post.title}</h2>
        <p style={{ margin: 0, fontSize: 16, lineHeight: 1.65, color: "var(--szz-text-muted)" }}>{post.excerpt}</p>
        <div style={{ display: "flex", gap: 10, fontSize: 13, color: "var(--szz-text-dim)" }}>
          <span>{post.dateLabel}</span><span>·</span><span>{post.readingMinutes} min read</span>
        </div>
      </div>
    </Link>
  );
}

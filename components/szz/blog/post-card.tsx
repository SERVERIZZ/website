import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { PostSummary } from "@/lib/wp-map";

export function PostCard({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      style={{
        display: "flex", flexDirection: "column", gap: 14,
        border: "1px solid var(--szz-border)", borderRadius: 14,
        background: "var(--szz-bg-card)", overflow: "hidden", height: "100%",
      }}
    >
      {post.featuredImage ? (
        <Image
          src={post.featuredImage.url}
          alt={post.featuredImage.alt}
          width={post.featuredImage.width ?? 640}
          height={post.featuredImage.height ?? 360}
          style={{ width: "100%", height: 180, objectFit: "cover" }}
        />
      ) : (
        <div style={{ height: 180, background: "var(--szz-bg-raised)" }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "0 20px 22px" }}>
        {post.category && (
          <Badge variant="outline" style={{ alignSelf: "flex-start", color: post.category.colorVar, borderColor: post.category.colorVar }}>
            {post.category.name}
          </Badge>
        )}
        <h3 style={{ margin: 0, fontFamily: "var(--font-heading)", fontSize: 19, fontWeight: 700, lineHeight: 1.25, color: "var(--szz-text-primary)" }}>
          {post.title}
        </h3>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "var(--szz-text-muted)" }}>{post.excerpt}</p>
        <div style={{ display: "flex", gap: 10, fontSize: 12.5, color: "var(--szz-text-dim)" }}>
          <span>{post.dateLabel}</span><span>·</span><span>{post.readingMinutes} min read</span>
        </div>
      </div>
    </Link>
  );
}

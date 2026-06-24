import { PostCard } from "@/components/szz/blog/post-card";
import { SectionEyebrow } from "@/components/szz/section-eyebrow";
import type { PostSummary } from "@/lib/wp-map";

export function RelatedPosts({ posts }: { posts: PostSummary[] }) {
  if (!posts.length) return null;
  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionEyebrow>Keep reading</SectionEyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {posts.map((p) => <PostCard key={p.slug} post={p} />)}
      </div>
    </section>
  );
}

import Image from "next/image";
import type { Author } from "@/lib/wp-map";

export function AuthorByline({ author }: { author: Author }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, border: "1px solid var(--szz-border)", borderRadius: 12, background: "var(--szz-bg-card)", padding: "16px 20px" }}>
      {author.avatarUrl && (
        <Image src={author.avatarUrl} alt={author.name} width={44} height={44} style={{ borderRadius: 999 }} />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 700, color: "var(--szz-text-primary)" }}>{author.name}</span>
        {author.description && <span style={{ fontSize: 13, color: "var(--szz-text-muted)" }}>{author.description}</span>}
      </div>
    </div>
  );
}

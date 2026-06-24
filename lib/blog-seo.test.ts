import { describe, it, expect } from "vitest";
import { articleMetadata, blogPostingJsonLd, blogBreadcrumb } from "@/lib/blog-seo";
import type { Post } from "@/lib/wp-map";

const POST: Post = {
  id: 7, slug: "managed-hosting-saves-time", title: "How Managed Hosting Saves Time",
  excerpt: "Updates, backups & patches handled for you.",
  date: "2026-06-18T09:00:00", modified: "2026-06-19T09:00:00", dateLabel: "Jun 18, 2026",
  readingMinutes: 6,
  category: { id: 3, slug: "small-business", name: "Small Business", colorVar: "var(--szz-green)" },
  featuredImage: { url: "https://newsroom.serverizz.com/f.jpg", alt: "cover", width: 1200, height: 630 },
  contentHtml: "<p>hi</p>", toc: [], author: { name: "Ada", slug: "ada", description: "", avatarUrl: null },
};

describe("articleMetadata", () => {
  it("sets canonical, og:type=article and the featured image", () => {
    const m = articleMetadata(POST);
    expect(m.alternates?.canonical).toBe("/blog/managed-hosting-saves-time");
    expect((m.openGraph as Record<string, unknown>).type).toBe("article");
    expect(JSON.stringify(m.openGraph)).toContain("f.jpg");
    expect(m.title).toBe("How Managed Hosting Saves Time");
  });
});

describe("blogPostingJsonLd", () => {
  it("emits a BlogPosting with dates, author, image, url", () => {
    const ld = blogPostingJsonLd(POST);
    expect(ld["@type"]).toBe("BlogPosting");
    expect(ld.headline).toBe("How Managed Hosting Saves Time");
    expect(ld.datePublished).toBe("2026-06-18T09:00:00");
    expect(ld.dateModified).toBe("2026-06-19T09:00:00");
    expect(ld.url).toBe("https://www.serverizz.com/blog/managed-hosting-saves-time");
    expect(JSON.stringify(ld.author)).toContain("Ada");
  });
});

describe("blogBreadcrumb", () => {
  it("builds Home → Newsroom → Category → Post", () => {
    const items = blogBreadcrumb(POST);
    expect(items.map((i) => i.name)).toEqual(["Home", "Newsroom", "Small Business", "How Managed Hosting Saves Time"]);
    expect(items[3].item).toBe("https://www.serverizz.com/blog/managed-hosting-saves-time");
  });
});

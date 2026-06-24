import {
  mapPost,
  mapPostSummary,
  mapCategory,
  type Post,
  type PostSummary,
  type Category,
  type RawWpPost,
  type RawWpCategory,
} from "@/lib/wp-map";

const BASE = process.env.WORDPRESS_API_URL ?? "https://newsroom.serverizz.com/wp-json/wp/v2";
const REVALIDATE = 600;

export interface PostsPage { posts: PostSummary[]; total: number; totalPages: number }

function url(path: string, params: Record<string, string | number | undefined>): string {
  const u = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) u.searchParams.set(k, String(v));
  }
  return u.toString();
}

async function wpFetch(target: string): Promise<Response> {
  const res = await fetch(target, { next: { revalidate: REVALIDATE, tags: ["wp"] } });
  if (!res.ok) throw new Error(`WordPress ${res.status} for ${target}`);
  return res;
}

export async function getPosts(opts: { page?: number; perPage?: number; categoryId?: number } = {}): Promise<PostsPage> {
  const { page = 1, perPage = 10, categoryId } = opts;
  const res = await wpFetch(url("/posts", { _embed: 1, per_page: perPage, page, categories: categoryId }));
  const raw = (await res.json()) as RawWpPost[];
  return {
    posts: raw.map(mapPostSummary),
    total: Number(res.headers.get("x-wp-total") ?? raw.length),
    totalPages: Number(res.headers.get("x-wp-totalpages") ?? 1),
  };
}

export async function getPost(slug: string): Promise<Post | null> {
  const res = await wpFetch(url("/posts", { slug, _embed: 1 }));
  const raw = (await res.json()) as RawWpPost[];
  return raw.length ? mapPost(raw[0]) : null;
}

export async function getCategories(): Promise<Category[]> {
  const res = await wpFetch(url("/categories", { per_page: 100, hide_empty: 1 }));
  const raw = (await res.json()) as RawWpCategory[];
  return raw.map(mapCategory);
}

export async function getCategory(slug: string): Promise<Category | null> {
  const res = await wpFetch(url("/categories", { slug }));
  const raw = (await res.json()) as RawWpCategory[];
  return raw.length ? mapCategory(raw[0]) : null;
}

import { db, schema } from "@/lib/db";
import { desc, count } from "drizzle-orm";
import { publishedPostFilter } from "@/lib/posts";
import { parseJsonArray } from "@/lib/json";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  const [posts, totalRow] = await Promise.all([
    db
      .select({
        id: schema.post.id,
        title: schema.post.title,
        slug: schema.post.slug,
        excerpt: schema.post.excerpt,
        tags: schema.post.tags,
        coverImage: schema.post.coverImage,
        publishedAt: schema.post.publishedAt,
      })
      .from(schema.post)
      .where(publishedPostFilter)
      .orderBy(desc(schema.post.publishedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ c: count() })
      .from(schema.post)
      .where(publishedPostFilter)
      .get(),
  ]);

  const total = totalRow?.c ?? 0;

  return Response.json({
    items: posts.map((p) => ({ ...p, tags: parseJsonArray(p.tags) })),
    total,
    page,
    limit,
    hasMore: offset + posts.length < total,
  });
}

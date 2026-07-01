import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  const posts = await db
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
    .orderBy(desc(schema.post.publishedAt))
    .limit(limit)
    .offset(offset);

  return Response.json(
    posts.map((p) => ({ ...p, tags: JSON.parse(p.tags) }))
  );
}

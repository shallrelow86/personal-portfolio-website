import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function GET() {
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
    .orderBy(desc(schema.post.publishedAt));

  return Response.json(
    posts.map((p) => ({ ...p, tags: JSON.parse(p.tags) }))
  );
}

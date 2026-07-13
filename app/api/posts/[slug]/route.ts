import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { publishedPostFilter } from "@/lib/posts";
import { parseJsonArray } from "@/lib/json";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await db
    .select()
    .from(schema.post)
    .where(and(eq(schema.post.slug, slug), publishedPostFilter))
    .get();

  if (!post) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ ...post, tags: parseJsonArray(post.tags) });
}

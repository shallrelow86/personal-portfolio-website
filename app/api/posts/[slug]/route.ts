import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await db
    .select()
    .from(schema.post)
    .where(eq(schema.post.slug, slug))
    .get();

  if (!post) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({ ...post, tags: JSON.parse(post.tags) });
}

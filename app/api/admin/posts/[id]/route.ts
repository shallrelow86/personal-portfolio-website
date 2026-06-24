import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const post = await db
    .select()
    .from(schema.post)
    .where(eq(schema.post.id, Number(id)))
    .get();

  if (!post) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(post);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const body = await req.json();

  await db
    .update(schema.post)
    .set({
      title: body.title,
      slug: body.slug,
      body: body.body,
      excerpt: body.excerpt || "",
      tags: JSON.stringify(body.tags || []),
      coverImage: body.coverImage || "",
      publishedAt: body.publishedAt,
      updatedAt: Date.now(),
    })
    .where(eq(schema.post.id, Number(id)));

  return Response.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  await db.delete(schema.post).where(eq(schema.post.id, Number(id)));
  return Response.json({ ok: true });
}

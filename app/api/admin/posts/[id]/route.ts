import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { syncEmbedding, deleteEmbedding } from "@/lib/sync-embedding";

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

  const result = await db
    .update(schema.post)
    .set({
      title: body.title,
      slug: body.slug,
      body: body.body,
      excerpt: body.excerpt || "",
      tags: JSON.stringify(body.tags || []),
      coverImage: body.coverImage || "",
      publishedAt: body.publishedAt,
      categoryId: body.categoryId ?? undefined,
      status: body.status ?? undefined,
      updatedAt: Date.now(),
    })
    .where(eq(schema.post.id, Number(id)));

  if (result.changes === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const sync = await syncEmbedding("post", Number(id));
  return Response.json({ ok: true, embeddingSynced: sync.ok, embeddingError: sync.error });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const result = await db.delete(schema.post).where(eq(schema.post.id, Number(id)));
  if (result.changes === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  await deleteEmbedding("post", Number(id));
  return Response.json({ ok: true });
}

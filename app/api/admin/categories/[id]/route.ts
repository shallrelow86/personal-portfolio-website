import { requireAdmin } from "@/lib/auth";
import { invalidateCategoryCache } from "@/lib/categories";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { syncEmbedding } from "@/lib/sync-embedding";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin();
  if (err) return err;
  const { id } = await params;
  const body = await req.json();
  const numId = Number(id);
  const result = await db.update(schema.category).set({
    name: body.name,
    slug: body.slug,
    parentId: body.parentId || null,
    sortOrder: body.sortOrder || 0,
    updatedAt: Date.now(),
  }).where(eq(schema.category.id, numId));
  if (result.changes === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  invalidateCategoryCache();

  const [posts, bookmarks] = await Promise.all([
    db.select({ id: schema.post.id }).from(schema.post).where(eq(schema.post.categoryId, numId)),
    db.select({ id: schema.bookmark.id }).from(schema.bookmark).where(eq(schema.bookmark.categoryId, numId)),
  ]);
  await Promise.all([
    ...posts.map((p) => syncEmbedding("post", p.id)),
    ...bookmarks.map((b) => syncEmbedding("bookmark", b.id)),
  ]);

  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin();
  if (err) return err;
  const { id } = await params;
  const numId = Number(id);

  const children = await db.select().from(schema.category).where(eq(schema.category.parentId, numId));
  if (children.length > 0) {
    return Response.json({ error: "Delete child categories first" }, { status: 400 });
  }

  const linkedPost = await db.select({ id: schema.post.id }).from(schema.post).where(eq(schema.post.categoryId, numId)).get();
  if (linkedPost) {
    return Response.json({ error: "Category has linked posts — reassign them first" }, { status: 400 });
  }

  const linkedBookmark = await db.select({ id: schema.bookmark.id }).from(schema.bookmark).where(eq(schema.bookmark.categoryId, numId)).get();
  if (linkedBookmark) {
    return Response.json({ error: "Category has linked bookmarks — reassign them first" }, { status: 400 });
  }

  const result = await db.delete(schema.category).where(eq(schema.category.id, numId));
  if (result.changes === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  invalidateCategoryCache();
  return Response.json({ ok: true });
}

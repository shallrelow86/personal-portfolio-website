import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin();
  if (err) return err;
  const { id } = await params;
  const bookmark = await db.select().from(schema.bookmark).where(eq(schema.bookmark.id, Number(id))).get();
  if (!bookmark) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({ ...bookmark, tags: JSON.parse(bookmark.tags) });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin();
  if (err) return err;
  const { id } = await params;
  const body = await req.json();
  const result = await db.update(schema.bookmark).set({
    title: body.title,
    url: body.url,
    description: body.description || "",
    favicon: body.favicon || "",
    reason: body.reason || "",
    categoryId: body.categoryId || null,
    tags: JSON.stringify(body.tags || []),
    sortOrder: body.sortOrder || 0,
    updatedAt: Date.now(),
  }).where(eq(schema.bookmark.id, Number(id)));
  if (result.changes === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin();
  if (err) return err;
  const { id } = await params;
  const result = await db.delete(schema.bookmark).where(eq(schema.bookmark.id, Number(id)));
  if (result.changes === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}

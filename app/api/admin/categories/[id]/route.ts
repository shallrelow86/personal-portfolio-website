import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin();
  if (err) return err;
  const { id } = await params;
  const body = await req.json();
  const result = await db.update(schema.category).set({
    name: body.name,
    slug: body.slug,
    parentId: body.parentId || null,
    sortOrder: body.sortOrder || 0,
    updatedAt: Date.now(),
  }).where(eq(schema.category.id, Number(id)));
  if (result.changes === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin();
  if (err) return err;
  const { id } = await params;

  const children = await db.select().from(schema.category).where(eq(schema.category.parentId, Number(id)));
  if (children.length > 0) {
    return Response.json({ error: "Delete child categories first" }, { status: 400 });
  }

  const result = await db.delete(schema.category).where(eq(schema.category.id, Number(id)));
  if (result.changes === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}

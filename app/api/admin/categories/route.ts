import { requireAdmin } from "@/lib/auth";
import { invalidateCategoryCache } from "@/lib/categories";
import { db, schema } from "@/lib/db";
import { asc } from "drizzle-orm";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;
  const cats = await db.select().from(schema.category).orderBy(asc(schema.category.sortOrder));
  return Response.json(cats);
}

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;
  const body = await req.json();
  const now = Date.now();
  try {
    const result = await db.insert(schema.category).values({
      name: body.name,
      slug: body.slug,
      parentId: body.parentId || null,
      sortOrder: body.sortOrder || 0,
      createdAt: now,
      updatedAt: now,
    });
    invalidateCategoryCache();
    return Response.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message?.includes("UNIQUE constraint")) {
      return Response.json({ error: "Slug already taken" }, { status: 409 });
    }
    throw e;
  }
}

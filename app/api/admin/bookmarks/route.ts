import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;
  const bookmarks = await db.select().from(schema.bookmark).orderBy(desc(schema.bookmark.createdAt));
  return Response.json(bookmarks.map((b) => ({ ...b, tags: JSON.parse(b.tags) })));
}

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;
  const body = await req.json();
  const now = Date.now();
  try {
    const result = await db.insert(schema.bookmark).values({
      title: body.title,
      url: body.url,
      description: body.description || "",
      favicon: body.favicon || "",
      reason: body.reason || "",
      categoryId: body.categoryId || null,
      tags: JSON.stringify(body.tags || []),
      sortOrder: body.sortOrder || 0,
      createdAt: now,
      updatedAt: now,
    });
    return Response.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
  } catch (e: any) {
    if (e.message?.includes("UNIQUE")) {
      return Response.json({ error: "URL already exists" }, { status: 409 });
    }
    throw e;
  }
}

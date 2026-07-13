import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { syncEmbedding } from "@/lib/sync-embedding";
import { parseJsonArray } from "@/lib/json";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;
  const bookmarks = await db.select().from(schema.bookmark).orderBy(desc(schema.bookmark.createdAt));
  return Response.json(bookmarks.map((b) => ({ ...b, tags: parseJsonArray(b.tags) })));
}

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;
  const body = await req.json();
  if (!body?.title || !body?.url || typeof body.url !== "string") {
    return Response.json({ error: "title and url required" }, { status: 400 });
  }
  try {
    new URL(body.url);
  } catch {
    return Response.json({ error: "Invalid url" }, { status: 400 });
  }
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
    const id = Number(result.lastInsertRowid);
    await syncEmbedding("bookmark", id);
    return Response.json({ id }, { status: 201 });
  } catch (e: unknown) {
    if (e instanceof Error && e.message?.includes("UNIQUE")) {
      return Response.json({ error: "URL already exists" }, { status: 409 });
    }
    throw e;
  }
}

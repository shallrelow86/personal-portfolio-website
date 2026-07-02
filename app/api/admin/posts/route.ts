import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import { syncEmbedding } from "@/lib/sync-embedding";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const posts = await db
    .select()
    .from(schema.post)
    .orderBy(desc(schema.post.createdAt));

  return Response.json(posts);
}

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const body = await req.json();
  const now = Date.now();

  try {
    const result = await db.insert(schema.post).values({
      title: body.title,
      slug: body.slug,
      body: body.body || "",
      excerpt: body.excerpt || "",
      tags: JSON.stringify(body.tags || []),
      coverImage: body.coverImage || "",
      publishedAt: body.publishedAt || now,
      createdAt: now,
      updatedAt: now,
    });

    const id = Number(result.lastInsertRowid);
    syncEmbedding("post", id);

    return Response.json(
      { id },
      { status: 201 }
    );
  } catch (e: any) {
    if (e.message?.includes("UNIQUE constraint")) {
      return Response.json({ error: "Slug already taken" }, { status: 409 });
    }
    throw e;
  }
}

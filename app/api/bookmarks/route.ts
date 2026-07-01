import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const categorySlug = url.searchParams.get("category");
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  let query = db.select().from(schema.bookmark).orderBy(desc(schema.bookmark.createdAt)).limit(limit).offset(offset).$dynamic();

  if (categorySlug) {
    const cat = await db.select().from(schema.category).where(eq(schema.category.slug, categorySlug)).get();
    if (cat) {
      query = query.where(eq(schema.bookmark.categoryId, cat.id));
    }
  }

  const bookmarks = await query;
  return Response.json(
    bookmarks.map((b) => ({
      ...b,
      tags: JSON.parse(b.tags),
      favicon: b.favicon || `https://www.google.com/s2/favicons?domain=${new URL(b.url).hostname}&sz=64`,
    }))
  );
}

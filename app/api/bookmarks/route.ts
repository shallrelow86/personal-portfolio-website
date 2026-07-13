import { db, schema } from "@/lib/db";
import { desc, eq } from "drizzle-orm";
import { parseJsonArray } from "@/lib/json";

function safeHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

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
    bookmarks.map((b) => {
      const host = safeHostname(b.url);
      return {
        ...b,
        tags: parseJsonArray(b.tags),
        favicon: b.favicon || (host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : ""),
      };
    })
  );
}

import { db, schema } from "@/lib/db";
import { asc } from "drizzle-orm";

export async function GET() {
  const cats = await db.select().from(schema.category).orderBy(asc(schema.category.sortOrder));
  const map = new Map<number, any>();
  const roots: any[] = [];
  for (const c of cats) {
    const node = { ...c, children: [] };
    map.set(c.id, node);
  }
  for (const c of cats) {
    const node = map.get(c.id);
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId).children.push(node);
    } else if (!c.parentId) {
      roots.push(node);
    }
  }
  return Response.json(roots);
}

import { db, schema } from "./db";
import { asc } from "drizzle-orm";

export type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
  children: CategoryNode[];
};

let cache: CategoryNode[] | null = null;
let flatCache: Map<number, { id: number; name: string; parentId: number | null }> | null = null;

export function invalidateCategoryCache() {
  cache = null;
  flatCache = null;
}

async function loadFlatCategories() {
  if (flatCache) return flatCache;
  const cats = await db.select().from(schema.category).orderBy(asc(schema.category.sortOrder));
  flatCache = new Map(cats.map((c) => [c.id, { id: c.id, name: c.name, parentId: c.parentId }]));
  return flatCache;
}

export async function getCategoryPath(categoryId: number | null | undefined): Promise<string> {
  if (!categoryId) return "";
  const map = await loadFlatCategories();
  const parts: string[] = [];
  let cur = map.get(categoryId);
  const seen = new Set<number>();
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    parts.unshift(cur.name);
    cur = cur.parentId ? map.get(cur.parentId) : undefined;
  }
  return parts.join(" > ");
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
  if (cache) return cache;
  const cats = await db.select().from(schema.category).orderBy(asc(schema.category.sortOrder));
  flatCache = new Map(cats.map((c) => [c.id, { id: c.id, name: c.name, parentId: c.parentId }]));
  const map = new Map<number, CategoryNode>();
  const roots: CategoryNode[] = [];
  for (const c of cats) {
    map.set(c.id, { ...c, children: [] });
  }
  for (const c of cats) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.children.push(node);
    } else if (!c.parentId) {
      roots.push(node);
    }
  }
  cache = roots;
  return roots;
}

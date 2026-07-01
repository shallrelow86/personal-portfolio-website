import { Metadata } from "next";
import Header from "@/components/Header";
import { db, schema } from "@/lib/db";
import { desc, asc, eq } from "drizzle-orm";
import Link from "next/link";

export const metadata: Metadata = { title: "Bookmarks" };
export const dynamic = "force-dynamic";

type Category = { id: number; name: string; slug: string; parentId: number | null; children?: Category[] };

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;

  const [allBookmarks, catRows] = await Promise.all([
    db.select().from(schema.bookmark).orderBy(desc(schema.bookmark.createdAt)),
    db.select().from(schema.category).orderBy(asc(schema.category.sortOrder)),
  ]);

  let bookmarks = allBookmarks;
  if (categorySlug) {
    const cat = catRows.find((c) => c.slug === categorySlug);
    if (cat) {
      const childIds = collectChildIds(catRows, cat.id);
      const allowed = new Set([cat.id, ...childIds]);
      bookmarks = allBookmarks.filter((b) => b.categoryId && allowed.has(b.categoryId));
    }
  }

  const map = new Map<number, Category>();
  const tree: Category[] = [];
  for (const c of catRows) map.set(c.id, { ...c, children: [] });
  for (const c of catRows) {
    const node = map.get(c.id)!;
    if (c.parentId && map.has(c.parentId)) map.get(c.parentId)!.children!.push(node);
    else tree.push(node);
  }

  const renderCat = (node: Category, depth: number): React.ReactNode => (
    <div key={node.id} style={{ marginLeft: depth * 12 }}>
      <Link
        href={`/bookmarks?category=${node.slug}`}
        className={`block py-1 text-sm hover:text-accent ${categorySlug === node.slug ? "text-accent font-medium" : "text-text-secondary"}`}
      >
        {node.name}
      </Link>
      {node.children?.map((c) => renderCat(c, depth + 1))}
    </div>
  );

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-16 flex gap-10">
        <aside className="w-48 flex-shrink-0">
          <h3 className="font-mono text-xs uppercase tracking-wider text-text-muted mb-4">Categories</h3>
          <Link
            href="/bookmarks"
            className={`block py-1 text-sm hover:text-accent ${!categorySlug ? "text-accent font-medium" : "text-text-secondary"}`}
          >
            All
          </Link>
          {tree.map((n) => renderCat(n, 0))}
        </aside>
        <div className="flex-1">
          <h1 className="font-display text-4xl mb-10">Bookmarks</h1>
          {bookmarks.length === 0 ? (
            <p className="font-mono text-sm text-text-muted text-center py-24">暂无收藏</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {bookmarks.map((b) => {
                const tags: string[] = JSON.parse(b.tags);
                const favicon = b.favicon || `https://www.google.com/s2/favicons?domain=${safeHostname(b.url)}&sz=64`;
                return (
                  <a
                    key={b.id}
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block border-2 border-border bg-surface p-5 hover:border-accent transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <img src={favicon} alt="" width={20} height={20} className="mt-1 flex-shrink-0" />
                      <h3 className="font-display text-lg leading-tight">{b.title}</h3>
                    </div>
                    {b.description && (
                      <p className="text-sm text-text-secondary mb-3">{b.description}</p>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((t) => (
                          <span key={t} className="brutal-tag">{t}</span>
                        ))}
                      </div>
                    )}
                    {b.reason && (
                      <p className="text-xs text-text-muted font-mono line-clamp-3">{b.reason}</p>
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function collectChildIds(cats: { id: number; parentId: number | null }[], parentId: number): number[] {
  const direct = cats.filter((c) => c.parentId === parentId).map((c) => c.id);
  return direct.concat(...direct.map((id) => collectChildIds(cats, id)));
}

function safeHostname(url: string): string {
  try { return new URL(url).hostname; } catch { return ""; }
}

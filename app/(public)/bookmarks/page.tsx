import { Metadata } from "next";
import Image from "next/image";
import { db, schema } from "@/lib/db";
import { desc, asc } from "drizzle-orm";
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
        className={`block py-1.5 text-sm font-mono text-[0.75rem] uppercase tracking-wider hover:text-accent ${categorySlug === node.slug ? "text-accent" : "text-text-secondary"}`}
      >
        {node.name}
      </Link>
      {node.children?.map((c) => renderCat(c, depth + 1))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <p className="eyebrow mb-4">Reading List</p>
      <h1 className="font-display text-4xl md:text-5xl italic mb-12">Bookmarks</h1>
      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-44 shrink-0">
          <h3 className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-text-muted mb-4">分类</h3>
          <Link
            href="/bookmarks"
            className={`block py-1.5 text-sm font-mono text-[0.75rem] uppercase tracking-wider hover:text-accent ${!categorySlug ? "text-accent" : "text-text-secondary"}`}
          >
            全部
          </Link>
          {tree.map((n) => renderCat(n, 0))}
        </aside>
        <div className="flex-1">
          {bookmarks.length === 0 ? (
            <p className="font-mono text-sm text-text-muted text-center py-24">暂无收藏</p>
          ) : (
            <div className="ink-grid grid-cols-1 md:grid-cols-2">
              {bookmarks.map((b) => {
                const tags: string[] = JSON.parse(b.tags);
                const favicon = b.favicon || `https://www.google.com/s2/favicons?domain=${safeHostname(b.url)}&sz=64`;
                return (
                  <a
                    key={b.id}
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-6 md:p-8 hover:bg-surface-2/60 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <Image
                        src={favicon}
                        alt=""
                        width={20}
                        height={20}
                        unoptimized
                        className="mt-1 shrink-0"
                      />
                      <h3 className="font-display text-lg italic group-hover:text-accent transition-colors leading-tight">
                        {b.title}
                      </h3>
                    </div>
                    {b.description && (
                      <p className="text-sm text-text-secondary mb-3 leading-relaxed">{b.description}</p>
                    )}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {tags.map((t) => (
                          <span key={t} className="ink-pill">{t}</span>
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
    </div>
  );
}

function collectChildIds(cats: { id: number; parentId: number | null }[], parentId: number): number[] {
  const direct = cats.filter((c) => c.parentId === parentId).map((c) => c.id);
  return direct.concat(...direct.map((id) => collectChildIds(cats, id)));
}

function safeHostname(url: string): string {
  try { return new URL(url).hostname; } catch { return ""; }
}

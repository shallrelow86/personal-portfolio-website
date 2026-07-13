import { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { db, schema } from "@/lib/db";
import { desc, asc } from "drizzle-orm";
import { publishedPostFilter } from "@/lib/posts";
import { parseJsonArray } from "@/lib/json";
import Link from "next/link";
import type { Post } from "@/lib/api";

export const metadata: Metadata = { title: "Blog" };
export const dynamic = "force-dynamic";

type Category = { id: number; name: string; slug: string; parentId: number | null; children?: Category[] };

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;

  const [postRows, catRows] = await Promise.all([
    db.select({
      id: schema.post.id, title: schema.post.title, slug: schema.post.slug,
      excerpt: schema.post.excerpt, tags: schema.post.tags,
      coverImage: schema.post.coverImage, publishedAt: schema.post.publishedAt,
      categoryId: schema.post.categoryId,
    }).from(schema.post).where(publishedPostFilter).orderBy(desc(schema.post.publishedAt)),
    db.select().from(schema.category).orderBy(asc(schema.category.sortOrder)),
  ]);

  let filtered = postRows;
  if (categorySlug) {
    const cat = catRows.find((c) => c.slug === categorySlug);
    if (cat) {
      const childIds = collectChildIds(catRows, cat.id);
      const allowed = new Set([cat.id, ...childIds]);
      filtered = postRows.filter((p) => p.categoryId && allowed.has(p.categoryId));
    }
  }

  const posts: Post[] = filtered.map((p) => ({ ...p, tags: parseJsonArray(p.tags) }));

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
        href={`/blog?category=${node.slug}`}
        className={`block py-1.5 text-sm font-mono text-[0.75rem] uppercase tracking-wider hover:text-accent ${categorySlug === node.slug ? "text-accent" : "text-text-secondary"}`}
      >
        {node.name}
      </Link>
      {node.children?.map((c) => renderCat(c, depth + 1))}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <p className="eyebrow mb-4">Writing</p>
      <h1 className="font-display text-4xl md:text-5xl italic mb-12">Blog</h1>
      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-44 shrink-0">
          <h3 className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-text-muted mb-4">分类</h3>
          <Link
            href="/blog"
            className={`block py-1.5 text-sm font-mono text-[0.75rem] uppercase tracking-wider hover:text-accent ${!categorySlug ? "text-accent" : "text-text-secondary"}`}
          >
            全部
          </Link>
          {tree.map((n) => renderCat(n, 0))}
        </aside>
        <div className="flex-1">
          {posts.length === 0 ? (
            <p className="font-mono text-sm text-text-muted text-center py-24">暂无文章</p>
          ) : (
            <div className="ink-grid grid-cols-1 md:grid-cols-2">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
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

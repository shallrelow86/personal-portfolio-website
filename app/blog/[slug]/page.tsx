import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Markdown from "@/components/Markdown";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import type { PostDetail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await db.select().from(schema.post).where(eq(schema.post.slug, slug)).get();
  if (!post) return { title: "Not Found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await db.select().from(schema.post).where(eq(schema.post.slug, slug)).get();
  if (!post) notFound();

  const tags: string[] = JSON.parse(post.tags);
  let category: { name: string; slug: string } | null = null;
  if (post.categoryId) {
    const cat = await db.select().from(schema.category).where(eq(schema.category.id, post.categoryId)).get();
    if (cat) category = { name: cat.name, slug: cat.slug };
  }

  return (
    <>
      <Header />
      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/blog" className="font-mono text-xs uppercase tracking-wider text-text-muted hover:text-accent transition-colors">
          ← Blog
        </Link>
        {category && (
          <Link
            href={`/blog?category=${category.slug}`}
            className="font-mono text-xs uppercase tracking-wider text-text-secondary hover:text-accent transition-colors ml-2"
          >
            / {category.name}
          </Link>
        )}
        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} className="w-full h-56 object-cover border-2 border-border mt-8 mb-8" />
        )}
        <h1 className="font-display text-4xl md:text-5xl">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 mt-4 font-mono text-xs text-text-muted">
          <time>{new Date(post.publishedAt).toLocaleDateString("zh-CN")}</time>
          {tags.map((tag) => (
            <span key={tag} className="brutal-tag">{tag}</span>
          ))}
        </div>
        <div className="mt-10">
          <Markdown content={post.body} />
        </div>
      </article>
    </>
  );
}

import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Markdown from "@/components/Markdown";
import { db, schema } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { publishedPostFilter } from "@/lib/posts";
import { parseJsonArray } from "@/lib/json";

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
  const post = await db.select().from(schema.post).where(and(eq(schema.post.slug, slug), publishedPostFilter)).get();
  if (!post) return { title: "Not Found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await db.select().from(schema.post).where(and(eq(schema.post.slug, slug), publishedPostFilter)).get();
  if (!post) notFound();

  const tags: string[] = parseJsonArray(post.tags);
  let category: { name: string; slug: string } | null = null;
  if (post.categoryId) {
    const cat = await db.select().from(schema.category).where(eq(schema.category.id, post.categoryId)).get();
    if (cat) category = { name: cat.name, slug: cat.slug };
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <nav className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-text-muted mb-10">
        <Link href="/blog" className="hover:text-accent transition-colors">← Blog</Link>
        {category && (
          <>
            <span className="mx-2">/</span>
            <Link href={`/blog?category=${category.slug}`} className="hover:text-accent transition-colors">
              {category.name}
            </Link>
          </>
        )}
      </nav>
      {post.coverImage && (
        <Image
          src={post.coverImage}
          alt={post.title}
          width={768}
          height={224}
          className="w-full aspect-[21/9] object-cover rounded-xl mb-10"
        />
      )}
      <h1 className="font-display text-4xl md:text-5xl lg:text-6xl italic leading-tight">{post.title}</h1>
      <div className="flex flex-wrap items-center gap-4 mt-6">
        <time className="font-mono text-[0.75rem] uppercase tracking-[0.1em] text-text-muted">
          {new Date(post.publishedAt).toLocaleDateString("zh-CN")}
        </time>
        {tags.map((tag) => (
          <span key={tag} className="ink-pill">{tag}</span>
        ))}
      </div>
      <div className="mt-12 pt-8 border-t border-border">
        <Markdown content={post.body} />
      </div>
    </article>
  );
}

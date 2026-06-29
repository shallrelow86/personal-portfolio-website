import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Markdown from "@/components/Markdown";
import { fetchApi, type PostDetail } from "@/lib/api";

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
  const post = await fetchApi<PostDetail>(`/api/posts/${slug}`);
  if (!post) return { title: "Not Found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetchApi<PostDetail>(`/api/posts/${slug}`);
  if (!post) notFound();

  return (
    <>
      <Header />
      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/blog" className="font-mono text-xs uppercase tracking-wider text-text-muted hover:text-accent transition-colors">
          ← Blog
        </Link>
        {post.coverImage && (
          <img src={post.coverImage} alt={post.title} className="w-full h-56 object-cover border-2 border-border mt-8 mb-8" />
        )}
        <h1 className="font-display text-4xl md:text-5xl">{post.title}</h1>
        <div className="flex flex-wrap items-center gap-4 mt-4 font-mono text-xs text-text-muted">
          <time>{new Date(post.publishedAt).toLocaleDateString("zh-CN")}</time>
          {post.tags.map((tag) => (
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

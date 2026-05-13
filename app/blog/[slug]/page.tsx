import { Metadata } from "next";
import { notFound } from "next/navigation";
import { client, urlForImage } from "@/sanity/lib/client";
import {
  POST_BY_SLUG_QUERY,
  COMMENTS_BY_POST_QUERY,
  ALL_POST_SLUGS_QUERY,
} from "@/sanity/lib/queries";
import { PortableText } from "@portabletext/react";
import CommentForm from "@/components/CommentForm";
import CommentList from "@/components/CommentList";
import RevealContent from "@/components/RevealContent";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await client.fetch(ALL_POST_SLUGS_QUERY).catch(() => []);
  return slugs.map((slug: string) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug }).catch(() => null);
  if (!post) return { title: "Not Found" };
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug }).catch(() => null);
  if (!post) notFound();

  const comments = await client
    .fetch(COMMENTS_BY_POST_QUERY, { postId: post._id })
    .catch(() => []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      {post.coverImage && (
        <RevealContent>
          <img
            src={urlForImage(post.coverImage).width(1200).height(500).url()}
            alt={post.title}
            className="w-full h-56 md:h-72 object-cover rounded-xl mb-10 ring-1 ring-border"
          />
        </RevealContent>
      )}

      <RevealContent delay={0.05}>
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{post.title}</h1>
      </RevealContent>

      <RevealContent delay={0.1}>
        <div className="flex items-center gap-4 text-sm text-text-muted mb-10">
          {post.publishedAt && (
            <time>{new Date(post.publishedAt).toLocaleDateString("zh-CN")}</time>
          )}
          {post.tags?.length > 0 && (
            <div className="flex gap-2">
              {post.tags.map((tag: string) => (
                <span key={tag} className="text-accent-start">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </RevealContent>

      {post.body && (
        <RevealContent delay={0.15}>
          <article
            className="prose prose-invert max-w-none mb-16 text-text-secondary leading-relaxed
              [&_h2]:text-text-primary [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-12 [&_h2]:mb-4
              [&_h3]:text-text-primary [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3
              [&_p]:mb-5 [&_strong]:text-text-primary
              [&_a]:text-accent-start [&_a]:no-underline hover:[&_a]:underline
              [&_pre]:bg-surface [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:p-5
              [&_code]:text-accent-start [&_code]:text-sm
              [&_ul]:pl-5 [&_ul]:list-disc [&_li]:mb-1
              [&_blockquote]:border-l-2 [&_blockquote]:border-accent-start/30 [&_blockquote]:pl-4
            "
          >
            <PortableText value={post.body} />
          </article>
        </RevealContent>
      )}

      <RevealContent delay={0.2}>
        <hr className="border-border mb-10" />
      </RevealContent>

      <RevealContent delay={0.25}>
        <section>
          <h2 className="text-xl font-bold mb-6">
            评论 ({comments.length})
          </h2>
          <CommentList comments={comments} />
          <CommentForm postId={post._id} />
        </section>
      </RevealContent>
    </div>
  );
}

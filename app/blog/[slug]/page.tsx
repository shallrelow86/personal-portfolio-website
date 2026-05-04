import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { client, urlForImage } from '@/sanity/lib/client';
import { POST_BY_SLUG_QUERY, COMMENTS_BY_POST_QUERY, ALL_POST_SLUGS_QUERY } from '@/sanity/lib/queries';
import { PortableText } from '@portabletext/react';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';

export async function generateStaticParams() {
  const slugs = await client.fetch(ALL_POST_SLUGS_QUERY).catch(() => []);
  return slugs.map((slug: string) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug }).catch(() => null);
  if (!post) return { title: 'Not Found' };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug }).catch(() => null);

  if (!post) notFound();

  const comments = await client
    .fetch(COMMENTS_BY_POST_QUERY, { postId: post._id })
    .catch(() => []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 animate-slide-up">
      {post.coverImage && (
        <img
          src={urlForImage(post.coverImage).width(1200).height(400).url()}
          alt={post.title}
          className="w-full h-56 md:h-72 object-cover border border-border mb-12"
        />
      )}

      <p className="font-mono text-xs text-muted tracking-[0.2em] uppercase mb-4">
        Blog Post
      </p>
      <h1 className="font-mono text-4xl md:text-5xl font-bold text-foreground mb-4">
        {post.title}
      </h1>

      <div className="flex items-center gap-6 mb-12">
        {post.publishedAt && (
          <time className="font-mono text-sm text-muted">
            {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
          </time>
        )}
        {post.tags?.length > 0 && (
          <div className="flex gap-3">
            {post.tags.map((tag: string) => (
              <span key={tag} className="font-mono text-xs text-primary">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {post.body && (
        <article className="prose prose-invert max-w-none mb-20
          text-muted leading-relaxed
          [&_h2]:font-mono [&_h2]:text-foreground [&_h2]:text-2xl [&_h2]:mt-12 [&_h2]:mb-6
          [&_h3]:font-mono [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:mt-8 [&_h3]:mb-4
          [&_p]:mb-5 [&_strong]:text-foreground [&_strong]:font-bold
          [&_a]:font-mono [&_a]:text-primary [&_a]:no-underline
          [&_code]:font-mono [&_code]:text-primary [&_code]:text-sm
          [&_pre]:bg-surface-alt [&_pre]:border [&_pre]:border-border [&_pre]:p-4 [&_pre]:text-sm
          [&_blockquote]:border-l-2 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:text-muted
          [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1
        ">
          <PortableText value={post.body} />
        </article>
      )}

      <hr className="border-border mb-12" />

      <section>
        <h2 className="font-mono text-lg font-bold text-foreground mb-8">
          Comments ({comments.length})
        </h2>
        <CommentList comments={comments} />
        <CommentForm postId={post._id} />
      </section>
    </div>
  );
}

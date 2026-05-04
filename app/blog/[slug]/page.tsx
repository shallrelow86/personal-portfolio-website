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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug: params.slug }).catch(() => null);
  if (!post) return { title: 'Not Found' };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug: params.slug }).catch(() => null);

  if (!post) notFound();

  const comments = await client
    .fetch(COMMENTS_BY_POST_QUERY, { postId: post._id })
    .catch(() => []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {post.coverImage && (
        <img
          src={urlForImage(post.coverImage).width(1200).height(400).url()}
          alt={post.title}
          className="w-full h-64 object-cover rounded-lg mb-8"
        />
      )}

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
        {post.publishedAt && (
          <time>{new Date(post.publishedAt).toLocaleDateString('zh-CN')}</time>
        )}
        {post.tags?.length > 0 && (
          <div className="flex gap-1">
            {post.tags.map((tag: string) => (
              <span key={tag} className="bg-gray-100 px-2 py-0.5 rounded text-xs">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {post.body && (
        <article className="prose max-w-none mb-12">
          <PortableText value={post.body} />
        </article>
      )}

      <section>
        <h2 className="text-xl font-bold mb-4">评论</h2>
        <CommentList comments={comments} />
        <CommentForm postId={post._id} />
      </section>
    </div>
  );
}

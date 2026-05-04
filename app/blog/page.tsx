import { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { ALL_POSTS_QUERY } from '@/sanity/lib/queries';
import PostCard from '@/components/PostCard';

export const metadata: Metadata = {
  title: 'Blog',
};

export default async function BlogPage() {
  const posts = await client.fetch(ALL_POSTS_QUERY).catch(() => []);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 animate-in">
      <h1 className="text-3xl font-bold mb-10">博客</h1>

      {posts.length === 0 ? (
        <div className="py-24 text-center text-muted">暂无文章，请在 /admin 中撰写</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {posts.map((post: any) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

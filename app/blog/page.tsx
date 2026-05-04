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
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      <h1 className="text-3xl font-bold mb-8 font-mono">
        <span className="text-accent mr-2">&gt;</span>
        Blog
      </h1>

      {posts.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-mono text-muted text-lg">
            <span className="text-primary">$</span> cat /dev/posts
          </p>
          <p className="text-muted text-sm mt-2">No posts yet. Write one in /admin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post: any) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

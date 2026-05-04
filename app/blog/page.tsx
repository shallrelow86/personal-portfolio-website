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
    <div className="max-w-6xl mx-auto px-6 py-16 animate-slide-up">
      <p className="font-mono text-xs text-muted tracking-[0.2em] uppercase mb-4">
        Writing
      </p>
      <h1 className="font-mono text-4xl font-bold text-foreground mb-10">
        Blog
      </h1>

      {posts.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-mono text-muted">
            no posts yet <span className="text-border">—</span> write one in <span className="text-primary">/admin</span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          {posts.map((post: any) => (
            <div key={post._id} className="bg-surface">
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

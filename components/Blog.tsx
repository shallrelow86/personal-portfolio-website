import Link from "next/link";
import type { Post } from "@/lib/api";

export default function Blog({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl mb-8">Blog</h2>
        <div className="space-y-0">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 py-5 border-b-2 border-border hover:bg-surface/50 transition-colors group"
            >
              <time className="font-mono text-xs text-text-muted shrink-0">
                {new Date(post.publishedAt).toLocaleDateString("zh-CN")}
              </time>
              <span className="font-display text-lg group-hover:text-accent transition-colors flex-1">{post.title}</span>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="brutal-tag">{tag}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

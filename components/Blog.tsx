import Link from "next/link";
import SectionShell from "@/components/SectionShell";
import type { Post } from "@/lib/api";

export default function Blog({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <SectionShell index="02" eyebrow="Writing" title="Blog">
      <ul className="timeline-list space-y-0">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8 py-6 border-b border-border last:border-0 hover:bg-surface/50 -mx-4 px-4 rounded-lg transition-colors"
            >
              <div className="sm:w-20 shrink-0 flex sm:flex-col items-center sm:items-end gap-2 sm:pt-1">
                <time className="font-mono text-[0.75rem] uppercase tracking-[0.1em] text-text-muted sm:text-right">
                  {new Date(post.publishedAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                </time>
                <span className="hidden sm:block w-2 h-2 rounded-full bg-border group-hover:bg-accent transition-colors relative z-10" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-xl md:text-2xl italic group-hover:text-accent transition-colors mb-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm md:text-base text-text-secondary line-clamp-2 mb-3">{post.excerpt}</p>
                )}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="ink-pill">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

import Link from "next/link";
import ScreenHeader from "@/components/ScreenHeader";
import type { Post } from "@/lib/api";

export default function BlogScreen({ posts }: { posts: Post[] }) {
  const list = posts.slice(0, 5);

  return (
    <section className="h-full bg-bg overflow-y-auto border-t border-border/60">
      <div className="h-full flex flex-col justify-center px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto w-full">
          <ScreenHeader index="02" eyebrow="Writing" title="Blog" href="/blog" />
          {list.length === 0 ? (
            <p className="font-mono text-sm text-text-muted">暂无文章</p>
          ) : (
            <ul className="timeline-list space-y-0">
              {list.map((post) => (
                <li key={post.id}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-8 py-4 border-b border-border last:border-0 hover:bg-surface/80 -mx-4 px-4 rounded-[var(--radius-sm)] transition-colors"
                  >
                    <div className="sm:w-20 shrink-0 flex sm:flex-col items-center sm:items-end gap-2 sm:pt-1">
                      <time className="font-mono text-[0.75rem] uppercase tracking-[0.1em] text-text-muted sm:text-right">
                        {new Date(post.publishedAt).toLocaleDateString("zh-CN", {
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                      <span className="hidden sm:block w-2 h-2 rounded-full bg-border group-hover:bg-accent transition-colors relative z-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-xl md:text-2xl italic tracking-tight group-hover:text-accent transition-colors mb-1">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm md:text-base text-text-secondary line-clamp-2 leading-relaxed">{post.excerpt}</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/api";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="p-6 md:p-8 h-full transition-colors group-hover:bg-surface-2/60">
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.title}
            width={400}
            height={176}
            className="w-full aspect-[2/1] object-cover rounded-lg mb-5"
          />
        )}
        <time className="font-mono text-[0.75rem] uppercase tracking-[0.1em] text-text-muted">
          {new Date(post.publishedAt).toLocaleDateString("zh-CN")}
        </time>
        <h3 className="font-display text-xl md:text-2xl italic mt-2 group-hover:text-accent transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm md:text-base text-text-secondary mt-3 line-clamp-2 leading-relaxed">{post.excerpt}</p>
        )}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag) => (
              <span key={tag} className="ink-pill">{tag}</span>
            ))}
          </div>
        )}
      </article>
    </Link>
  );
}

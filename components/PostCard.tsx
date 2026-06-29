import Link from "next/link";
import type { Post } from "@/lib/api";

export default function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block border-2 border-border bg-surface p-5 hover:border-accent transition-colors group">
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="w-full h-44 object-cover border-2 border-border mb-4" />
      )}
      <time className="font-mono text-xs text-text-muted">
        {new Date(post.publishedAt).toLocaleDateString("zh-CN")}
      </time>
      <h3 className="font-display text-xl mt-2 group-hover:text-accent transition-colors">{post.title}</h3>
      {post.excerpt && <p className="text-sm text-text-secondary mt-2 line-clamp-2">{post.excerpt}</p>}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag) => (
            <span key={tag} className="brutal-tag">{tag}</span>
          ))}
        </div>
      )}
    </Link>
  );
}

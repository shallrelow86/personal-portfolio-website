import Link from 'next/link';
import { urlForImage } from '@/sanity/lib/client';

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    slug: { current: string };
    coverImage?: any;
    excerpt?: string;
    tags?: string[];
    publishedAt?: string;
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="group block border border-border bg-surface-alt hover:border-primary/40 transition-all duration-300"
    >
      {post.coverImage && (
        <div className="overflow-hidden">
          <img
            src={urlForImage(post.coverImage).width(600).height(300).url()}
            alt={post.title}
            className="w-full h-40 object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
      )}
      <div className="p-5">
        {post.publishedAt && (
          <time className="text-xs font-mono text-muted tracking-wide uppercase block mb-2">
            {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
          </time>
        )}
        <h3 className="font-mono font-bold text-base mb-2 text-foreground group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}

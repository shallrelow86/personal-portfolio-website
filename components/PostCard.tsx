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
      className="group block border border-border rounded-lg overflow-hidden bg-surface-alt hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
    >
      {post.coverImage && (
        <img
          src={urlForImage(post.coverImage).width(600).height(300).url()}
          alt={post.title}
          className="w-full h-36 object-cover"
        />
      )}
      <div className="p-4">
        {post.publishedAt && (
          <time className="text-xs text-muted">
            {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
          </time>
        )}
        <h3 className="font-semibold text-lg mt-1 mb-1 text-foreground group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-muted line-clamp-2">{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}

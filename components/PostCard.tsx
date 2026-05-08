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
      className="group block bg-surface border border-border rounded-lg overflow-hidden hover:border-accent-start/30 transition-all duration-300 hover:shadow-lg hover:shadow-[0_0_30px_rgba(124,58,237,0.08)]"
    >
      {post.coverImage && (
        <img
          src={urlForImage(post.coverImage).width(600).height(340).url()}
          alt={post.title}
          className="w-full h-44 object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
      )}
      <div className="p-5">
        {post.publishedAt && (
          <time className="text-xs text-text-muted mb-2 block">
            {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
          </time>
        )}
        <h3 className="font-semibold text-lg mb-2 group-hover:text-accent-start transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-text-muted leading-relaxed line-clamp-2">{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}

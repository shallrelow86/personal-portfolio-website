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
      className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
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
          <time className="text-xs text-gray-400">
            {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
          </time>
        )}
        <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
        {post.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}

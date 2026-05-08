"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { urlForImage } from "@/sanity/lib/client";

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  coverImage?: any;
  excerpt?: string;
  tags?: string[];
  publishedAt?: string;
}

export default function PostCardList({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-4">
      {posts.map((post, i) => (
        <motion.div
          key={post._id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <Link
            href={`/blog/${post.slug.current}`}
            className="group flex items-center gap-6 bg-surface border border-border rounded-lg p-5 hover:border-accent-start/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(124,58,237,0.06)]"
          >
            {post.coverImage && (
              <img
                src={urlForImage(post.coverImage).width(160).height(100).url()}
                alt={post.title}
                className="w-40 h-24 object-cover rounded-md flex-shrink-0 hidden sm:block group-hover:scale-[1.02] transition-transform duration-500"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 mb-1">
                {post.publishedAt && (
                  <time className="text-xs text-text-muted font-mono">
                    {new Date(post.publishedAt).toLocaleDateString("zh-CN")}
                  </time>
                )}
                {post.tags?.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs text-accent-start font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
              <h3 className="font-semibold text-text-primary group-hover:text-accent-start transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="text-sm text-text-secondary line-clamp-1 mt-1">
                  {post.excerpt}
                </p>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

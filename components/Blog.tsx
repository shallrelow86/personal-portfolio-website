"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  publishedAt?: string;
}

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  whileInView: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Blog({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;

  return (
    <section
      id="blog"
      className="min-h-screen snap-start flex items-center px-6 py-24"
    >
      <div className="max-w-3xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-4xl lg:text-6xl font-bold"
        >
          Latest Posts
        </motion.h2>

        <div className="mt-16">
          {posts.map((post, i) => (
            <motion.div
              key={post._id}
              variants={itemVariants}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={`/blog/${post.slug.current}`}
                className="group flex items-center justify-between py-6 border-b border-border hover:bg-white/[0.02] transition-colors duration-300 px-4 rounded-lg"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  {post.publishedAt && (
                    <span className="text-sm text-text-muted font-mono">
                      {new Date(post.publishedAt).toLocaleDateString("zh-CN")}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-accent-start transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-text-secondary line-clamp-1">
                      {post.excerpt}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-5 h-5 flex-shrink-0 ml-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <Link
            href="/blog"
            className="mt-8 inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            查看全部文章 <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

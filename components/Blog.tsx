"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";

const posts = [
  {
    date: "2026-04-15",
    title: "Building a Type-Safe API Layer with tRPC",
    excerpt: "How we replaced REST endpoints with end-to-end type safety across the stack.",
  },
  {
    date: "2026-03-28",
    title: "The Case for CSS-First Design Systems",
    excerpt: "Why Tailwind v4's CSS-first config is a paradigm shift for component libraries.",
  },
  {
    date: "2026-03-10",
    title: "Optimizing React Re-Renders in 2026",
    excerpt: "A deep dive into React Compiler, useMemo, and when to let the compiler do the work.",
  },
  {
    date: "2026-02-20",
    title: "Designing Motion-First User Interfaces",
    excerpt: "Principles for using animation to guide attention and create delight without distraction.",
  },
  {
    date: "2026-01-05",
    title: "A Year of Building with Next.js App Router",
    excerpt: "Lessons learned from migrating a large codebase to RSC and streaming SSR.",
  },
];

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  whileInView: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Blog() {
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
              key={post.title}
              variants={itemVariants}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                ...itemVariants.whileInView.transition,
                delay: i * 0.08,
              }}
              className="group flex items-center justify-between py-6 border-b border-border hover:bg-white/[0.02] transition-colors duration-300 px-4 rounded-lg cursor-pointer"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm text-text-muted font-mono">
                  {post.date}
                </span>
                <h3 className="text-lg font-semibold text-text-primary group-hover:text-white transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-text-secondary line-clamp-1">
                  {post.excerpt}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 ml-4" />
            </motion.div>
          ))}
        </div>

        <motion.a
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          viewport={{ once: true }}
          href="#"
          className="mt-8 inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          查看全部文章 <ArrowRight className="w-4 h-4" />
        </motion.a>
      </div>
    </section>
  );
}

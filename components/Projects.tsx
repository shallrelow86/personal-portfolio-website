"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { urlForImage } from "@/sanity/lib/client";

interface Project {
  _id: string;
  title: string;
  slug: { current: string };
  coverImage?: any;
  description?: string;
  techStack?: string[];
  githubUrl?: string;
  liveUrl?: string;
}

const cardVariants = {
  initial: { opacity: 0, y: 40 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Projects({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section
      id="projects"
      className="min-h-screen snap-start flex items-center px-6 py-24"
    >
      <div className="max-w-6xl mx-auto w-full">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
          viewport={{ once: true, amount: 0.3 }}
          className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-accent-start to-accent-end bg-clip-text text-transparent"
        >
          Selected Projects
        </motion.h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {projects.map((p, i) => {
            const isLarge = i === 0 && projects.length >= 3;
            return (
              <motion.div
                key={p._id}
                variants={cardVariants}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl bg-surface/50 backdrop-blur-xl border border-border p-6 lg:p-8 hover:border-accent-start/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] hover:-translate-y-1 ${
                  isLarge ? "md:col-span-2" : ""
                }`}
              >
                {p.coverImage ? (
                  <div className="rounded-xl overflow-hidden">
                    <img
                      src={urlForImage(p.coverImage).width(1200).height(600).url()}
                      alt={p.title}
                      className="w-full aspect-video object-cover group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl overflow-hidden bg-background border border-border">
                    <div className="aspect-video bg-gradient-to-br from-surface to-background flex items-center justify-center text-text-muted text-sm font-mono">
                      <span className="opacity-30">preview</span>
                    </div>
                  </div>
                )}

                <div className="mt-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-semibold text-text-primary">
                      {p.title}
                    </h3>
                    <Link
                      href={`/projects/${p.slug.current}`}
                      className="p-1 -m-1 text-text-muted group-hover:text-text-primary transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                  {p.description && (
                    <p className="text-text-secondary text-sm mt-2 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                  {p.techStack && p.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {p.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs bg-background text-text-muted px-3 py-1 rounded-full border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

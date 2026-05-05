"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    title: "Design System",
    description: "A comprehensive component library with token-based theming and dark mode support.",
    tags: ["React", "TypeScript", "Tailwind", "Storybook"],
    large: true,
  },
  {
    title: "Analytics Dashboard",
    description: "Real-time data visualization with interactive charts and filtering.",
    tags: ["Next.js", "D3.js", "PostgreSQL", "Prisma"],
    large: false,
  },
  {
    title: "CLI Toolkit",
    description: "Developer productivity tools for scaffolding, linting, and deployment.",
    tags: ["Node.js", "TypeScript", "Commander", "ESBuild"],
    large: false,
  },
  {
    title: "API Platform",
    description: "RESTful API with automatic OpenAPI docs, rate limiting, and caching.",
    tags: ["Go", "Redis", "Docker", "Kubernetes"],
    large: false,
  },
];

const cardVariants = {
  initial: { opacity: 0, y: 40 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Projects() {
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
          {projects.map((p, i) => (
            <motion.div
              key={p.title}
              variants={cardVariants}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, amount: 0.2 }}
              transition={{ ...cardVariants.whileInView.transition, delay: i * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl bg-surface/50 backdrop-blur-xl border border-border p-6 lg:p-8 hover:border-accent-start/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] hover:-translate-y-1 ${
                p.large ? "md:col-span-2" : ""
              }`}
            >
              {/* Placeholder image */}
              <div className="rounded-xl overflow-hidden bg-background border border-border">
                <div className="aspect-video bg-gradient-to-br from-surface to-background flex items-center justify-center text-text-muted text-sm font-mono">
                  <span className="opacity-30">preview</span>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-semibold text-text-primary">
                    {p.title}
                  </h3>
                  <ArrowUpRight className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors flex-shrink-0" />
                </div>
                <p className="text-text-secondary text-sm mt-2 leading-relaxed">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-background text-text-muted px-3 py-1 rounded-full border border-border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

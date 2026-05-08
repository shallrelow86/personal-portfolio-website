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
}

export default function ProjectCardList({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {projects.map((project, i) => (
        <motion.div
          key={project._id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <Link
            href={`/projects/${project.slug.current}`}
            className="group block bg-surface border border-border rounded-lg overflow-hidden hover:border-accent-start/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(124,58,237,0.08)] hover:-translate-y-1"
          >
            {project.coverImage ? (
              <img
                src={urlForImage(project.coverImage).width(600).height(340).url()}
                alt={project.title}
                className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-surface to-background flex items-center justify-center">
                <span className="text-text-muted text-sm font-mono opacity-30">
                  preview
                </span>
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold text-lg group-hover:text-accent-start transition-colors">
                  {project.title}
                </h3>
                <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
              </div>
              {project.description && (
                <p className="text-sm text-text-secondary leading-relaxed line-clamp-2 mt-2">
                  {project.description}
                </p>
              )}
              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.techStack.slice(0, 5).map((tech) => (
                    <span
                      key={tech}
                      className="text-xs bg-background border border-border px-2 py-0.5 rounded text-text-muted"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

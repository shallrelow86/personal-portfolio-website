"use client";

import { useState } from "react";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/lib/api";

export default function ProjectCardList({ projects }: { projects: Project[] }) {
  const allTechs = [...new Set(projects.flatMap((p) => p.techStack))].sort();
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter
    ? projects.filter((p) => p.techStack.includes(filter))
    : projects;

  return (
    <>
      {allTechs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <button
            type="button"
            onClick={() => setFilter(null)}
            className={`ink-pill cursor-pointer transition-colors ${!filter ? "bg-ink text-white border-ink" : "hover:border-accent hover:text-accent"}`}
          >
            全部
          </button>
          {allTechs.map((tech) => (
            <button
              key={tech}
              type="button"
              onClick={() => setFilter(tech)}
              className={`ink-pill cursor-pointer transition-colors ${filter === tech ? "bg-accent text-white border-accent" : "hover:border-accent hover:text-accent"}`}
            >
              {tech}
            </button>
          ))}
        </div>
      )}
      <div className="ink-grid grid-cols-1 md:grid-cols-2">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </>
  );
}

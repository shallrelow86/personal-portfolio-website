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
            className={`brutal-tag cursor-pointer ${!filter ? "bg-accent text-bg border-accent" : "hover:border-accent"}`}
          >
            All
          </button>
          {allTechs.map((tech) => (
            <button
              key={tech}
              type="button"
              onClick={() => setFilter(tech)}
              className={`brutal-tag cursor-pointer ${filter === tech ? "bg-accent text-bg border-accent" : "hover:border-accent"}`}
            >
              {tech}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </>
  );
}

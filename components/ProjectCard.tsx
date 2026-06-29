import Link from "next/link";
import type { Project } from "@/lib/api";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="block border-2 border-border bg-surface hover:border-accent transition-colors group overflow-hidden">
      {project.coverImage ? (
        <img src={project.coverImage} alt={project.title} className="w-full h-48 object-cover border-b-2 border-border" />
      ) : (
        <div className="w-full h-48 bg-surface border-b-2 border-border flex items-center justify-center">
          <span className="font-mono text-xs text-text-muted opacity-40">preview</span>
        </div>
      )}
      <div className="p-5">
        <h3 className="font-display text-xl group-hover:text-accent transition-colors">{project.title}</h3>
        <p className="text-sm text-text-secondary mt-2 line-clamp-2">{project.description}</p>
        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {project.techStack.slice(0, 4).map((tech) => (
              <span key={tech} className="brutal-tag">{tech}</span>
            ))}
          </div>
        )}
        <div className="flex gap-4 mt-4 font-mono text-xs">
          {project.githubUrl && <span className="text-text-muted">GitHub</span>}
          {project.liveUrl && <span className="text-text-muted">Live</span>}
        </div>
      </div>
    </Link>
  );
}

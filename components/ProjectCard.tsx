import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/api";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.slug}`} className="group block">
      <article className="h-full transition-colors group-hover:bg-surface-2/60">
        {project.coverImage ? (
          <Image
            src={project.coverImage}
            alt={project.title}
            width={400}
            height={192}
            className="w-full aspect-[5/3] object-cover"
          />
        ) : (
          <div className="w-full aspect-[5/3] bg-surface-2 flex items-center justify-center">
            <span className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-text-muted opacity-50">preview</span>
          </div>
        )}
        <div className="p-6 md:p-8">
          <h3 className="font-display text-xl md:text-2xl italic group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          <p className="text-sm md:text-base text-text-secondary mt-2 line-clamp-2 leading-relaxed">{project.description}</p>
          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {project.techStack.slice(0, 4).map((tech) => (
                <span key={tech} className="ink-pill">{tech}</span>
              ))}
            </div>
          )}
          <div className="flex gap-4 mt-4 font-mono text-[0.75rem] uppercase tracking-[0.1em] text-text-muted">
            {project.githubUrl && <span>GitHub</span>}
            {project.liveUrl && <span>Live</span>}
          </div>
        </div>
      </article>
    </Link>
  );
}

import ScreenHeader from "@/components/ScreenHeader";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/lib/api";

export default function ProjectsScreen({ projects }: { projects: Project[] }) {
  const list = projects.slice(0, 4);

  return (
    <section className="h-full bg-bg overflow-y-auto border-t border-border/60">
      <div className="h-full flex flex-col justify-center px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto w-full">
          <ScreenHeader index="01" eyebrow="Selected Work" title="Projects" href="/projects" />
          {list.length === 0 ? (
            <p className="font-mono text-sm text-text-muted">暂无项目</p>
          ) : (
            <div className="ink-grid grid-cols-1 md:grid-cols-2">
              {list.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

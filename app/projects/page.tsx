import { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import { ALL_PROJECTS_QUERY, ALL_PROJECT_TECH_STACKS_QUERY } from "@/sanity/lib/queries";
import ProjectCardList from "./ProjectCardList";
import RevealContent from "@/components/RevealContent";

export const metadata: Metadata = {
  title: "Projects",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, allTechs] = await Promise.all([
    client.fetch(ALL_PROJECTS_QUERY).catch(() => []),
    client.fetch(ALL_PROJECT_TECH_STACKS_QUERY).catch(() => []),
  ]);

  const uniqueTechs = [...new Set(allTechs as string[])].sort();

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <RevealContent>
        <h1 className="text-3xl font-bold mb-8">项目</h1>
      </RevealContent>

      {uniqueTechs.length > 0 && (
        <RevealContent delay={0.05}>
          <div className="flex flex-wrap gap-2 mb-10">
            {uniqueTechs.map((tech) => (
              <a
                key={tech}
                href={`/projects?tech=${encodeURIComponent(tech)}`}
                className="text-xs bg-surface border border-border px-3 py-1.5 rounded-lg text-text-muted hover:text-text-primary hover:border-accent-start/30 transition-all"
              >
                {tech}
              </a>
            ))}
          </div>
        </RevealContent>
      )}

      {projects.length === 0 ? (
        <div className="py-24 text-center text-text-muted">
          暂无项目，请在 /admin 中添加
        </div>
      ) : (
        <ProjectCardList projects={projects} />
      )}
    </div>
  );
}

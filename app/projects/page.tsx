import { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { ALL_PROJECTS_QUERY, ALL_PROJECT_TECH_STACKS_QUERY } from '@/sanity/lib/queries';
import ProjectCard from '@/components/ProjectCard';

export const metadata: Metadata = {
  title: 'Projects',
};

export default async function ProjectsPage() {
  const [projects, allTechs] = await Promise.all([
    client.fetch(ALL_PROJECTS_QUERY).catch(() => []),
    client.fetch(ALL_PROJECT_TECH_STACKS_QUERY).catch(() => []),
  ]);

  const uniqueTechs = [...new Set(allTechs as string[])].sort();

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 animate-in">
      <h1 className="text-3xl font-bold mb-8">项目</h1>

      {uniqueTechs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {uniqueTechs.map((tech) => (
            <a
              key={tech}
              href={`/projects?tech=${encodeURIComponent(tech)}`}
              className="text-xs bg-surface-alt border border-border px-3 py-1.5 rounded-lg text-muted hover:text-foreground hover:border-primary/30 transition-all"
            >
              {tech}
            </a>
          ))}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="py-24 text-center text-muted">暂无项目，请在 /admin 中添加</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((project: any) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

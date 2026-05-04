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
    <div className="max-w-6xl mx-auto px-6 py-16 animate-slide-up">
      <p className="font-mono text-xs text-muted tracking-[0.2em] uppercase mb-4">
        Work
      </p>
      <h1 className="font-mono text-4xl font-bold text-foreground mb-10">
        Projects
      </h1>

      {uniqueTechs.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-12">
          {uniqueTechs.map((tech) => (
            <a
              key={tech}
              href={`/projects?tech=${encodeURIComponent(tech)}`}
              className="font-mono text-xs text-muted hover:text-primary transition-colors"
            >
              #{tech}
            </a>
          ))}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="py-24 text-center">
          <p className="font-mono text-muted">
            no projects found <span className="text-border">—</span> add one in <span className="text-primary">/admin</span>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          {projects.map((project: any) => (
            <div key={project._id} className="bg-surface">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      <h1 className="text-3xl font-bold mb-8 font-mono">
        <span className="text-primary mr-2">&gt;</span>
        Projects
      </h1>

      {uniqueTechs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {uniqueTechs.map((tech) => (
            <a
              key={tech}
              href={`/projects?tech=${encodeURIComponent(tech)}`}
              className="text-xs bg-surface-alt text-muted border border-border px-3 py-1.5 rounded-full hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200"
            >
              {tech}
            </a>
          ))}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-mono text-muted text-lg">
            <span className="text-primary">$</span> ls projects/
          </p>
          <p className="text-muted text-sm mt-2">No projects found. Create one in /admin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project: any) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}

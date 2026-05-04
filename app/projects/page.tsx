import { client } from '@/sanity/lib/client';
import { ALL_PROJECTS_QUERY, ALL_PROJECT_TECH_STACKS_QUERY } from '@/sanity/lib/queries';
import ProjectCard from '@/components/ProjectCard';

export default async function ProjectsPage() {
  const [projects, allTechs] = await Promise.all([
    client.fetch(ALL_PROJECTS_QUERY).catch(() => []),
    client.fetch(ALL_PROJECT_TECH_STACKS_QUERY).catch(() => []),
  ]);

  const uniqueTechs = [...new Set(allTechs as string[])].sort();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Projects</h1>

      {uniqueTechs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {uniqueTechs.map((tech) => (
            <a
              key={tech}
              href={`/projects?tech=${encodeURIComponent(tech)}`}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              {tech}
            </a>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project: any) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </div>
  );
}

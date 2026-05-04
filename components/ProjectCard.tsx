import Link from 'next/link';
import { urlForImage } from '@/sanity/lib/client';

interface ProjectCardProps {
  project: {
    _id: string;
    title: string;
    slug: { current: string };
    coverImage?: any;
    description: string;
    techStack?: string[];
    githubUrl?: string;
    liveUrl?: string;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug.current}`}
      className="group block border border-border rounded-lg overflow-hidden bg-surface-alt hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
    >
      {project.coverImage && (
        <div className="relative overflow-hidden">
          <img
            src={urlForImage(project.coverImage).width(600).height(300).url()}
            alt={project.title}
            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-alt/60 to-transparent" />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 text-foreground group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-muted line-clamp-2 mb-3">{project.description}</p>
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

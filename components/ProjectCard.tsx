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
      className="group block bg-surface-alt border border-border rounded-lg overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      {project.coverImage && (
        <img
          src={urlForImage(project.coverImage).width(600).height(340).url()}
          alt={project.title}
          className="w-full h-48 object-cover group-hover:scale-[1.02] transition-transform duration-500"
        />
      )}
      <div className="p-5">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-3">
          {project.description}
        </p>
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <span key={tech} className="text-xs bg-surface border border-border px-2 py-0.5 rounded text-muted">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

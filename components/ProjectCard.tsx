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
      className="group block border border-border bg-surface-alt hover:border-primary/40 transition-all duration-300"
    >
      {project.coverImage && (
        <div className="overflow-hidden">
          <img
            src={urlForImage(project.coverImage).width(600).height(300).url()}
            alt={project.title}
            className="w-full h-44 object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="font-mono font-bold text-base mb-2 text-foreground group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-4">
          {project.description}
        </p>
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {project.techStack.map((tech) => (
              <span key={tech} className="text-xs font-mono text-muted group-hover:text-primary/80 transition-colors">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

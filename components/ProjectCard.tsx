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
      className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      {project.coverImage && (
        <img
          src={urlForImage(project.coverImage).width(600).height(300).url()}
          alt={project.title}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{project.description}</p>
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-xs bg-gray-100 px-2 py-0.5 rounded"
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

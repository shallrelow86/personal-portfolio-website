import Link from "next/link";
import Image from "next/image";
import SectionShell from "@/components/SectionShell";
import type { Project } from "@/lib/api";

export default function Projects({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <SectionShell index="01" eyebrow="Selected Work" title="Projects">
      <div className="ink-grid grid-cols-1 md:grid-cols-2">
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.slug}`} className="group block p-0">
            <div className="p-6 md:p-8 h-full transition-colors group-hover:bg-surface-2/60">
              {p.coverImage && (
                <Image
                  src={p.coverImage}
                  alt={p.title}
                  width={480}
                  height={270}
                  className="w-full aspect-[16/10] object-cover rounded-lg mb-5"
                />
              )}
              <h3 className="font-display text-2xl italic mb-2 group-hover:text-accent transition-colors">
                {p.title}
              </h3>
              <p className="text-sm md:text-base text-text-secondary mb-4 leading-relaxed line-clamp-2">
                {p.description}
              </p>
              {p.techStack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {p.techStack.map((tech) => (
                    <span key={tech} className="ink-pill">{tech}</span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </SectionShell>
  );
}

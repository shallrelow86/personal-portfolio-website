import Link from "next/link";
import BrutalCard from "@/components/ui/BrutalCard";
import type { Project } from "@/lib/api";

export default function Projects({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section className="px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-display text-3xl mb-8">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`}>
              <BrutalCard className="h-full">
                {p.coverImage && (
                  <img src={p.coverImage} alt={p.title} className="w-full aspect-video object-cover border-2 border-border mb-4" />
                )}
                <h3 className="font-display text-xl mb-2">{p.title}</h3>
                <p className="text-sm text-text-secondary mb-4">{p.description}</p>
                {p.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {p.techStack.map((tech) => (
                      <span key={tech} className="brutal-tag">{tech}</span>
                    ))}
                  </div>
                )}
              </BrutalCard>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

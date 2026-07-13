import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import ProjectMedia from "@/components/ProjectGallery";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { parseJsonArray } from "@/lib/json";
import type { Project } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await db.select().from(schema.project).where(eq(schema.project.slug, slug)).get();
  if (!row) return { title: "Not Found" };
  return { title: row.title, description: row.description };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = await db.select().from(schema.project).where(eq(schema.project.slug, slug)).get();
  if (!row) notFound();

  const project: Project = {
    ...row,
    techStack: parseJsonArray(row.techStack),
    screenshots: parseJsonArray(row.screenshots),
    featured: Boolean(row.featured),
  };

  return (
    <article className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <Link href="/projects" className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-text-muted hover:text-accent transition-colors">
        ← Projects
      </Link>

      <ProjectMedia
        title={project.title}
        coverImage={project.coverImage}
        screenshots={project.screenshots}
      >
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl italic leading-tight tracking-tight">
          {project.title}
        </h1>
        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {project.techStack.map((tech) => (
              <span key={tech} className="ink-pill">{tech}</span>
            ))}
          </div>
        )}
        <p className="text-text-secondary mt-6 text-lg leading-relaxed">{project.description}</p>
        <div className="flex flex-wrap items-center gap-3 mt-8">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="brutal-btn">
              GitHub →
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="brutal-btn brutal-btn-primary">
              Live →
            </a>
          )}
        </div>
        {project.body && (
          <div className="mt-12 pt-8 border-t border-border">
            <Markdown content={project.body} />
          </div>
        )}
      </ProjectMedia>
    </article>
  );
}

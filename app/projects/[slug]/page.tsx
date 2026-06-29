import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Markdown from "@/components/Markdown";
import { fetchApi, type Project } from "@/lib/api";

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
  const project = await fetchApi<Project>(`/api/projects/${slug}`);
  if (!project) return { title: "Not Found" };
  return { title: project.title, description: project.description };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await fetchApi<Project>(`/api/projects/${slug}`);
  if (!project) notFound();

  return (
    <>
      <Header />
      <article className="max-w-4xl mx-auto px-6 py-16">
        <Link href="/projects" className="font-mono text-xs uppercase tracking-wider text-text-muted hover:text-accent transition-colors">
          ← Projects
        </Link>
        {project.coverImage && (
          <img src={project.coverImage} alt={project.title} className="w-full h-56 md:h-72 object-cover border-2 border-border mt-8 mb-8" />
        )}
        <h1 className="font-display text-4xl md:text-5xl">{project.title}</h1>
        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {project.techStack.map((tech) => (
              <span key={tech} className="brutal-tag">{tech}</span>
            ))}
          </div>
        )}
        <p className="text-text-secondary mt-6">{project.description}</p>
        <div className="flex gap-4 mt-6 font-mono text-xs">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="border-2 border-border px-4 py-2 hover:border-accent transition-colors">
              GitHub →
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="border-2 border-border px-4 py-2 hover:border-accent transition-colors">
              Live →
            </a>
          )}
        </div>
        {project.body && (
          <div className="mt-10">
            <Markdown content={project.body} />
          </div>
        )}
        {project.screenshots.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
            {project.screenshots.map((url, i) => (
              <img key={i} src={url} alt={`Screenshot ${i + 1}`} className="border-2 border-border w-full" />
            ))}
          </div>
        )}
      </article>
    </>
  );
}

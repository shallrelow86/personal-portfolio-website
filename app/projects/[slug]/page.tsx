import { Metadata } from "next";
import { notFound } from "next/navigation";
import { client, urlForImage } from "@/sanity/lib/client";
import { PROJECT_BY_SLUG_QUERY, ALL_PROJECT_SLUGS_QUERY } from "@/sanity/lib/queries";
import { PortableText } from "@portabletext/react";
import RevealContent from "@/components/RevealContent";

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await client.fetch(ALL_PROJECT_SLUGS_QUERY).catch(() => []);
  return slugs.map((slug: string) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await client.fetch(PROJECT_BY_SLUG_QUERY, { slug }).catch(() => null);
  if (!project) return { title: "Not Found" };
  return { title: project.title, description: project.description };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await client.fetch(PROJECT_BY_SLUG_QUERY, { slug }).catch(() => null);
  if (!project) notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {project.coverImage && (
        <RevealContent>
          <img
            src={urlForImage(project.coverImage).width(1200).height(500).url()}
            alt={project.title}
            className="w-full h-56 md:h-72 object-cover rounded-xl mb-10 ring-1 ring-border"
          />
        </RevealContent>
      )}

      <RevealContent delay={0.05}>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>
      </RevealContent>

      {project.techStack && project.techStack.length > 0 && (
        <RevealContent delay={0.1}>
          <div className="flex flex-wrap gap-2 mb-6">
            {project.techStack.map((tech: string) => (
              <span
                key={tech}
                className="text-sm bg-surface border border-border px-3 py-1 rounded-lg text-text-secondary"
              >
                {tech}
              </span>
            ))}
          </div>
        </RevealContent>
      )}

      <RevealContent delay={0.15}>
        <div className="flex gap-4 mb-10">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 bg-surface border border-border rounded-lg text-text-muted hover:text-text-primary hover:border-accent-start/30 transition-all"
            >
              GitHub &rarr;
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-4 py-2 bg-surface border border-border rounded-lg text-text-muted hover:text-text-primary hover:border-accent-start/30 transition-all"
            >
              Live Demo &rarr;
            </a>
          )}
        </div>
      </RevealContent>

      {project.body && (
        <RevealContent delay={0.2}>
          <article
            className="prose prose-invert max-w-none mb-16 text-text-secondary leading-relaxed
              [&_h2]:text-text-primary [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-12 [&_h2]:mb-4
              [&_h3]:text-text-primary [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3
              [&_p]:mb-5 [&_strong]:text-text-primary
              [&_a]:text-accent-start [&_a]:no-underline hover:[&_a]:underline
              [&_pre]:bg-surface [&_pre]:border [&_pre]:border-border [&_pre]:rounded-lg [&_pre]:p-5
              [&_code]:text-accent-start [&_code]:text-sm
              [&_ul]:pl-5 [&_ul]:list-disc [&_li]:mb-1
              [&_blockquote]:border-l-2 [&_blockquote]:border-accent-start/30 [&_blockquote]:pl-4
            "
          >
            <PortableText value={project.body} />
          </article>
        </RevealContent>
      )}

      {project.screenshots && project.screenshots.length > 0 && (
        <RevealContent delay={0.25}>
          <section className="mb-16">
            <h2 className="text-xl font-bold mb-6">截图</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.screenshots.map((img: any, i: number) => (
                <img
                  key={i}
                  src={urlForImage(img).width(800).url()}
                  alt={`${project.title} screenshot ${i + 1}`}
                  className="rounded-lg ring-1 ring-border"
                />
              ))}
            </div>
          </section>
        </RevealContent>
      )}

      {project.gitRepoData && (
        <RevealContent delay={0.3}>
          <section className="bg-surface border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-3">仓库统计</h3>
            <div className="flex gap-8 text-sm text-text-muted">
              {project.gitRepoData.stars != null && (
                <span>⭐ {project.gitRepoData.stars} stars</span>
              )}
              {project.gitRepoData.forks != null && (
                <span>🍴 {project.gitRepoData.forks} forks</span>
              )}
              {project.gitRepoData.language && (
                <span>🔤 {project.gitRepoData.language}</span>
              )}
            </div>
          </section>
        </RevealContent>
      )}
    </div>
  );
}

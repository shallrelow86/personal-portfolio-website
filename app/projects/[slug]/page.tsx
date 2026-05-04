import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { client, urlForImage } from '@/sanity/lib/client';
import { PROJECT_BY_SLUG_QUERY, ALL_PROJECT_SLUGS_QUERY } from '@/sanity/lib/queries';
import { PortableText } from '@portabletext/react';

export async function generateStaticParams() {
  const slugs = await client.fetch(ALL_PROJECT_SLUGS_QUERY).catch(() => []);
  return slugs.map((slug: string) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await client.fetch(PROJECT_BY_SLUG_QUERY, { slug }).catch(() => null);
  if (!project) return { title: 'Not Found' };
  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await client.fetch(PROJECT_BY_SLUG_QUERY, { slug }).catch(() => null);

  if (!project) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in-up">
      {project.coverImage && (
        <div className="relative rounded-lg overflow-hidden mb-8">
          <img
            src={urlForImage(project.coverImage).width(1200).height(400).url()}
            alt={project.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface to-transparent" />
        </div>
      )}

      <h1 className="text-3xl font-bold mb-4 font-mono">
        <span className="text-primary mr-2">&gt;</span>
        {project.title}
      </h1>

      {project.techStack && project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {project.techStack.map((tech: string) => (
            <span
              key={tech}
              className="text-sm bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-4 mb-8">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm bg-surface-alt border border-border px-4 py-2 rounded-lg hover:border-primary/50 hover:text-primary transition-all"
          >
            GitHub &rarr;
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm bg-surface-alt border border-border px-4 py-2 rounded-lg hover:border-primary/50 hover:text-primary transition-all"
          >
            Live Demo &rarr;
          </a>
        )}
      </div>

      {project.body && (
        <article className="prose max-w-none mb-12 text-muted [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_a]:text-primary [&_code]:bg-surface-alt [&_code]:text-primary [&_pre]:bg-surface-alt [&_pre]:border [&_pre]:border-border">
          <PortableText value={project.body} />
        </article>
      )}

      {project.screenshots && project.screenshots.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 font-mono">
            <span className="text-primary mr-2">&gt;</span>
            Screenshots
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.screenshots.map((img: any, i: number) => (
              <img
                key={i}
                src={urlForImage(img).width(800).url()}
                alt={`${project.title} screenshot ${i + 1}`}
                className="rounded-lg border border-border"
              />
            ))}
          </div>
        </section>
      )}

      {project.gitRepoData && (
        <section className="p-5 bg-surface-alt border border-border rounded-lg">
          <h3 className="font-semibold mb-3 font-mono text-sm text-muted">Repository Stats</h3>
          <div className="flex gap-6 text-sm text-muted">
            {project.gitRepoData.stars != null && <span>⭐ {project.gitRepoData.stars} stars</span>}
            {project.gitRepoData.forks != null && <span>🍴 {project.gitRepoData.forks} forks</span>}
            {project.gitRepoData.language && <span>🔤 {project.gitRepoData.language}</span>}
          </div>
        </section>
      )}
    </div>
  );
}

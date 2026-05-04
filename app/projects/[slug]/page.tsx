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
    <div className="max-w-4xl mx-auto px-6 py-16 animate-slide-up">
      {project.coverImage && (
        <img
          src={urlForImage(project.coverImage).width(1200).height(400).url()}
          alt={project.title}
          className="w-full h-56 md:h-72 object-cover border border-border mb-12"
        />
      )}

      <p className="font-mono text-xs text-muted tracking-[0.2em] uppercase mb-4">
        Project
      </p>
      <h1 className="font-mono text-4xl md:text-5xl font-bold text-foreground mb-6">
        {project.title}
      </h1>

      {project.techStack && project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-8">
          {project.techStack.map((tech: string) => (
            <span key={tech} className="font-mono text-sm text-muted">
              {tech}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-6 mb-12">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-muted hover:text-primary transition-colors border-b border-border hover:border-primary pb-0.5"
          >
            GitHub &rarr;
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-muted hover:text-primary transition-colors border-b border-border hover:border-primary pb-0.5"
          >
            Live Demo &rarr;
          </a>
        )}
      </div>

      {project.body && (
        <article className="prose prose-invert max-w-none mb-16
          text-muted leading-relaxed
          [&_h2]:font-mono [&_h2]:text-foreground [&_h2]:text-2xl [&_h2]:mt-12 [&_h2]:mb-6
          [&_h3]:font-mono [&_h3]:text-foreground [&_h3]:text-lg [&_h3]:mt-8 [&_h3]:mb-4
          [&_p]:mb-5 [&_strong]:text-foreground [&_strong]:font-bold
          [&_a]:font-mono [&_a]:text-primary [&_a]:no-underline
          [&_code]:font-mono [&_code]:text-primary [&_code]:text-sm
          [&_pre]:bg-surface-alt [&_pre]:border [&_pre]:border-border [&_pre]:p-4 [&_pre]:text-sm
          [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1
        ">
          <PortableText value={project.body} />
        </article>
      )}

      {project.screenshots && project.screenshots.length > 0 && (
        <section className="mb-16">
          <h2 className="font-mono text-xl font-bold text-foreground mb-6">
            Screenshots
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.screenshots.map((img: any, i: number) => (
              <img
                key={i}
                src={urlForImage(img).width(800).url()}
                alt={`${project.title} screenshot ${i + 1}`}
                className="border border-border"
              />
            ))}
          </div>
        </section>
      )}

      {project.gitRepoData && (
        <section className="border border-border p-6 bg-surface-alt">
          <h3 className="font-mono text-xs text-muted tracking-[0.2em] uppercase mb-4">
            Repository
          </h3>
          <div className="flex gap-8 font-mono text-sm text-muted">
            {project.gitRepoData.stars != null && <span>stars {project.gitRepoData.stars}</span>}
            {project.gitRepoData.forks != null && <span>forks {project.gitRepoData.forks}</span>}
            {project.gitRepoData.language && <span>{project.gitRepoData.language}</span>}
          </div>
        </section>
      )}
    </div>
  );
}

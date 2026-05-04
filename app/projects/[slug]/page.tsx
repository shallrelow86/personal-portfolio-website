import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { client, urlForImage } from '@/sanity/lib/client';
import { PROJECT_BY_SLUG_QUERY, ALL_PROJECT_SLUGS_QUERY } from '@/sanity/lib/queries';
import { PortableText } from '@portabletext/react';

export async function generateStaticParams() {
  const slugs = await client.fetch(ALL_PROJECT_SLUGS_QUERY).catch(() => []);
  return slugs.map((slug: string) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await client.fetch(PROJECT_BY_SLUG_QUERY, { slug: params.slug }).catch(() => null);
  if (!project) return { title: 'Not Found' };
  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await client.fetch(PROJECT_BY_SLUG_QUERY, { slug: params.slug }).catch(() => null);

  if (!project) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {project.coverImage && (
        <img
          src={urlForImage(project.coverImage).width(1200).height(400).url()}
          alt={project.title}
          className="w-full h-64 object-cover rounded-lg mb-8"
        />
      )}

      <h1 className="text-3xl font-bold mb-4">{project.title}</h1>

      {project.techStack && project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {project.techStack.map((tech: string) => (
            <span key={tech} className="text-sm bg-gray-100 px-3 py-1 rounded-full">{tech}</span>
          ))}
        </div>
      )}

      <div className="flex gap-4 mb-8">
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
            GitHub &rarr;
          </a>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
            Live Demo &rarr;
          </a>
        )}
      </div>

      {project.body && (
        <div className="prose max-w-none mb-12">
          <PortableText value={project.body} />
        </div>
      )}

      {project.screenshots && project.screenshots.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Screenshots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.screenshots.map((img: any, i: number) => (
              <img
                key={i}
                src={urlForImage(img).width(800).url()}
                alt={`${project.title} screenshot ${i + 1}`}
                className="rounded-lg border"
              />
            ))}
          </div>
        </section>
      )}

      {project.gitRepoData && (
        <section className="mt-12 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Repository Stats</h3>
          <div className="flex gap-6 text-sm text-gray-600">
            {project.gitRepoData.stars != null && <span>⭐ {project.gitRepoData.stars} stars</span>}
            {project.gitRepoData.forks != null && <span>🍴 {project.gitRepoData.forks} forks</span>}
            {project.gitRepoData.language && <span>🔤 {project.gitRepoData.language}</span>}
          </div>
        </section>
      )}
    </div>
  );
}

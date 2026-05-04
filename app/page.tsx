import Link from 'next/link';
import { client, urlForImage } from '@/sanity/lib/client';
import { PROFILE_QUERY, FEATURED_PROJECTS_QUERY, LATEST_POSTS_QUERY } from '@/sanity/lib/queries';
import ProjectCard from '@/components/ProjectCard';
import PostCard from '@/components/PostCard';

export default async function HomePage() {
  const [profile, projects, posts] = await Promise.all([
    client.fetch(PROFILE_QUERY).catch(() => null),
    client.fetch(FEATURED_PROJECTS_QUERY).catch(() => []),
    client.fetch(LATEST_POSTS_QUERY).catch(() => []),
  ]);

  return (
    <div className="animate-fade-in-up">
      {/* Hero */}
      <section className="relative py-24 text-center">
        {profile?.avatar && (
          <img
            src={urlForImage(profile.avatar).width(200).height(200).url()}
            alt={profile.name}
            className="w-28 h-28 rounded-full mx-auto mb-6 object-cover ring-2 ring-primary/50 ring-offset-4 ring-offset-surface"
          />
        )}
        <h1 className="text-4xl md:text-5xl font-bold mb-3 font-mono">
          <span className="text-muted text-lg md:text-xl mr-2 align-middle">$</span>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {profile?.name || 'Developer'}
          </span>
        </h1>
        {profile?.title && (
          <p className="text-muted text-lg mb-6 font-mono">
            <span className="text-border mr-2">&gt;</span>
            {profile.title}
            <span className="inline-block w-2.5 h-5 bg-primary ml-1 animate-pulse align-middle" />
          </p>
        )}
        <div className="flex justify-center gap-3">
          {(profile?.socialLinks || []).map((link: { platform: string; url: string }) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted bg-surface-alt border border-border px-3 py-1.5 rounded-lg hover:text-primary hover:border-primary/50 transition-all duration-200"
            >
              {link.platform}
            </a>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-mono">
              <span className="text-primary mr-2">&gt;</span>
              Featured Projects
            </h2>
            <Link
              href="/projects"
              className="text-sm text-primary hover:text-primary-hover transition-colors link-underline"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold font-mono">
              <span className="text-accent mr-2">&gt;</span>
              Latest Posts
            </h2>
            <Link
              href="/blog"
              className="text-sm text-primary hover:text-primary-hover transition-colors link-underline"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state when no data */}
      {projects.length === 0 && posts.length === 0 && (
        <section className="max-w-4xl mx-auto px-4 py-20 text-center">
          <p className="font-mono text-muted text-lg">
            <span className="text-primary">$</span> echo &quot;No content yet. Add content in /admin&quot;
          </p>
        </section>
      )}
    </div>
  );
}

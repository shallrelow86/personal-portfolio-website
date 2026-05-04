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
    <div className="animate-slide-up">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        <div className="flex items-start justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs text-muted tracking-[0.2em] uppercase mb-8">
              Developer &amp; Builder
            </p>
            <h1 className="font-mono text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
              {profile?.name || 'Developer'}
            </h1>
            {profile?.title && (
              <p className="font-mono text-xl text-muted mb-10 leading-relaxed">
                {profile.title}
              </p>
            )}
            <div className="flex gap-4">
              {(profile?.socialLinks || []).map((link: { platform: string; url: string }) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-muted hover:text-primary transition-colors tracking-wide uppercase"
                >
                  [{link.platform}]
                </a>
              ))}
            </div>
          </div>
          {profile?.avatar && (
            <div className="hidden md:block">
              <img
                src={urlForImage(profile.avatar).width(160).height(160).url()}
                alt={profile.name}
                className="w-32 h-32 object-cover grayscale"
              />
            </div>
          )}
        </div>
      </section>

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-baseline justify-between mb-10">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs text-muted">01</span>
              <h2 className="font-mono text-2xl font-bold text-foreground">
                Featured Projects
              </h2>
            </div>
            <Link
              href="/projects"
              className="font-mono text-xs text-muted hover:text-primary transition-colors tracking-wide uppercase"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {projects.map((project: any) => (
              <div key={project._id} className="bg-surface">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-baseline justify-between mb-10">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-xs text-muted">02</span>
              <h2 className="font-mono text-2xl font-bold text-foreground">
                Latest Posts
              </h2>
            </div>
            <Link
              href="/blog"
              className="font-mono text-xs text-muted hover:text-primary transition-colors tracking-wide uppercase"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
            {posts.map((post: any) => (
              <div key={post._id} className="bg-surface">
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </section>
      )}

      {projects.length === 0 && posts.length === 0 && (
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <p className="font-mono text-muted">
            content pending <span className="text-border">—</span> visit <span className="text-primary">/admin</span> to begin
          </p>
        </section>
      )}
    </div>
  );
}

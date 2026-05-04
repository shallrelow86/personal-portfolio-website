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
    <div className="animate-in">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-16 md:pt-36 md:pb-24">
        <div className="flex flex-col-reverse md:flex-row md:items-center gap-8 md:gap-16">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              {profile?.name || 'Developer'}
            </h1>
            {profile?.title && (
              <p className="text-lg text-muted mb-8 leading-relaxed max-w-lg">
                {profile.title}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {(profile?.socialLinks || []).map((link: { platform: string; url: string }) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm px-4 py-2 bg-surface-alt border border-border rounded-lg text-muted hover:text-foreground hover:border-primary/30 transition-all"
                >
                  {link.platform}
                </a>
              ))}
            </div>
          </div>
          {profile?.avatar && (
            <div className="flex-shrink-0">
              <img
                src={urlForImage(profile.avatar).width(200).height(200).url()}
                alt={profile.name}
                className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover ring-1 ring-border"
              />
            </div>
          )}
        </div>
      </section>

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">精选项目</h2>
            <Link href="/projects" className="text-sm text-muted hover:text-primary transition-colors">
              查看全部 &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project: any) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">最新文章</h2>
            <Link href="/blog" className="text-sm text-muted hover:text-primary transition-colors">
              查看全部 &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {posts.map((post: any) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      )}

      {projects.length === 0 && posts.length === 0 && (
        <section className="max-w-5xl mx-auto px-6 pb-24 text-center">
          <p className="text-muted">
            还没有内容，前往 <Link href="/admin" className="text-primary hover:underline">/admin</Link> 添加
          </p>
        </section>
      )}
    </div>
  );
}

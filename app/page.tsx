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
    <div>
      {/* Hero */}
      <section className="py-20 text-center">
        {profile?.avatar && (
          <img
            src={urlForImage(profile.avatar).width(200).height(200).url()}
            alt={profile.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
          />
        )}
        <h1 className="text-4xl font-bold mb-2">{profile?.name || 'Developer'}</h1>
        {profile?.title && <p className="text-xl text-gray-600 mb-4">{profile.title}</p>}
        <div className="flex justify-center gap-4">
          {(profile?.socialLinks || []).map((link: { platform: string; url: string }) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              {link.platform}
            </a>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Projects</h2>
            <Link href="/projects" className="text-sm text-blue-600 hover:underline">
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest Posts</h2>
            <Link href="/blog" className="text-sm text-blue-600 hover:underline">
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
    </div>
  );
}

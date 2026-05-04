import { Metadata } from 'next';
import { client, urlForImage, urlForFile } from '@/sanity/lib/client';
import { PROFILE_QUERY } from '@/sanity/lib/queries';
import { PortableText } from '@portabletext/react';

export const metadata: Metadata = {
  title: 'About',
};

export default async function AboutPage() {
  const profile = await client.fetch(PROFILE_QUERY).catch(() => null);

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center text-muted">
        暂无个人信息，请在 /admin 中配置
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 animate-in">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-12">
        {/* Sidebar */}
        <aside>
          {profile.avatar && (
            <img
              src={urlForImage(profile.avatar).width(240).height(240).url()}
              alt={profile.name}
              className="w-full aspect-square object-cover rounded-2xl ring-1 ring-border mb-6"
            />
          )}
          <div className="space-y-4">
            {profile.resumeFile?.asset && (
              <a
                href={urlForFile(profile.resumeFile)}
                download
                className="block text-sm text-center bg-primary text-surface font-medium py-2.5 rounded-lg hover:bg-primary-hover transition-colors"
              >
                下载简历
              </a>
            )}
            <div className="space-y-1">
              {(profile.socialLinks || []).map((link: { platform: string; url: string }) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-muted hover:text-primary transition-colors py-1"
                >
                  {link.platform} &rarr;
                </a>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
          {profile.title && <p className="text-muted mb-8">{profile.title}</p>}

          {profile.bio && (
            <div className="prose prose-invert max-w-none mb-10 text-muted leading-relaxed
              [&_strong]:text-foreground
              [&_a]:text-primary
            ">
              <PortableText value={profile.bio} />
            </div>
          )}

          {profile.skills?.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4">技能</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string) => (
                  <span key={skill} className="text-sm bg-surface-alt border border-border px-3 py-1.5 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

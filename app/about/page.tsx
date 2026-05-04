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
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="font-mono text-muted">
          profile not found <span className="text-border">—</span> configure in <span className="text-primary">/admin</span>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-16">
        {/* Sidebar */}
        <aside className="space-y-8">
          {profile.avatar && (
            <img
              src={urlForImage(profile.avatar).width(280).height(280).url()}
              alt={profile.name}
              className="w-full aspect-square object-cover grayscale border border-border"
            />
          )}
          <div>
            <p className="font-mono text-xs text-muted tracking-[0.2em] uppercase mb-4">
              Connect
            </p>
            <div className="space-y-2">
              {(profile.socialLinks || []).map((link: { platform: string; url: string }) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block font-mono text-sm text-muted hover:text-primary transition-colors"
                >
                  {link.platform} &rarr;
                </a>
              ))}
            </div>
          </div>
          {profile.resumeFile?.asset && (
            <a
              href={urlForFile(profile.resumeFile)}
              download
              className="inline-block font-mono text-sm border border-border px-4 py-2 text-muted hover:text-primary hover:border-primary transition-colors"
            >
              Download Resume
            </a>
          )}
        </aside>

        {/* Main content */}
        <div>
          <p className="font-mono text-xs text-muted tracking-[0.2em] uppercase mb-6">
            About
          </p>
          <h1 className="font-mono text-4xl md:text-5xl font-bold text-foreground mb-2">
            {profile.name}
          </h1>
          {profile.title && (
            <p className="font-mono text-lg text-muted mb-10">
              {profile.title}
            </p>
          )}

          {profile.bio && (
            <div className="prose prose-invert max-w-none mb-12 text-muted leading-relaxed
              [&_strong]:text-foreground [&_strong]:font-bold
              [&_a]:font-mono [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline
              [&_p]:mb-5
              [&_blockquote]:border-l-2 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:text-muted
            ">
              <PortableText value={profile.bio} />
            </div>
          )}

          {profile.skills?.length > 0 && (
            <section>
              <p className="font-mono text-xs text-muted tracking-[0.2em] uppercase mb-5">
                Skills &amp; Technologies
              </p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {profile.skills.map((skill: string) => (
                  <span key={skill} className="font-mono text-sm text-foreground">
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

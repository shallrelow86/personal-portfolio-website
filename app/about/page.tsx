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
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="font-mono text-muted">
          <span className="text-primary">$</span> echo &quot;No profile configured yet. Visit /admin&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in-up">
      <div className="flex items-center gap-6 mb-10">
        {profile.avatar && (
          <img
            src={urlForImage(profile.avatar).width(200).height(200).url()}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover ring-2 ring-primary/50 ring-offset-4 ring-offset-surface"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold font-mono">
            <span className="text-muted">$</span>{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {profile.name}
            </span>
          </h1>
          {profile.title && (
            <p className="text-muted text-lg mt-1">
              <span className="text-border mr-1">&gt;</span>
              {profile.title}
            </p>
          )}
        </div>
      </div>

      {profile.bio && (
        <div className="mb-10 border-l-2 border-primary/30 pl-4">
          <div className="prose max-w-none text-muted [&_strong]:text-foreground [&_a]:text-primary">
            <PortableText value={profile.bio} />
          </div>
        </div>
      )}

      {profile.skills?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 font-mono">
            <span className="text-primary mr-2">&gt;</span>
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: string) => (
              <span
                key={skill}
                className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {profile.socialLinks?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4 font-mono">
            <span className="text-accent mr-2">&gt;</span>
            Connect
          </h2>
          <div className="flex flex-wrap gap-3">
            {profile.socialLinks.map((link: { platform: string; url: string }) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted bg-surface-alt border border-border px-4 py-2 rounded-lg hover:text-primary hover:border-primary/50 transition-all duration-200"
              >
                {link.platform}
              </a>
            ))}
          </div>
        </section>
      )}

      {profile.resumeFile?.asset && (
        <section>
          <a
            href={urlForFile(profile.resumeFile)}
            download
            className="inline-block bg-primary text-surface font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-primary-hover transition-colors"
          >
            Download Resume (PDF)
          </a>
        </section>
      )}
    </div>
  );
}

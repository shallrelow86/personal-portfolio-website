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
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-gray-500">No profile information configured yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-6 mb-8">
        {profile.avatar && (
          <img
            src={urlForImage(profile.avatar).width(200).height(200).url()}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          {profile.title && <p className="text-xl text-gray-600">{profile.title}</p>}
        </div>
      </div>

      {profile.bio && (
        <div className="prose max-w-none mb-8">
          <PortableText value={profile.bio} />
        </div>
      )}

      {profile.skills?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: string) => (
              <span key={skill} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{skill}</span>
            ))}
          </div>
        </section>
      )}

      {profile.socialLinks?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Connect</h2>
          <div className="flex gap-4">
            {profile.socialLinks.map((link: { platform: string; url: string }) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
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
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Download Resume (PDF)
          </a>
        </section>
      )}
    </div>
  );
}

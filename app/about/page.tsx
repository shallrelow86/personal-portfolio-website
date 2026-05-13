import { Metadata } from "next";
import { client, urlForImage, urlForFile } from "@/sanity/lib/client";
import { PROFILE_QUERY } from "@/sanity/lib/queries";
import { PortableText } from "@portabletext/react";
import RevealContent from "@/components/RevealContent";

export const metadata: Metadata = {
  title: "About",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const profile = await client.fetch(PROFILE_QUERY).catch(() => null);

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center text-text-muted">
        暂无个人信息，请在 /admin 中配置
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-12">
        <aside>
          {profile.avatar && (
            <RevealContent>
              <img
                src={urlForImage(profile.avatar).width(260).height(260).url()}
                alt={profile.name}
                className="w-full aspect-square object-cover rounded-2xl ring-1 ring-border mb-6"
              />
            </RevealContent>
          )}
          <div className="space-y-4">
            {profile.resumeFile?.asset && (
              <RevealContent delay={0.1}>
                <a
                  href={urlForFile(profile.resumeFile)}
                  download
                  className="block text-sm text-center bg-accent-start text-white font-medium py-2.5 rounded-lg hover:bg-accent-end transition-colors"
                >
                  下载简历
                </a>
              </RevealContent>
            )}
            {(profile.socialLinks || []).length > 0 && (
              <RevealContent delay={0.15}>
                <div className="space-y-1">
                  {(profile.socialLinks || []).map(
                    (link: { platform: string; url: string }) => (
                      <a
                        key={link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-text-muted hover:text-accent-start transition-colors py-1"
                      >
                        {link.platform} &rarr;
                      </a>
                    )
                  )}
                </div>
              </RevealContent>
            )}
          </div>
        </aside>

        <div>
          <RevealContent>
            <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
          </RevealContent>
          {profile.title && (
            <RevealContent delay={0.05}>
              <p className="text-text-secondary mb-8">{profile.title}</p>
            </RevealContent>
          )}

          {profile.bio && (
            <RevealContent delay={0.1}>
              <div
                className="prose prose-invert max-w-none mb-10 text-text-secondary leading-relaxed
                  [&_strong]:text-text-primary
                  [&_a]:text-accent-start
                "
              >
                <PortableText value={profile.bio} />
              </div>
            </RevealContent>
          )}

          {profile.skills?.length > 0 && (
            <RevealContent delay={0.15}>
              <section>
                <h2 className="text-lg font-semibold mb-4">技能</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="text-sm bg-surface border border-border px-3 py-1.5 rounded-lg text-text-secondary"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            </RevealContent>
          )}
        </div>
      </div>
    </div>
  );
}

import { Metadata } from "next";
import Header from "@/components/Header";
import Markdown from "@/components/Markdown";
import { fetchApi, type Profile } from "@/lib/api";

export const metadata: Metadata = { title: "About" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const profile = await fetchApi<Profile>("/api/admin/profile");

  if (!profile) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto px-6 py-24 text-center font-mono text-text-muted">
          暂无个人信息，请在 /admin 中配置
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl mb-10">About</h1>
        <div className="flex flex-col sm:flex-row gap-8 mb-10">
          {profile.avatar && (
            <img src={profile.avatar} alt={profile.name} className="w-40 h-40 object-cover border-2 border-border shrink-0" />
          )}
          <div>
            <h2 className="font-display text-2xl">{profile.name}</h2>
            <p className="font-mono text-sm text-text-secondary mt-2">{profile.title}</p>
          </div>
        </div>
        {profile.bio && <Markdown content={profile.bio} />}
        {profile.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10">
            {profile.skills.map((skill) => (
              <span key={skill} className="brutal-tag">{skill}</span>
            ))}
          </div>
        )}
        {profile.socialLinks.length > 0 && (
          <ul className="font-mono text-xs space-y-2 mt-10">
            {profile.socialLinks.map((link) => (
              <li key={link.platform}>
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                  {link.platform} →
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

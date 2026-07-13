import { Metadata } from "next";
import Image from "next/image";
import Markdown from "@/components/Markdown";
import { fetchProfile } from "@/lib/profile";

export const metadata: Metadata = { title: "About" };
export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const profile = await fetchProfile();

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center font-mono text-sm text-text-muted">
        暂无个人信息，请到 /admin 中配置
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <p className="eyebrow mb-4">About</p>
      <h1 className="font-display text-4xl md:text-5xl italic mb-12">关于我</h1>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-4">
          {profile.avatar && (
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={280}
              height={280}
              className="w-full max-w-[280px] aspect-square object-cover rounded-2xl"
            />
          )}
        </div>
        <div className="md:col-span-8">
          <h2 className="font-display text-3xl italic">{profile.name}</h2>
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-text-muted mt-2">{profile.title}</p>
          {profile.bio && <div className="mt-8"><Markdown content={profile.bio} /></div>}
          {profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-10">
              {profile.skills.map((skill) => (
                <span key={skill} className="ink-pill">{skill}</span>
              ))}
            </div>
          )}
          {profile.socialLinks.length > 0 && (
            <ul className="flex flex-wrap gap-5 mt-10 font-mono text-[0.75rem] uppercase tracking-[0.12em]">
              {profile.socialLinks.map((link) => (
                <li key={link.platform}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-accent transition-colors">
                    {link.platform} →
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

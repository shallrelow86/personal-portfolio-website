import Link from "next/link";
import HeroMotion from "@/components/HeroMotion";
import ScrollSectionLink from "@/components/ScrollSectionLink";
import type { Profile } from "@/lib/api";

export default function Hero({ profile, fullHeight }: { profile: Profile | null; fullHeight?: boolean }) {
  const name = profile?.name || "Developer";
  const title = profile?.title || "";
  const bio = profile?.bio || "";
  const skills = profile?.skills || [];
  const socials = profile?.socialLinks || [];

  return (
    <section className={`bg-bg text-text-primary border-t border-border/60 ${fullHeight ? "h-full" : ""}`}>
      <div
        className={`max-w-6xl mx-auto px-6 ${
          fullHeight ? "h-full flex flex-col justify-center py-12 md:py-16" : "py-20 md:py-28"
        }`}
      >
        <p className="section-index mb-2">00</p>
        <p className="eyebrow mb-5">Intro / Portfolio</p>
        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl italic leading-[1.08] tracking-tight mb-5">
          <HeroMotion text={name} />
        </h1>
        {title && (
          <p className="font-mono text-xs md:text-xs uppercase tracking-[0.2em] text-text-muted mb-6">
            {title}
          </p>
        )}
        {bio && (
          <p className="max-w-2xl text-text-secondary text-base md:text-lg leading-relaxed mb-8">
            {bio.slice(0, 160)}{bio.length > 160 ? "…" : ""}
          </p>
        )}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {skills.map((s) => (
              <span key={s} className="ink-pill">
                {s}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-5 items-start">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" data-open-chat className="brutal-btn brutal-btn-primary">
              问问 AI →
            </button>
            <ScrollSectionLink index={1} href="/projects" className="brutal-btn">
              项目 →
            </ScrollSectionLink>
            <ScrollSectionLink index={2} href="/blog" className="brutal-btn">
              博客 →
            </ScrollSectionLink>
          </div>
          {socials.length > 0 && (
            <ul className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.75rem] uppercase tracking-[0.15em] pt-1 border-t border-border/80 w-full max-w-md">
              {socials.map((s) => (
                <li key={s.platform} className="pt-4">
                  <Link
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-accent transition-colors"
                  >
                    {s.platform}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {fullHeight && (
          <p className="mt-12 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-text-muted">
            滚轮切换 ↓
          </p>
        )}
      </div>
    </section>
  );
}

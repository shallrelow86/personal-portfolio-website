"use client";

import { useCallback } from "react";
import { Mail, ArrowDown } from "lucide-react";
import { GithubIcon, TwitterIcon, GiteeIcon, CsdnIcon } from "@/components/Icons";

interface SocialLink {
  platform: string;
  url: string;
}

interface Profile {
  name?: string;
  title?: string;
  avatar?: any;
  socialLinks?: SocialLink[];
}

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GitHub: GithubIcon,
  Twitter: TwitterIcon,
  X: TwitterIcon,
  Gitee: GiteeIcon,
  CSDN: CsdnIcon,
};

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  const container = document.querySelector<HTMLElement>("main.snap-y");
  if (!el || !container) return;
  const scrollTop = el.offsetTop;
  container.scrollTo({ top: scrollTop, behavior: "smooth" });
};

export default function Hero({ profile }: { profile: Profile | null }) {
  const name = profile?.name || "Developer";
  const title = profile?.title || "Frontend Developer";
  const socials = profile?.socialLinks || [];

  const goProjects = useCallback(() => scrollTo("projects"), []);
  const goBlog = useCallback(() => scrollTo("blog"), []);

  return (
    <section
      id="hero"
      className="min-h-screen snap-start flex items-center justify-center relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent-start/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center flex flex-col items-center">
        <div className="animate-fade-up">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-border bg-surface text-sm text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
            Available for hire
          </span>
        </div>

        <h1
          className="mt-8 text-5xl lg:text-7xl font-bold tracking-tight text-text-primary animate-fade-up"
          style={{ animationDelay: "0.12s" }}
        >
          Hi, I&rsquo;m {name}
        </h1>

        <p
          className="mt-6 text-lg lg:text-xl text-text-secondary max-w-xl animate-fade-up"
          style={{ animationDelay: "0.24s" }}
        >
          {title}
        </p>

        <div
          className="flex gap-4 mt-8 animate-fade-up"
          style={{ animationDelay: "0.36s" }}
        >
          {socials.map((s) => {
            const Icon = socialIconMap[s.platform] || Mail;
            return (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.platform}
                className="p-2 text-text-muted hover:text-text-primary transition-colors duration-300"
              >
                <Icon className="w-5 h-5" />
              </a>
            );
          })}
        </div>

        <div
          className="flex items-center gap-3 mt-10 animate-fade-up"
          style={{ animationDelay: "0.48s" }}
        >
          <a
            href="/about"
            className="text-sm text-text-muted hover:text-text-primary transition-colors px-4 py-2 rounded-full border border-border hover:border-accent-start/30"
          >
            关于
          </a>
          <button
            onClick={goProjects}
            className="text-sm text-text-muted hover:text-text-primary transition-colors px-4 py-2 rounded-full border border-border hover:border-accent-start/30 cursor-pointer"
          >
            项目
          </button>
          <button
            onClick={goBlog}
            className="text-sm text-text-muted hover:text-text-primary transition-colors px-4 py-2 rounded-full border border-border hover:border-accent-start/30 cursor-pointer"
          >
            博客
          </button>
        </div>

        <button
          onClick={goProjects}
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-accent-start to-accent-end text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer animate-fade-up"
          style={{ animationDelay: "0.6s" }}
        >
          查看我的作品
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </button>

        {/* Bottom scroll hint */}
        <div
          className="mt-24 w-px h-16 bg-gradient-to-b from-transparent via-text-muted to-transparent animate-fade-up"
          style={{ animationDelay: "0.72s" }}
        />
      </div>
    </section>
  );
}

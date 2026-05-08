"use client";

import { Mail } from "lucide-react";
import { GithubIcon, TwitterIcon, GiteeIcon, CsdnIcon } from "@/components/Icons";

interface SocialLink {
  platform: string;
  url: string;
}

interface Profile {
  name?: string;
  socialLinks?: SocialLink[];
}

interface Settings {
  footerText?: string;
}

const socialIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GitHub: GithubIcon,
  Twitter: TwitterIcon,
  X: TwitterIcon,
  Gitee: GiteeIcon,
  CSDN: CsdnIcon,
};

export default function Footer({
  profile,
  settings,
}: {
  profile: Profile | null;
  settings: Settings | null;
}) {
  const name = profile?.name;
  const socials = profile?.socialLinks || [];
  const footerText = settings?.footerText;

  return (
    <footer className="border-t border-border py-12 text-center">
      <div className="max-w-6xl mx-auto px-6">
        {socials.length > 0 && (
          <div className="flex justify-center gap-4 mb-6">
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
        )}
        <p className="text-sm text-text-muted">
          {footerText || (name ? `Designed & Built by ${name}` : `Built with Next.js & Sanity`)}
          {!footerText && ` · © ${new Date().getFullYear()}`}
        </p>
      </div>
    </footer>
  );
}

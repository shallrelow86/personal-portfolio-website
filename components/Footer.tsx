import Link from "next/link";
import type { Profile, Settings } from "@/lib/api";

export default function Footer({
  profile,
  settings,
}: {
  profile: Profile | null;
  settings: Settings | null;
}) {
  const socials = profile?.socialLinks || [];

  return (
    <footer className="border-t-2 border-border py-10">
      <div className="max-w-5xl mx-auto px-6">
        {socials.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-4">
            {socials.map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs uppercase tracking-wider text-text-muted hover:text-accent transition-colors"
              >
                {s.platform}
              </a>
            ))}
          </div>
        )}
        <p className="font-mono text-xs text-text-muted">
          {settings?.footerText || `© ${new Date().getFullYear()} ${profile?.name || ""}`}
        </p>
      </div>
    </footer>
  );
}

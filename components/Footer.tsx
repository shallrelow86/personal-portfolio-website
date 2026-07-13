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
    <footer className="border-t border-border mt-8">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <p className="font-mono text-[0.75rem] uppercase tracking-[0.12em] text-text-muted">
          {settings?.footerText || `© ${new Date().getFullYear()} ${profile?.name || ""}`}
        </p>
        {socials.length > 0 && (
          <div className="flex flex-wrap gap-5">
            {socials.map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-text-muted hover:text-accent transition-colors"
              >
                {s.platform}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}

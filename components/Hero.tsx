import Link from "next/link";
import type { Profile } from "@/lib/api";

export default function Hero({ profile }: { profile: Profile | null }) {
  const name = profile?.name || "Developer";
  const title = profile?.title || "";
  const socials = profile?.socialLinks || [];

  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div>
          <h1 className="font-display text-5xl md:text-7xl leading-tight">{name}</h1>
          {title && (
            <p className="font-mono text-sm uppercase tracking-wider text-text-secondary mt-4">{title}</p>
          )}
        </div>
        {socials.length > 0 && (
          <ul className="font-mono text-xs space-y-2">
            {socials.map((s) => (
              <li key={s.platform}>
                <Link href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                  {s.platform} →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

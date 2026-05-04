import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';

async function getNav() {
  try {
    const settings = await client.fetch(SITE_SETTINGS_QUERY);
    return settings?.primaryNav || [];
  } catch {
    return [];
  }
}

export default async function Header() {
  const nav = await getNav();

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-surface/90 backdrop-blur-sm">
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-mono text-lg font-bold tracking-tight text-foreground hover:text-primary transition-colors">
          <span className="text-primary">~</span>/portfolio
        </Link>
        <ul className="flex gap-8 text-sm font-mono">
          {nav.map((item: { label: string; url: string }) => (
            <li key={item.url}>
              <Link
                href={item.url}
                className="text-muted hover:text-primary transition-colors tracking-wide uppercase text-xs"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

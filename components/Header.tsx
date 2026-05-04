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
    <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-50">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-primary font-mono">
          <span className="text-muted">&gt;</span> Portfolio
          <span className="inline-block w-2 h-5 bg-primary ml-0.5 animate-pulse align-middle" />
        </Link>
        <ul className="flex gap-6 text-sm">
          {nav.map((item: { label: string; url: string }) => (
            <li key={item.url}>
              <Link
                href={item.url}
                className="text-muted hover:text-primary transition-colors link-underline"
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

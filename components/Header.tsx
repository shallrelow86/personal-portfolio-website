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
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg tracking-tight hover:text-primary transition-colors">
          {nav.length > 0 ? nav[0]?.label?.split('/')[0] : 'Portfolio'}
          <span className="text-primary">.</span>
        </Link>
        <nav className="flex gap-1">
          {nav.map((item: { label: string; url: string }) => (
            <Link
              key={item.url}
              href={item.url}
              className="px-3 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-md hover:bg-surface-alt"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

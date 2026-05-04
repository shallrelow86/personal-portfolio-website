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
    <header className="border-b">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          Portfolio
        </Link>
        <ul className="flex gap-6 text-sm">
          {nav.map((item: { label: string; url: string }) => (
            <li key={item.url}>
              <Link href={item.url} className="hover:text-blue-600 transition-colors">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

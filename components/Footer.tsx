import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';

async function getFooterText() {
  try {
    const settings = await client.fetch(SITE_SETTINGS_QUERY);
    return settings?.footerText || '';
  } catch {
    return '';
  }
}

export default async function Footer() {
  const footerText = await getFooterText();

  return (
    <footer className="border-t mt-auto">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-center text-sm text-gray-500">
        {footerText ? <p>{footerText}</p> : <p>&copy; {new Date().getFullYear()}</p>}
      </div>
    </footer>
  );
}

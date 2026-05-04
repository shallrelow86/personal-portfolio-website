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
    <footer className="border-t border-border mt-auto">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between text-xs font-mono text-muted">
        <span>{footerText || `© ${new Date().getFullYear()}`}</span>
        <span>
          <span className="text-border">built</span> with <span className="text-primary">[ code ]</span>
        </span>
      </div>
    </footer>
  );
}

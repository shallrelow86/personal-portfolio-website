import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

async function getSettings() {
  try {
    return await client.fetch(SITE_SETTINGS_QUERY);
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: settings?.siteTitle || 'Portfolio',
      template: `%s | ${settings?.siteTitle || 'Portfolio'}`,
    },
    description: settings?.siteDescription || '',
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

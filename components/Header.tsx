import Link from "next/link";
import { fetchApi, type Settings } from "@/lib/api";

export default async function Header() {
  const settings = await fetchApi<Settings>("/api/admin/settings");

  return (
    <header className="sticky top-0 z-50 bg-bg border-b-2 border-border">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl hover:text-accent transition-colors">
          {settings?.siteTitle || "Portfolio"}
        </Link>
        <nav className="flex gap-6">
          {(settings?.primaryNav || []).map((item) => (
            <Link
              key={item.url}
              href={item.url}
              className="font-mono text-xs uppercase tracking-wider text-text-secondary hover:text-accent transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

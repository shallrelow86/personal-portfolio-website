import Link from "next/link";
import { fetchSettings } from "@/lib/settings";
import HeaderNav from "@/components/HeaderNav";

export default async function Header() {
  const settings = await fetchSettings();

  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <Link href="/" className="font-display text-xl italic tracking-tight hover:text-accent transition-colors shrink-0">
          {settings?.siteTitle || "Portfolio"}
        </Link>
        <HeaderNav />
      </div>
    </header>
  );
}

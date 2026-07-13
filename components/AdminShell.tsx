"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "概览", icon: "▦", exact: true },
  { href: "/admin/posts", label: "文章", icon: "✎" },
  { href: "/admin/projects", label: "项目", icon: "◆" },
  { href: "/admin/bookmarks", label: "收藏", icon: "★" },
  { href: "/admin/categories", label: "分类", icon: "≡" },
  { href: "/admin/chat", label: "AI 助手", icon: "✦" },
  { href: "/admin/settings", label: "设置", icon: "⚙" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  const isFullBleed = pathname.startsWith("/admin/chat");

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className={`flex bg-bg ${isFullBleed ? "h-screen overflow-hidden" : "min-h-screen"}`}>
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-60 shrink-0 border-r border-border bg-surface flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-5 py-5 border-b border-border">
          <Link href="/admin" className="font-display text-xl tracking-tight">
            后台管理
          </Link>
          <p className="font-mono text-[11px] text-text-muted mt-0.5">Portfolio Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-accent-soft text-accent font-medium"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                }`}
              >
                <span className="w-4 text-center font-mono text-xs opacity-70">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t border-border space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-2"
          >
            <span className="w-4 text-center font-mono text-xs opacity-70">↗</span>
            查看站点
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-2 hover:text-accent cursor-pointer"
          >
            <span className="w-4 text-center font-mono text-xs opacity-70">⏻</span>
            退出登录
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {!isFullBleed && (
          <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b border-border bg-surface">
            <button
              onClick={() => setOpen(true)}
              className="brutal-btn !px-3 !py-1.5"
              aria-label="菜单"
            >
              ☰
            </button>
            <span className="font-display text-lg">后台管理</span>
          </header>
        )}
        <main
          className={
            isFullBleed
              ? "flex-1 flex flex-col min-h-0 overflow-hidden"
              : "flex-1 p-6 lg:p-10 max-w-6xl w-full mx-auto animate-fade-up"
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}

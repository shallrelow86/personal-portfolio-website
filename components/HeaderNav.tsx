"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import { useFullPage } from "@/components/FullPageScroll";
import { FULLPAGE_ACTIVE, emitFullPageScroll } from "@/lib/fullpage-events";

const NAV = [
  { label: "首页", href: "/", index: 0 },
  { label: "项目", href: "/projects", index: 1 },
  { label: "博客", href: "/blog", index: 2 },
  { label: "关于", href: "/about", index: null as number | null },
];

function isActive(pathname: string, href: string, index: number | null, homeActive: number | null) {
  if (pathname === "/") return index !== null && homeActive === index;
  if (href === "/") return false;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function HeaderNav() {
  const pathname = usePathname();
  const fullPage = useFullPage();
  const [homeActive, setHomeActive] = useState(0);

  useEffect(() => {
    const onActive = (e: Event) => setHomeActive((e as CustomEvent<number>).detail);
    window.addEventListener(FULLPAGE_ACTIVE, onActive);
    return () => window.removeEventListener(FULLPAGE_ACTIVE, onActive);
  }, []);

  const activeIndex = pathname === "/" ? (fullPage?.active ?? homeActive) : null;

  return (
    <nav className="flex items-center gap-2 md:gap-4">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href, item.index, activeIndex);
        const className = `relative px-2.5 md:px-3 py-2 font-mono text-[0.75rem] uppercase tracking-[0.18em] transition-colors ${
          active ? "text-text-primary" : "text-text-secondary hover:text-accent"
        }`;

        if (pathname === "/" && item.index !== null) {
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => {
                if (fullPage) fullPage.scrollTo(item.index!);
                else emitFullPageScroll(item.index!);
              }}
              className={className}
            >
              {item.label}
              {active && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute bottom-0.5 left-2.5 right-2.5 md:left-3 md:right-3 h-px bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        }

        return (
          <Link key={item.href} href={item.href} className={className}>
            {item.label}
            {active && (
              <motion.span
                layoutId="nav-indicator"
                className="absolute bottom-0.5 left-2.5 right-2.5 md:left-3 md:right-3 h-px bg-accent"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

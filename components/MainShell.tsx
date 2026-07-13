"use client";

import { usePathname } from "next/navigation";

export default function MainShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const isHome = usePathname() === "/";
  return (
    <>
      <main className={isHome ? "h-[calc(100vh-3.5rem)] overflow-hidden" : undefined}>
        {children}
      </main>
      {!isHome && footer}
    </>
  );
}

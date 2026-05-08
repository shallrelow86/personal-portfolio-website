"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function LayoutWrapper({
  children,
  header,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (isHome) {
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = "";
      };
    }
  }, [isHome]);

  if (isHome) return <>{children}</>;

  return (
    <>
      {header}
      <main className="min-h-screen">{children}</main>
    </>
  );
}

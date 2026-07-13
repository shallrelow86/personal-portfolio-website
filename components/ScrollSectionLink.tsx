"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFullPage } from "@/components/FullPageScroll";
import { emitFullPageScroll } from "@/lib/fullpage-events";

export default function ScrollSectionLink({
  index,
  href,
  className,
  children,
}: {
  index: number;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const fullPage = useFullPage();

  if (pathname === "/") {
    return (
      <button
        type="button"
        onClick={() => {
          if (fullPage) fullPage.scrollTo(index);
          else emitFullPageScroll(index);
        }}
        className={className}
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

"use client";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: isHome ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={isHome ? "h-full" : undefined}
    >
      {children}
    </motion.div>
  );
}

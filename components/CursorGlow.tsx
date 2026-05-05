"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "motion/react";

export default function CursorGlow() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [mouseX, mouseY]);

  const background = useMotionTemplate`radial-gradient(500px circle at ${springX}px ${springY}px, rgba(124, 58, 237, 0.06) 0%, transparent 60%)`;

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-0"
      style={{ background }}
    />
  );
}

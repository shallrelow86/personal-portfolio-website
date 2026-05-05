"use client";

import { useState, useEffect } from "react";

interface Section {
  id: string;
  label: string;
}

export default function ScrollIndicator({ sections }: { sections: Section[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const viewHeight = window.innerHeight;
      const index = Math.round(scrollTop / viewHeight);
      setActiveIndex(Math.min(index, sections.length - 1));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections.length]);

  const scrollTo = (index: number) => {
    const el = document.getElementById(sections[index].id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  if (sections.length <= 1) return null;

  return (
    <div className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-40 flex-col items-center gap-4">
      {sections.map((s, i) => (
        <button
          key={s.id}
          onClick={() => scrollTo(i)}
          aria-label={s.label}
          className="group flex items-center gap-3"
        >
          <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity font-mono">
            {s.label}
          </span>
          <span
            className={`block w-2 h-2 rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "bg-accent-start scale-125 shadow-[0_0_8px_rgba(124,58,237,0.5)]"
                : "bg-border hover:bg-text-muted"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

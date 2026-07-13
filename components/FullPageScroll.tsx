"use client";

import {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FULLPAGE_ACTIVE, FULLPAGE_SCROLL } from "@/lib/fullpage-events";

type FullPageContextValue = {
  active: number;
  scrollTo: (index: number) => void;
};

export const FullPageContext = createContext<FullPageContextValue | null>(null);

export function useFullPage() {
  return useContext(FullPageContext);
}

const PANEL_H = "calc(100vh - 3.5rem)";

export default function FullPageScroll({
  children,
  sectionCount,
}: {
  children: ReactNode;
  sectionCount: number;
}) {
  const [active, setActive] = useState(0);
  const locking = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);

  const scrollTo = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(sectionCount - 1, index));
      if (next === activeRef.current || locking.current) return;
      locking.current = true;
      activeRef.current = next;
      setActive(next);
      window.dispatchEvent(new CustomEvent(FULLPAGE_ACTIVE, { detail: next }));
      window.setTimeout(() => {
        locking.current = false;
      }, 750);
    },
    [sectionCount],
  );

  useEffect(() => {
    const onScrollRequest = (e: Event) => {
      scrollTo((e as CustomEvent<number>).detail);
    };
    window.addEventListener(FULLPAGE_SCROLL, onScrollRequest);
    window.dispatchEvent(new CustomEvent(FULLPAGE_ACTIVE, { detail: 0 }));
    return () => window.removeEventListener(FULLPAGE_SCROLL, onScrollRequest);
  }, [scrollTo]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (locking.current) return;
      if (Math.abs(e.deltaY) < 8) return;
      scrollTo(activeRef.current + (e.deltaY > 0 ? 1 : -1));
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        scrollTo(activeRef.current + 1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        scrollTo(activeRef.current - 1);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [scrollTo]);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const panels = Children.toArray(children);

  return (
    <FullPageContext.Provider value={{ active, scrollTo }}>
      <div
        ref={containerRef}
        className="relative overflow-hidden"
        style={{ height: PANEL_H }}
      >
        <div
          className="transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
          style={{ transform: `translateY(calc(-${active} * (${PANEL_H})))` }}
        >
          {panels.map((panel, i) => (
            <div key={i} className="w-full overflow-hidden" style={{ height: PANEL_H }}>
              {panel}
            </div>
          ))}
        </div>
        <div className="fixed right-4 top-[38%] -translate-y-1/2 z-40 flex flex-col gap-3">
          {Array.from({ length: sectionCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`第 ${i + 1} 屏`}
              onClick={() => scrollTo(i)}
              className={`w-px transition-all duration-300 ${
                active === i ? "h-8 bg-accent" : "h-4 bg-border hover:bg-text-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </FullPageContext.Provider>
  );
}

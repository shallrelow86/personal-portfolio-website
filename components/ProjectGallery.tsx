"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type ReactNode } from "react";

export default function ProjectMedia({
  title,
  coverImage,
  screenshots,
  children,
}: {
  title: string;
  coverImage: string;
  screenshots: string[];
  children: ReactNode;
}) {
  const images = [
    ...(coverImage ? [coverImage] : []),
    ...screenshots.filter((u) => u && u !== coverImage),
  ];
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const show = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const close = useCallback(() => setOpen(false), []);
  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);
  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, prev, next]);

  const shotStart = coverImage ? 1 : 0;

  return (
    <>
      {coverImage && (
        <button
          type="button"
          onClick={() => show(0)}
          className="block w-full mt-8 mb-10 cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl overflow-hidden"
        >
          <Image
            src={coverImage}
            alt={title}
            width={1024}
            height={288}
            className="w-full aspect-[21/9] object-cover"
          />
        </button>
      )}
      {!coverImage && <div className="mt-8" />}

      {children}

      {screenshots.length > 0 && (
        <div className="ink-grid grid-cols-1 md:grid-cols-2 mt-12">
          {screenshots.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => show(shotStart + i)}
              className="block w-full text-left cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Image
                src={url}
                alt={`${title} 截图 ${i + 1}`}
                width={800}
                height={500}
                className="w-full h-auto object-cover transition-opacity hover:opacity-90"
              />
            </button>
          ))}
        </div>
      )}

      {open && images.length > 0 && (
        <div
          className="fixed inset-0 z-[100] bg-ink/90 flex items-center justify-center p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={close}
            className="absolute top-5 right-5 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-bg/80 hover:text-bg"
          >
            关闭 Esc
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 md:left-8 font-mono text-bg/80 hover:text-bg text-2xl"
                aria-label="上一张"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 md:right-8 font-mono text-bg/80 hover:text-bg text-2xl"
                aria-label="下一张"
              >
                ›
              </button>
            </>
          )}
          <div className="relative max-w-5xl w-full max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[index]}
              alt={`${title} ${index + 1}`}
              className="w-full h-auto max-h-[85vh] object-contain mx-auto"
            />
            <p className="mt-3 text-center font-mono text-[0.75rem] uppercase tracking-[0.15em] text-bg/60">
              {index + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

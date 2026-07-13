"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useChatStream } from "@/hooks/useChatStream";

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { messages, input, setInput, loading, send, bottomRef } = useChatStream("/api/chat/public");

  useEffect(() => {
    const handler = () => setOpen(true);
    document.addEventListener("open-chat", handler);
    const btn = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.closest("[data-open-chat]")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("click", btn);
    return () => {
      document.removeEventListener("open-chat", handler);
      document.removeEventListener("click", btn);
    };
  }, []);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-8 right-6 z-50 w-12 h-12 rounded-[var(--radius-sm)] bg-ink text-bg border border-ink hover:bg-accent hover:border-accent transition-colors cursor-pointer flex items-center justify-center font-mono text-[0.75rem] uppercase tracking-wider shadow-[0_8px_24px_-8px_rgba(12,12,11,0.35)]"
            aria-label="打开 AI 助手"
          >
            AI
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-8 right-6 z-50 w-[min(380px,calc(100vw-2rem))] h-[min(520px,calc(100vh-6rem))] rounded-[var(--radius-md)] bg-surface border border-border shadow-[0_24px_64px_-16px_rgba(12,12,11,0.2)] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-bg/50">
              <div>
                <p className="font-display text-lg italic">AI 助手</p>
                <p className="font-mono text-[0.75rem] uppercase tracking-[0.15em] text-text-muted">知识库问答</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-[var(--radius-sm)] border border-border flex items-center justify-center text-text-muted hover:text-accent hover:border-accent transition-colors cursor-pointer"
                aria-label="关闭"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <p className="font-mono text-xs text-text-muted text-center py-8">有什么想了解的？</p>
              )}
              {messages.map((m, idx) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed rounded-[var(--radius-sm)] ${
                      m.role === "user"
                        ? "bg-ink text-bg"
                        : "bg-surface-2 text-text-secondary"
                    }`}
                  >
                    {m.text || (loading && idx === messages.length - 1 ? (
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse" />
                        <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-pulse [animation-delay:300ms]" />
                      </span>
                    ) : "")}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-border bg-bg/30">
              <div className="flex gap-2 items-stretch">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="输入问题..."
                  disabled={loading}
                  className="flex-1 brutal-input !py-0 h-10 text-sm"
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="w-10 h-10 rounded-[var(--radius-sm)] bg-ink text-white flex items-center justify-center hover:bg-accent disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                  aria-label="发送"
                >
                  →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

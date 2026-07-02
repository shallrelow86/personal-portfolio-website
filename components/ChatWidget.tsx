"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

type Message = { role: "user" | "ai"; text: string };

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (pathname.startsWith("/admin")) return null;

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);

    let aiText = "";
    setMessages((m) => [...m, { role: "ai", text: "" }]);

    try {
      const res = await fetch("/api/chat/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "ai", text: err.error || "请求失败" };
          return copy;
        });
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const json = JSON.parse(data);
            if (json.token) {
              aiText += json.token;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "ai", text: aiText };
                return copy;
              });
            }
          } catch {}
        }
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "ai", text: "连接失败，请稍后重试" };
        return copy;
      });
    }
    setLoading(false);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 brutal-tag bg-surface border-2 border-border px-4 py-2 font-mono text-xs uppercase tracking-wider hover:border-accent hover:text-accent transition-colors cursor-pointer shadow-lg"
        >
          问问 AI
        </button>
      )}
      {open && (
        <div className="fixed top-0 right-0 z-50 w-[300px] h-full border-l-2 border-border bg-bg flex flex-col shadow-2xl">
          <div className="flex items-center justify-between border-b-2 border-border px-4 py-3">
            <span className="font-mono text-xs uppercase tracking-wider">AI 助手</span>
            <button onClick={() => setOpen(false)} className="font-mono text-xs text-text-muted hover:text-accent">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="font-mono text-xs text-text-muted">有什么想了解的？</p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`border-2 border-border p-3 text-sm ${
                  m.role === "user" ? "bg-surface font-mono ml-4" : "bg-bg mr-4"
                }`}
              >
                {m.text || (loading && i === messages.length - 1 ? "..." : "")}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="border-t-2 border-border p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="输入问题..."
              disabled={loading}
              className="flex-1 border-2 border-border bg-bg px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent"
            />
            <button
              onClick={send}
              disabled={loading}
              className="border-2 border-border px-3 py-2 font-mono text-xs uppercase hover:border-accent hover:text-accent disabled:opacity-40 cursor-pointer"
            >
              发送
            </button>
          </div>
        </div>
      )}
    </>
  );
}

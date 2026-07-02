"use client";
import { useState, useRef, useEffect } from "react";
import BrutalButton from "@/components/ui/BrutalButton";

type Message = { role: "user" | "ai"; text: string };

export default function AdminChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);

    let aiText = "";
    setMessages((m) => [...m, { role: "ai", text: "" }]);

    try {
      const res = await fetch("/api/chat/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "ai", text: "未授权或请求失败" };
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
        copy[copy.length - 1] = { role: "ai", text: "连接失败" };
        return copy;
      });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">AI 助手</h1>
        <BrutalButton href="/admin">Back</BrutalButton>
      </div>
      <div className="flex-1 overflow-y-auto border-2 border-border bg-surface p-4 space-y-3 mb-4">
        {messages.length === 0 && (
          <p className="font-mono text-sm text-text-muted">问我关于网站内容的问题，或寻求管理建议。</p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`border-2 border-border p-3 text-sm ${
              m.role === "user" ? "bg-bg font-mono ml-8" : "bg-surface mr-8"
            }`}
          >
            {m.text || (loading && i === messages.length - 1 ? "..." : "")}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="输入指令或问题..."
          disabled={loading}
          className="flex-1 border-2 border-border bg-bg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-accent"
        />
        <BrutalButton onClick={send} disabled={loading}>
          {loading ? "..." : "Send"}
        </BrutalButton>
      </div>
    </div>
  );
}

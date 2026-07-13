"use client";
import { useState, useRef, useEffect, useCallback } from "react";

export type ChatMessage = { id: number; role: "user" | "ai"; text: string };
let nextId = 1;

const MAX_HISTORY_TURNS = 6;

export function useChatStream(endpoint: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: ChatMessage = { id: nextId++, role: "user", text };
    const aiMsg: ChatMessage = { id: nextId++, role: "ai", text: "" };
    const prior = messagesRef.current;
    setMessages((m) => [...m, userMsg, aiMsg]);
    setLoading(true);

    const history = prior.slice(-MAX_HISTORY_TURNS * 2).map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("assistant" as const),
      content: m.text,
    }));

    let aiText = "";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { ...copy[copy.length - 1], text: err.error || "请求失败" };
          return copy;
        });
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            if (json.error) {
              aiText = json.error;
            } else if (json.status) {
              aiText = json.status;
            } else if (json.token) {
              if (aiText === "正在检索资料...") aiText = "";
              aiText += json.token;
            }
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = { ...copy[copy.length - 1], text: aiText };
              return copy;
            });
          } catch {}
        }
      }
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { ...copy[copy.length - 1], text: "连接失败，请稍后重试" };
        return copy;
      });
    }
    setLoading(false);
  }, [endpoint, input, loading]);

  return { messages, input, setInput, loading, send, bottomRef };
}

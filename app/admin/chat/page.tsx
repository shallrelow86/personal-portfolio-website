"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Markdown from "@/components/Markdown";
import PreviewConfirmCard from "@/components/admin/PreviewConfirmCard";
import type { PreviewEvent } from "@/lib/preview-types";

type Conversation = { id: number; title: string; updatedAt: number };
type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  previews?: PreviewEvent[];
};

const PROMPTS = [
  "帮我列一下所有项目",
  "写一篇关于 Next.js 的文章",
  "创建一个叫「前端」的分类",
];

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingConv, setLoadingConv] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ragOk, setRagOk] = useState(true);
  const [toast, setToast] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadConversations = useCallback(async () => {
    const res = await fetch("/api/admin/conversations");
    const data = await res.json();
    setConversations(data);
  }, []);

  useEffect(() => {
    loadConversations();
    fetch("/api/admin/ai-status")
      .then((r) => r.json())
      .then((d) => setRagOk(Boolean(d.embed)))
      .catch(() => {});
  }, [loadConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const openConversation = async (id: number) => {
    setCurrentId(id);
    setLoadingConv(true);
    setSidebarOpen(false);
    const res = await fetch(`/api/admin/conversations/${id}`);
    const data = await res.json();
    setMessages(data.messages || []);
    setLoadingConv(false);
  };

  const newConversation = async () => {
    const res = await fetch("/api/admin/conversations", { method: "POST" });
    const data = await res.json();
    await loadConversations();
    await openConversation(data.id);
  };

  const deleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("删除这个对话？")) return;
    await fetch(`/api/admin/conversations/${id}`, { method: "DELETE" });
    if (currentId === id) {
      setCurrentId(null);
      setMessages([]);
    }
    loadConversations();
  };

  const dismissPreview = (msgId: number, previewIdx: number) => {
    setMessages((m) =>
      m.map((msg) => {
        if (msg.id !== msgId || !msg.previews) return msg;
        return { ...msg, previews: msg.previews.filter((_, i) => i !== previewIdx) };
      })
    );
  };

  const send = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;
    setInput("");

    let convId = currentId;
    if (!convId) {
      const res = await fetch("/api/admin/conversations", { method: "POST" });
      const data = await res.json();
      convId = data.id;
      setCurrentId(convId);
      await loadConversations();
    }

    const userMsg: Message = { id: Date.now(), role: "user", content: text };
    const aiMsg: Message = { id: Date.now() + 1, role: "assistant", content: "", previews: [] };
    setMessages((m) => [...m, userMsg, aiMsg]);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/admin/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "请求失败" }));
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: err.error || "请求失败" };
          return copy;
        });
        setLoading(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let full = "";
      let buffer = "";
      const previews: PreviewEvent[] = [];

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
            if (json.error) full = json.error;
            else if (json.token) full += json.token;
            else if (json.preview) previews.push(json.preview as PreviewEvent);
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = {
                ...copy[copy.length - 1],
                content: full,
                previews: [...previews],
              };
              return copy;
            });
          } catch {}
        }
      }
      loadConversations();
    } catch {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { ...copy[copy.length - 1], content: "连接失败，请稍后重试" };
        return copy;
      });
    }
    setLoading(false);
  };

  const stop = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  return (
    <div className="flex flex-1 min-h-0 h-full relative">
      {toast && (
        <div className="absolute top-4 right-4 z-50 px-4 py-2 rounded-lg bg-ink text-bg text-sm shadow-lg">
          {toast}
        </div>
      )}
      <aside
        className={`shrink-0 w-[260px] border-r border-border bg-surface flex flex-col ${
          sidebarOpen ? "fixed inset-y-0 left-60 z-50 w-[260px] shadow-xl lg:static lg:shadow-none" : "hidden lg:flex"
        }`}
      >
        <div className="p-4 border-b border-border">
          <button
            onClick={newConversation}
            className="w-full brutal-btn brutal-btn-primary justify-center gap-2 shadow-sm"
          >
            <span className="text-lg leading-none">+</span>
            新建对话
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {conversations.length === 0 && (
            <p className="text-text-muted text-xs px-3 py-6 text-center leading-relaxed">
              还没有对话<br />点上方按钮开始
            </p>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => openConversation(c.id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl group transition-all ${
                currentId === c.id
                  ? "bg-accent-soft border border-accent/20 shadow-sm"
                  : "hover:bg-surface-2 border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-sm truncate ${
                    currentId === c.id ? "text-accent font-medium" : "text-text-primary"
                  }`}
                >
                  {c.title}
                </span>
                <span
                  onClick={(e) => deleteConversation(c.id, e)}
                  className="text-text-muted hover:text-accent text-xs opacity-0 group-hover:opacity-100 shrink-0 px-1"
                >
                  ✕
                </span>
              </div>
              <div className="text-[10px] text-text-muted font-mono mt-1">
                {new Date(c.updatedAt).toLocaleString("zh-CN", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </button>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-gradient-to-b from-surface-2/40 to-bg">
        <header className="shrink-0 flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border/80 bg-surface/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden brutal-btn !px-2.5 !py-1.5"
              aria-label="对话列表"
            >
              ☰
            </button>
            <div>
              <h1 className="font-display text-lg leading-tight">AI 助手</h1>
              <p className="text-text-muted text-[11px] font-mono truncate">
                可创建文章 / 项目 / 分类（确认后写入）
              </p>
            </div>
          </div>
          {!ragOk && (
            <span className="shrink-0 text-[10px] font-mono px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              检索离线
            </span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6">
          {currentId === null ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-accent-soft border border-accent/20 flex items-center justify-center text-2xl mb-5 shadow-sm">
                ✦
              </div>
              <h2 className="font-display text-2xl mb-2">有什么可以帮你？</h2>
              <p className="text-text-muted text-sm mb-8 leading-relaxed">
                管理文章、项目、分类，确认预览后写入知识库
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="text-xs px-3 py-2 rounded-full border border-border bg-surface hover:border-accent hover:text-accent transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button onClick={newConversation} className="brutal-btn brutal-btn-primary">
                + 新建对话
              </button>
            </div>
          ) : loadingConv ? (
            <div className="flex items-center justify-center h-full gap-2 text-text-muted text-sm">
              <span className="inline-block w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
              加载中…
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <p className="text-text-muted text-sm">输入消息开始对话</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="text-xs px-3 py-2 rounded-full border border-border bg-surface hover:border-accent hover:text-accent transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-5 pb-4">
              {messages.map((m, idx) => (
                <div
                  key={m.id}
                  className={`flex gap-3 animate-fade-up ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-mono shrink-0 shadow-sm ${
                      m.role === "user"
                        ? "bg-border-strong text-white"
                        : "bg-accent-soft text-accent border border-accent/15"
                    }`}
                  >
                    {m.role === "user" ? "我" : "AI"}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm max-w-[85%] shadow-sm ${
                      m.role === "user"
                        ? "bg-border-strong text-white rounded-tr-md"
                        : "bg-surface border border-border rounded-tl-md"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <>
                        <Markdown
                          content={
                            m.content ||
                            (loading && idx === messages.length - 1 ? "…" : "")
                          }
                        />
                        {loading && idx === messages.length - 1 && !m.content && (
                          <span className="inline-flex gap-1 py-1">
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-accent/60 animate-pulse"
                                style={{ animationDelay: `${i * 150}ms` }}
                              />
                            ))}
                          </span>
                        )}
                        {m.previews?.map((p, pi) => (
                          <PreviewConfirmCard
                            key={`${m.id}-${pi}-${p.type}`}
                            preview={p}
                            onDismiss={() => dismissPreview(m.id, pi)}
                            onSuccess={(msg) => {
                              dismissPreview(m.id, pi);
                              setToast(msg);
                            }}
                          />
                        ))}
                      </>
                    ) : (
                      <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border bg-surface/90 backdrop-blur-sm p-4">
          <div className="max-w-2xl mx-auto flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="输入消息，Enter 发送，Shift+Enter 换行"
              rows={1}
              disabled={loading}
              className="brutal-input flex-1 resize-none max-h-32 shadow-sm"
              style={{ minHeight: "44px" }}
            />
            {loading ? (
              <button onClick={stop} className="brutal-btn shrink-0">
                停止
              </button>
            ) : (
              <button
                onClick={() => send()}
                disabled={!input.trim()}
                className="brutal-btn brutal-btn-primary shrink-0 shadow-sm"
              >
                发送
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

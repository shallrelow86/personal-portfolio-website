import { chatWithHistory } from "@/lib/chat-engine";
import { checkRateLimit } from "@/lib/rate-limit";
import { formatChatError } from "@/lib/chat-errors";

const MAX_MESSAGE = 2000;
const MAX_HISTORY = 12;
const MAX_HISTORY_CHARS = 3000;
const HEARTBEAT_MS = 15_000;

type HistoryItem = { role: "user" | "assistant"; content: string };

function normalizeHistory(raw: unknown): HistoryItem[] {
  if (!Array.isArray(raw)) return [];
  const parsed: HistoryItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
    const text = content.trim().slice(0, MAX_MESSAGE);
    if (!text) continue;
    parsed.push({ role, content: text });
  }
  let chars = 0;
  const out: HistoryItem[] = [];
  for (const m of [...parsed].reverse()) {
    chars += m.content.length;
    if (chars > MAX_HISTORY_CHARS) break;
    out.unshift(m);
  }
  return out.slice(-MAX_HISTORY);
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

  const minCheck = checkRateLimit(`ai-public:min:${ip}`, 5, 60_000);
  if (!minCheck.allowed) {
    return Response.json({ error: "Too many requests. Wait a minute." }, { status: 429 });
  }

  const dayCheck = checkRateLimit(`ai-public:day:${ip}`, 50, 86_400_000);
  if (!dayCheck.allowed) {
    return Response.json({ error: "Daily limit reached." }, { status: 429 });
  }

  let body: { message?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return Response.json({ error: "Message required" }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE) {
    return Response.json({ error: `Message too long (max ${MAX_MESSAGE})` }, { status: 400 });
  }

  const prior = normalizeHistory(body.history);
  const history: HistoryItem[] = [...prior, { role: "user", content: message }];

  const abort = new AbortController();
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {}
      }, HEARTBEAT_MS);
      try {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: "正在检索资料..." })}\n\n`));
        await chatWithHistory(history, { role: "public", signal: abort.signal }, (token) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
        });
      } catch (e) {
        const aborted = e instanceof Error && (e.name === "AbortError" || /aborted/i.test(e.message));
        const msg = aborted ? null : formatChatError(e);
        if (msg) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
      } finally {
        clearInterval(heartbeat);
        try {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch {}
      }
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

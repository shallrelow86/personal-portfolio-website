import { requireAdmin } from "@/lib/auth";
import { chat } from "@/lib/chat-engine";
import { formatChatError } from "@/lib/chat-errors";

const MAX_MESSAGE = 4000;
const HEARTBEAT_MS = 15_000;

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  let body: { message?: unknown };
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
        await chat(message, { role: "admin", signal: abort.signal }, (token) => {
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

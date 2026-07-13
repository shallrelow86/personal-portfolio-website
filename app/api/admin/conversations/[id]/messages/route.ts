import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { chatWithHistory } from "@/lib/chat-engine";
import { formatChatError } from "@/lib/chat-errors";

const MAX_MESSAGE = 4000;
const HEARTBEAT_MS = 15_000;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const conversationId = Number(id);
  if (!Number.isFinite(conversationId) || conversationId <= 0) {
    return Response.json({ error: "Invalid conversation id" }, { status: 400 });
  }

  let body: { message?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return Response.json({ error: "message required" }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE) {
    return Response.json({ error: `Message too long (max ${MAX_MESSAGE})` }, { status: 400 });
  }

  const conv = await db
    .select()
    .from(schema.conversation)
    .where(eq(schema.conversation.id, conversationId))
    .get();
  if (!conv) return Response.json({ error: "Not found" }, { status: 404 });

  const now = Date.now();
  const userMsgId = Number(
    (await db.insert(schema.message).values({
      conversationId,
      role: "user",
      content: message,
      createdAt: now,
    })).lastInsertRowid
  );

  const isFirst = conv.title === "新对话";
  const title = isFirst ? message.slice(0, 30) : conv.title;

  const priorMessages = await db
    .select()
    .from(schema.message)
    .where(eq(schema.message.conversationId, conversationId))
    .orderBy(asc(schema.message.createdAt));

  const history = priorMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const abort = new AbortController();
  const encoder = new TextEncoder();
  const reqSignal = (req as Request & { signal?: AbortSignal }).signal;
  if (reqSignal) {
    if (reqSignal.aborted) abort.abort();
    else reqSignal.addEventListener("abort", () => abort.abort(), { once: true });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {}
      }, HEARTBEAT_MS);
      let full = "";
      let failed = false;
      try {
        full = await chatWithHistory(
          history,
          {
            role: "admin",
            signal: abort.signal,
            onPreview: (preview) => {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ preview })}\n\n`));
            },
          },
          (token) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
          }
        );
      } catch (e) {
        failed = true;
        const aborted = e instanceof Error && (e.name === "AbortError" || /aborted/i.test(e.message));
        const msg = aborted
          ? null
          : formatChatError(e);
        if (msg) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`));
      } finally {
        clearInterval(heartbeat);
      }

      if (full) {
        await db.insert(schema.message).values({
          conversationId,
          role: "assistant",
          content: full,
          createdAt: Date.now(),
        });
        await db
          .update(schema.conversation)
          .set({ updatedAt: Date.now(), title })
          .where(eq(schema.conversation.id, conversationId));
      } else if (failed) {
        await db.delete(schema.message).where(eq(schema.message.id, userMsgId));
      }

      try {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch {}
    },
    cancel() {
      abort.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

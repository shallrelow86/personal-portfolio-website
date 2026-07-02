import { requireAdmin } from "@/lib/auth";
import { chat } from "@/lib/chat-engine";

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const { message } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await chat(message, { role: "admin" }, (token) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
        });
      } catch (e) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Chat failed" })}\n\n`));
      }
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

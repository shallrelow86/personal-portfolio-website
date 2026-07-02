import { chat } from "@/lib/chat-engine";
import { checkRateLimit } from "@/lib/rate-limit";

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

  const { message } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await chat(message, { role: "public" }, (token) => {
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

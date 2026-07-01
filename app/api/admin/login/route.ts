import { createToken, setAuthCookie, verifyPassword } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const { allowed } = checkRateLimit(`login:${ip}`, 5, 60_000);
  if (!allowed) {
    return Response.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const { password } = await req.json();
  if (!password) {
    return Response.json({ error: "Password required" }, { status: 400 });
  }
  const valid = await verifyPassword(password);
  if (!valid) {
    return Response.json({ error: "Invalid password" }, { status: 401 });
  }
  const token = await createToken();
  await setAuthCookie(token);
  return Response.json({ ok: true });
}

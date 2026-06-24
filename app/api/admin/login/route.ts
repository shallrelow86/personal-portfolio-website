import { createToken, setAuthCookie, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
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

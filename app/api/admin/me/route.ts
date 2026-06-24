import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;
  return Response.json({ ok: true });
}

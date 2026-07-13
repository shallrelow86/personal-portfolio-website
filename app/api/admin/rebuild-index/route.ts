import { requireAdmin } from "@/lib/auth";
import { rebuildAllEmbeddings } from "@/lib/sync-embedding";

export async function POST() {
  const err = await requireAdmin();
  if (err) return err;
  const result = await rebuildAllEmbeddings();
  return Response.json({ ok: true, ...result });
}

import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const numId = Number(id);

  const conv = await db
    .select()
    .from(schema.conversation)
    .where(eq(schema.conversation.id, numId))
    .get();
  if (!conv) return Response.json({ error: "Not found" }, { status: 404 });

  const messages = await db
    .select()
    .from(schema.message)
    .where(eq(schema.message.conversationId, numId))
    .orderBy(asc(schema.message.createdAt));

  return Response.json({ ...conv, messages });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const numId = Number(id);

  await db.delete(schema.message).where(eq(schema.message.conversationId, numId));
  await db.delete(schema.conversation).where(eq(schema.conversation.id, numId));

  return Response.json({ ok: true });
}

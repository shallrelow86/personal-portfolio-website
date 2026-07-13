import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const conversations = await db
    .select()
    .from(schema.conversation)
    .orderBy(desc(schema.conversation.updatedAt));

  return Response.json(conversations);
}

export async function POST() {
  const err = await requireAdmin();
  if (err) return err;

  const now = Date.now();
  const result = await db.insert(schema.conversation).values({
    title: "新对话",
    createdAt: now,
    updatedAt: now,
  });

  return Response.json({ id: Number(result.lastInsertRowid) }, { status: 201 });
}

import { requireAdmin } from "@/lib/auth";
import { isAiConfigured } from "@/lib/env";
import { db, schema } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const ai = isAiConfigured();
  let indexCount = 0;
  try {
    const row = await db.select({ c: sql<number>`count(*)` }).from(schema.embedding).get();
    indexCount = Number(row?.c || 0);
  } catch {}

  return Response.json({
    llm: ai.llm,
    embed: ai.embed,
    llmLocal: ai.llmLocal,
    embedLocal: ai.embedLocal,
    llmModel: ai.llmModel,
    embedModel: ai.embedModel,
    deepseek: ai.llm,
    siliconflow: ai.embed,
    indexCount,
    cos: Boolean(
      process.env.COS_SECRET_ID &&
        process.env.COS_SECRET_KEY &&
        process.env.COS_BUCKET &&
        process.env.COS_REGION
    ),
  });
}

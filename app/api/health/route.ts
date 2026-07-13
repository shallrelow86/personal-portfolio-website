import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    await db.select({ id: schema.siteSettings.id }).from(schema.siteSettings).where(eq(schema.siteSettings.id, 1)).get();
    return Response.json({ status: "ok", ts: Date.now() });
  } catch {
    return Response.json({ status: "error" }, { status: 503 });
  }
}

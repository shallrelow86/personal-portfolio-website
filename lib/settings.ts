import { db, schema } from "./db";
import { eq } from "drizzle-orm";
import { parseJsonField } from "./json";

export async function fetchSettings() {
  const row = await db.select().from(schema.siteSettings).where(eq(schema.siteSettings.id, 1)).get();
  if (!row) return null;
  return {
    siteTitle: row.siteTitle,
    siteDescription: row.siteDescription,
    ogImage: row.ogImage,
    primaryNav: parseJsonField<{ label: string; url: string }[]>(row.primaryNav, []),
    footerText: row.footerText,
  };
}

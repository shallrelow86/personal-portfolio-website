import { db, schema } from "@/lib/db";
import { parseJsonField } from "@/lib/json";

export async function GET() {
  const settings = await db.select().from(schema.siteSettings).get();
  if (!settings) return Response.json(null, { status: 404 });
  return Response.json({
    siteTitle: settings.siteTitle,
    siteDescription: settings.siteDescription,
    ogImage: settings.ogImage,
    primaryNav: parseJsonField<{ label: string; url: string }[]>(settings.primaryNav, []),
    footerText: settings.footerText,
  });
}

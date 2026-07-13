import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { parseJsonField } from "@/lib/json";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;
  const settings = await db.select().from(schema.siteSettings).get();
  if (!settings) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({
    ...settings,
    primaryNav: parseJsonField<{ label: string; url: string }[]>(settings.primaryNav, []),
  });
}

export async function PUT(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const body = await req.json();
  await db
    .update(schema.siteSettings)
    .set({
      siteTitle: body.siteTitle,
      siteDescription: body.siteDescription,
      ogImage: body.ogImage || "",
      primaryNav: JSON.stringify(body.primaryNav || []),
      footerText: body.footerText || "",
    })
    .where(eq(schema.siteSettings.id, 1));

  return Response.json({ ok: true });
}

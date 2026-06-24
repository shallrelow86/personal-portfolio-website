import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET() {
  const profile = await db.select().from(schema.profile).get();
  if (!profile)
    return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json({
    ...profile,
    skills: JSON.parse(profile.skills),
    socialLinks: JSON.parse(profile.socialLinks),
  });
}

export async function PUT(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const body = await req.json();
  await db
    .update(schema.profile)
    .set({
      name: body.name,
      title: body.title,
      bio: body.bio || "",
      avatar: body.avatar || "",
      skills: JSON.stringify(body.skills || []),
      socialLinks: JSON.stringify(body.socialLinks || []),
      resumeFile: body.resumeFile || "",
    })
    .where(eq(schema.profile.id, 1));

  return Response.json({ ok: true });
}

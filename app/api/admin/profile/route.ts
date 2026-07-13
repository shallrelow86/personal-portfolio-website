import { requireAdmin } from "@/lib/auth";
import { fetchProfile } from "@/lib/profile";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { syncEmbedding } from "@/lib/sync-embedding";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;
  const profile = await fetchProfile();
  if (!profile) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(profile);
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

  await syncEmbedding("profile", 1);
  return Response.json({ ok: true });
}

import { db, schema } from "./db";
import { eq } from "drizzle-orm";
import { parseJsonArray, parseJsonField } from "./json";

export type SocialLink = { platform: string; url: string };

export async function fetchProfile() {
  const row = await db.select().from(schema.profile).where(eq(schema.profile.id, 1)).get();
  if (!row) return null;
  return {
    ...row,
    skills: parseJsonArray<string>(row.skills),
    socialLinks: parseJsonField<SocialLink[]>(row.socialLinks, []),
  };
}

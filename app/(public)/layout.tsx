import Header from "@/components/Header";
import MainShell from "@/components/MainShell";
import Footer from "@/components/Footer";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { parseJsonArray, parseJsonField } from "@/lib/json";
import type { Profile, Settings, SocialLink } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [profileRow, settingsRow] = await Promise.all([
    db.select().from(schema.profile).where(eq(schema.profile.id, 1)).get(),
    db.select().from(schema.siteSettings).where(eq(schema.siteSettings.id, 1)).get(),
  ]);

  const profile: Profile | null = profileRow
    ? {
        ...profileRow,
        skills: parseJsonArray(profileRow.skills),
        socialLinks: parseJsonField<SocialLink[]>(profileRow.socialLinks, []),
      }
    : null;

  const settings: Settings | null = settingsRow
    ? {
        ...settingsRow,
        primaryNav: parseJsonField(settingsRow.primaryNav, []),
      }
    : null;

  return (
    <>
      <Header />
      <MainShell footer={<Footer profile={profile} settings={settings} />}>
        {children}
      </MainShell>
    </>
  );
}

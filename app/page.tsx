export const dynamic = "force-dynamic";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Blog from "@/components/Blog";
import Footer from "@/components/Footer";
import { db, schema } from "@/lib/db";
import { desc, asc, eq } from "drizzle-orm";
import type { Post, Project, Profile, Settings, SocialLink } from "@/lib/api";

export default async function HomePage() {
  const [postRows, projectRows, profileRow, settingsRow] = await Promise.all([
    db.select({
      id: schema.post.id, title: schema.post.title, slug: schema.post.slug,
      excerpt: schema.post.excerpt, tags: schema.post.tags,
      coverImage: schema.post.coverImage, publishedAt: schema.post.publishedAt,
    }).from(schema.post).orderBy(desc(schema.post.publishedAt)).limit(3),
    db.select().from(schema.project).orderBy(asc(schema.project.sortOrder)),
    db.select().from(schema.profile).where(eq(schema.profile.id, 1)).get(),
    db.select().from(schema.siteSettings).where(eq(schema.siteSettings.id, 1)).get(),
  ]);

  const posts: Post[] = postRows.map((p) => ({ ...p, tags: JSON.parse(p.tags) }));
  const projects: Project[] = projectRows.map((p) => ({
    ...p,
    techStack: JSON.parse(p.techStack),
    screenshots: JSON.parse(p.screenshots),
    featured: Boolean(p.featured),
  }));
  const profile: Profile | null = profileRow ? {
    ...profileRow,
    skills: JSON.parse(profileRow.skills),
    socialLinks: JSON.parse(profileRow.socialLinks) as SocialLink[],
  } : null;
  const settings: Settings | null = settingsRow ? {
    ...settingsRow,
    primaryNav: JSON.parse(settingsRow.primaryNav),
  } : null;

  const featured = projects.filter((p) => p.featured);

  return (
    <>
      <Header />
      <main>
        <Hero profile={profile} />
        <hr className="border-t-2 border-border max-w-5xl mx-auto" />
        <Projects projects={featured} />
        <hr className="border-t-2 border-border max-w-5xl mx-auto" />
        <Blog posts={posts} />
        <Footer profile={profile} settings={settings} />
      </main>
    </>
  );
}

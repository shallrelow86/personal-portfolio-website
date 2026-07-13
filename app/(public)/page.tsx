export const dynamic = "force-dynamic";

import Hero from "@/components/Hero";
import ProjectsScreen from "@/components/ProjectsScreen";
import BlogScreen from "@/components/BlogScreen";
import FullPageScroll from "@/components/FullPageScroll";
import { db, schema } from "@/lib/db";
import { desc, asc, eq } from "drizzle-orm";
import { publishedPostFilter } from "@/lib/posts";
import { parseJsonArray, parseJsonField } from "@/lib/json";
import type { Post, Project, Profile, SocialLink } from "@/lib/api";

export default async function HomePage() {
  const [postRows, projectRows, profileRow] = await Promise.all([
    db.select({
      id: schema.post.id, title: schema.post.title, slug: schema.post.slug,
      excerpt: schema.post.excerpt, tags: schema.post.tags,
      coverImage: schema.post.coverImage, publishedAt: schema.post.publishedAt,
    }).from(schema.post).where(publishedPostFilter).orderBy(desc(schema.post.publishedAt)).limit(5),
    db.select().from(schema.project).orderBy(asc(schema.project.sortOrder)),
    db.select().from(schema.profile).where(eq(schema.profile.id, 1)).get(),
  ]);

  const posts: Post[] = postRows.map((p) => ({ ...p, tags: parseJsonArray(p.tags) }));
  const projects: Project[] = projectRows.map((p) => ({
    ...p,
    techStack: parseJsonArray(p.techStack),
    screenshots: parseJsonArray(p.screenshots),
    featured: Boolean(p.featured),
  }));
  const profile: Profile | null = profileRow
    ? {
        ...profileRow,
        skills: parseJsonArray(profileRow.skills),
        socialLinks: parseJsonField<SocialLink[]>(profileRow.socialLinks, []),
      }
    : null;

  const featured = projects.filter((p) => p.featured);
  const displayProjects = featured.length > 0 ? featured : projects;

  return (
    <FullPageScroll sectionCount={3}>
      <Hero profile={profile} fullHeight />
      <ProjectsScreen projects={displayProjects} />
      <BlogScreen posts={posts} />
    </FullPageScroll>
  );
}

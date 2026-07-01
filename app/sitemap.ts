import { db, schema } from "@/lib/db";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = process.env.SITE_URL || "https://your-domain.com";
  const [posts, projects] = await Promise.all([
    db.select({ slug: schema.post.slug }).from(schema.post),
    db.select({ slug: schema.project.slug }).from(schema.project),
  ]);
  return [
    { url: BASE, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/projects`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/bookmarks`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.5 },
    ...posts.map((p) => ({ url: `${BASE}/blog/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...projects.map((p) => ({ url: `${BASE}/projects/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}

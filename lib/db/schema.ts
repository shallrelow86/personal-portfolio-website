import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";

export const profile = sqliteTable("profile", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull().default(""),
  bio: text("bio").notNull().default(""),
  avatar: text("avatar").notNull().default(""),
  skills: text("skills").notNull().default("[]"),
  socialLinks: text("social_links").notNull().default("[]"),
  resumeFile: text("resume_file").notNull().default(""),
});

export const category = sqliteTable("category", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: integer("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const post = sqliteTable("post", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  body: text("body").notNull().default(""),
  excerpt: text("excerpt").notNull().default(""),
  tags: text("tags").notNull().default("[]"),
  coverImage: text("cover_image").notNull().default(""),
  publishedAt: integer("published_at").notNull(),
  categoryId: integer("category_id"),
  status: text("status").notNull().default("published"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const project = sqliteTable("project", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull().default(""),
  body: text("body").notNull().default(""),
  coverImage: text("cover_image").notNull().default(""),
  screenshots: text("screenshots").notNull().default("[]"),
  techStack: text("tech_stack").notNull().default("[]"),
  githubUrl: text("github_url").notNull().default(""),
  liveUrl: text("live_url").notNull().default(""),
  featured: integer("featured").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const bookmark = sqliteTable("bookmark", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  description: text("description").notNull().default(""),
  favicon: text("favicon").notNull().default(""),
  reason: text("reason").notNull().default(""),
  categoryId: integer("category_id"),
  tags: text("tags").notNull().default("[]"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey(),
  siteTitle: text("site_title").notNull().default(""),
  siteDescription: text("site_description").notNull().default(""),
  ogImage: text("og_image").notNull().default(""),
  primaryNav: text("primary_nav").notNull().default("[]"),
  footerText: text("footer_text").notNull().default(""),
});

export const embedding = sqliteTable("embedding", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceType: text("source_type").notNull(),
  sourceId: integer("source_id").notNull(),
  content: text("content").notNull(),
  embedding: blob("embedding").notNull(),
});

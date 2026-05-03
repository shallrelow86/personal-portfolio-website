# Personal Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal developer portfolio website with Next.js + Sanity CMS featuring project showcase, blog with comments, Git project import, and admin panel.

**Architecture:** Next.js 14 App Router serves public pages (ISR from Sanity) and API routes. Sanity Studio is embedded at `/admin` protected by middleware password auth. Content is managed via Sanity schemas (5 document types) and queried via GROQ.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Sanity v3, Cloudflare Turnstile, GitHub REST API, Vercel deployment

---

## File Structure

```
/
├── sanity/
│   ├── schemas/
│   │   ├── index.ts              # Schema array export
│   │   ├── siteSettings.ts       # Singleton: site metadata & nav
│   │   ├── profile.ts            # Singleton: personal info
│   │   ├── project.ts            # Document: project portfolio entry
│   │   ├── post.ts               # Document: blog article
│   │   └── comment.ts            # Document: user comment
│   └── lib/
│       ├── client.ts             # Sanity JS client instance
│       └── queries.ts            # All GROQ queries
├── app/
│   ├── layout.tsx                # Root layout (metadata, fonts, Header/Footer)
│   ├── page.tsx                  # Homepage (hero, featured projects, latest posts)
│   ├── globals.css               # Base styles
│   ├── about/
│   │   └── page.tsx              # About page (full profile + skills + resume)
│   ├── projects/
│   │   ├── page.tsx              # Project listing (filterable by tech)
│   │   └── [slug]/
│   │       └── page.tsx          # Project detail (gallery, links)
│   ├── blog/
│   │   ├── page.tsx              # Blog listing (paginated by tag)
│   │   └── [slug]/
│   │       └── page.tsx          # Article detail + comments section
│   ├── admin/
│   │   └── [[...tool]]/          # Embedded Sanity Studio
│   │       └── page.tsx
│   └── api/
│       ├── comments/
│       │   └── route.ts          # POST: submit comment
│       ├── import-git-repo/
│       │   └── route.ts          # POST: fetch GitHub repo metadata
│       └── revalidate/
│           └── route.ts          # POST: Sanity webhook for ISR
├── components/
│   ├── Header.tsx                # Navigation bar (from SiteSettings.primaryNav)
│   ├── Footer.tsx                # Footer (from SiteSettings.footerText)
│   ├── ProjectCard.tsx           # Project card (coverImage, title, techStack)
│   ├── PostCard.tsx              # Blog post card (coverImage, title, excerpt, date)
│   ├── CommentForm.tsx           # Comment input form with Turnstile
│   └── CommentList.tsx           # Approved comments list for an article
├── middleware.ts                  # /admin auth check
├── sanity.config.ts              # Sanity Studio config (schemas, plugins)
├── next.config.js                # Next.js config (image domains)
├── package.json
├── tsconfig.json
├── .env.local.example
└── .gitignore
```

---

### Task 1: Project Scaffold & Dependencies

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `sanity.config.ts`, `.env.local.example`, `.gitignore`, `app/globals.css`

- [ ] **Step 1: Create Next.js project with TypeScript**

Run: `npx create-next-app@latest . --typescript --app --src-dir=false --import-alias="@/*" --tailwind --eslint`

Expected: Next.js 14+ project scaffolded with App Router, TypeScript, Tailwind CSS.

- [ ] **Step 2: Install Sanity and additional dependencies**

```bash
npm install next-sanity @sanity/client @sanity/image-url @sanity/vision
npm install @portabletext/react
npm install @react-turnstile/core
```

- [ ] **Step 3: Create `.env.local.example`**

```
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=sk...
SANITY_WEBHOOK_SECRET=your-webhook-secret

# Admin
ADMIN_PASSWORD=your-password

# GitHub (optional)
GITHUB_TOKEN=ghp_...

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

- [ ] **Step 4: Create `.gitignore` additions**

```
.env.local
.superpowers/
```

- [ ] **Step 5: Update `next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

module.exports = nextConfig;
```

- [ ] **Step 6: Create Sanity Studio config — `sanity.config.ts`**

```ts
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './sanity/schemas';

export default defineConfig({
  name: 'portfolio',
  title: 'Personal Portfolio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
```

- [ ] **Step 7: Install and commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js project with Sanity and dependencies"
```

---

### Task 2: Sanity Schemas — SiteSettings & Profile

**Files:**
- Create: `sanity/schemas/index.ts`, `sanity/schemas/siteSettings.ts`, `sanity/schemas/profile.ts`

- [ ] **Step 1: Create `sanity/schemas/siteSettings.ts`**

```ts
import { defineType, defineField } from 'sanity';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'siteDescription',
      title: 'Site Description',
      type: 'text',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'defaultOgImage',
      title: 'Default OG Image',
      type: 'image',
    }),
    defineField({
      name: 'primaryNav',
      title: 'Primary Navigation',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'label', type: 'string', validation: (r) => r.required() },
            { name: 'url', type: 'string', validation: (r) => r.required() },
          ],
        },
      ],
    }),
    defineField({
      name: 'footerText',
      title: 'Footer Text',
      type: 'text',
    }),
  ],
});
```

- [ ] **Step 2: Create `sanity/schemas/profile.ts`**

```ts
import { defineType, defineField } from 'sanity';

export const profile = defineType({
  name: 'profile',
  title: 'Profile',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'avatar',
      title: 'Avatar',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'e.g. "Full-Stack Developer"',
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'skills',
      title: 'Skills',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: ['GitHub', 'Twitter', 'LinkedIn', 'Email', 'Website'],
              },
            },
            { name: 'url', type: 'url' },
          ],
        },
      ],
    }),
    defineField({
      name: 'resumeFile',
      title: 'Resume (PDF)',
      type: 'file',
      options: { accept: '.pdf' },
    }),
  ],
});
```

- [ ] **Step 3: Create `sanity/schemas/index.ts`**

```ts
import { siteSettings } from './siteSettings';
import { profile } from './profile';
import { project } from './project';
import { post } from './post';
import { comment } from './comment';

export const schemaTypes = [siteSettings, profile, project, post, comment];
```

Note: `project`, `post`, `comment` imports will resolve once those files are created in the next task. For now, the file won't compile — this is expected. Commit after Task 3 when all schemas exist.

- [ ] **Step 4: Commit**

```bash
git add sanity/schemas/
git commit -m "feat: add SiteSettings and Profile Sanity schemas"
```

---

### Task 3: Sanity Schemas — Project, Post & Comment

**Files:**
- Create: `sanity/schemas/project.ts`, `sanity/schemas/post.ts`, `sanity/schemas/comment.ts`

- [ ] **Step 1: Create `sanity/schemas/project.ts`**

```ts
import { defineType, defineField } from 'sanity';

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    }),
    defineField({
      name: 'screenshots',
      title: 'Screenshots',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    }),
    defineField({
      name: 'techStack',
      title: 'Tech Stack',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({ name: 'githubUrl', title: 'GitHub URL', type: 'url' }),
    defineField({ name: 'liveUrl', title: 'Live URL', type: 'url' }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'importedFromGit',
      title: 'Imported from Git',
      type: 'boolean',
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: 'gitRepoData',
      title: 'Git Repo Data',
      type: 'object',
      readOnly: true,
      fields: [
        { name: 'stars', type: 'number' },
        { name: 'forks', type: 'number' },
        { name: 'language', type: 'string' },
        { name: 'description', type: 'text' },
        { name: 'topics', type: 'array', of: [{ type: 'string' }] },
        { name: 'updatedAt', type: 'datetime' },
      ],
    }),
  ],
  orderings: [
    { title: 'Sort Order', name: 'sortOrderAsc', by: [{ field: 'sortOrder', direction: 'asc' }] },
  ],
});
```

- [ ] **Step 2: Create `sanity/schemas/post.ts`**

```ts
import { defineType, defineField } from 'sanity';

export const post = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'image' },
        {
          type: 'code',
          options: {
            languageAlternatives: [
              { title: 'TypeScript', value: 'typescript' },
              { title: 'JavaScript', value: 'javascript' },
              { title: 'Python', value: 'python' },
              { title: 'Rust', value: 'rust' },
              { title: 'Go', value: 'go' },
              { title: 'Bash', value: 'bash' },
              { title: 'JSON', value: 'json' },
              { title: 'HTML', value: 'html' },
              { title: 'CSS', value: 'css' },
              { title: 'SQL', value: 'sql' },
            ],
          },
        },
      ],
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    { title: 'Published At (newest)', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
});
```

- [ ] **Step 3: Create `sanity/schemas/comment.ts`**

```ts
import { defineType, defineField } from 'sanity';

export const comment = defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{ type: 'post' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'authorName',
      title: 'Author Name',
      type: 'string',
      validation: (rule) => rule.required().max(60),
    }),
    defineField({
      name: 'authorEmail',
      title: 'Author Email',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      validation: (rule) => rule.required().max(2000),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
          { title: 'Spam', value: 'spam' },
        ],
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
      initialValue: () => new Date().toISOString(),
    }),
  ],
  orderings: [
    { title: 'Newest', name: 'createdAtDesc', by: [{ field: 'createdAt', direction: 'desc' }] },
  ],
});
```

- [ ] **Step 4: Commit**

```bash
git add sanity/schemas/
git commit -m "feat: add Project, Post, and Comment Sanity schemas"
```

---

### Task 4: Sanity Client & GROQ Queries

**Files:**
- Create: `sanity/lib/client.ts`, `sanity/lib/queries.ts`

- [ ] **Step 1: Create `sanity/lib/client.ts`**

```ts
import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: 'published',
});

const builder = imageUrlBuilder(client);

export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}

export function urlForFile(source: { asset: { _ref: string } }): string {
  const ref = source.asset._ref;
  const [, id, extension] = ref.split('-');
  return `https://cdn.sanity.io/files/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${id}.${extension}`;
}
```

- [ ] **Step 2: Create `sanity/lib/queries.ts`**

```ts
import { groq } from 'next-sanity';

export const SITE_SETTINGS_QUERY = groq`*[_type == "siteSettings"][0]`;

export const PROFILE_QUERY = groq`*[_type == "profile"][0]`;

export const FEATURED_PROJECTS_QUERY = groq`*[_type == "project" && featured == true] | order(sortOrder asc) {
  _id, title, slug, coverImage, description, techStack, githubUrl, liveUrl
}`;

export const ALL_PROJECTS_QUERY = groq`*[_type == "project"] | order(sortOrder asc) {
  _id, title, slug, coverImage, description, techStack, githubUrl, liveUrl
}`;

export const PROJECT_BY_SLUG_QUERY = groq`*[_type == "project" && slug.current == $slug][0] {
  _id, title, slug, coverImage, description, body, screenshots, techStack, githubUrl, liveUrl, gitRepoData
}`;

export const LATEST_POSTS_QUERY = groq`*[_type == "post"] | order(publishedAt desc) [0..2] {
  _id, title, slug, coverImage, excerpt, tags, publishedAt
}`;

export const ALL_POSTS_QUERY = groq`*[_type == "post"] | order(publishedAt desc) {
  _id, title, slug, coverImage, excerpt, tags, publishedAt
}`;

export const POST_BY_SLUG_QUERY = groq`*[_type == "post" && slug.current == $slug][0] {
  _id, title, slug, coverImage, body, excerpt, tags, publishedAt
}`;

export const COMMENTS_BY_POST_QUERY = groq`*[_type == "comment" && post._ref == $postId && status == "approved"] | order(createdAt desc) {
  _id, authorName, body, createdAt
}`;

export const ALL_PROJECT_SLUGS_QUERY = groq`*[_type == "project" && defined(slug.current)][].slug.current`;

export const ALL_POST_SLUGS_QUERY = groq`*[_type == "post" && defined(slug.current)][].slug.current`;

export const ALL_PROJECT_TECH_STACKS_QUERY = groq`*[_type == "project" && defined(techStack)].techStack[]`;
```

- [ ] **Step 3: Commit**

```bash
git add sanity/lib/
git commit -m "feat: add Sanity client and GROQ queries"
```

---

### Task 5: Root Layout, Header & Footer

**Files:**
- Create: `components/Header.tsx`, `components/Footer.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `components/Header.tsx`**

```tsx
```tsx
import Link from 'next/link';
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';

async function getNav() {
  try {
    const settings = await client.fetch(SITE_SETTINGS_QUERY);
    return settings?.primaryNav || [];
  } catch {
    return [];
  }
}

export default async function Header() {
  const nav = await getNav();

  return (
    <header className="border-b">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          Portfolio
        </Link>
        <ul className="flex gap-6 text-sm">
          {nav.map((item: { label: string; url: string }) => (
            <li key={item.url}>
              <Link href={item.url} className="hover:text-blue-600 transition-colors">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Create `components/Footer.tsx`**

```tsx
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';

async function getFooterText() {
  try {
    const settings = await client.fetch(SITE_SETTINGS_QUERY);
    return settings?.footerText || '';
  } catch {
    return '';
  }
}

export default async function Footer() {
  const footerText = await getFooterText();

  return (
    <footer className="border-t mt-auto">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-center text-sm text-gray-500">
        {footerText ? <p>{footerText}</p> : <p>&copy; {new Date().getFullYear()}</p>}
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Modify `app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { SITE_SETTINGS_QUERY } from '@/sanity/lib/queries';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

async function getSettings() {
  try {
    return await client.fetch(SITE_SETTINGS_QUERY);
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: settings?.siteTitle || 'Portfolio',
      template: `%s | ${settings?.siteTitle || 'Portfolio'}`,
    },
    description: settings?.siteDescription || '',
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/Header.tsx components/Footer.tsx app/layout.tsx
git commit -m "feat: add root layout with Header and Footer components"
```

---

### Task 6: Homepage

**Files:**
- Create: `app/page.tsx`
- Modify: (none)

- [ ] **Step 1: Create `app/page.tsx`**

```tsx
import Link from 'next/link';
import { client, urlForImage } from '@/sanity/lib/client';
import { PROFILE_QUERY, FEATURED_PROJECTS_QUERY, LATEST_POSTS_QUERY } from '@/sanity/lib/queries';
import ProjectCard from '@/components/ProjectCard';
import PostCard from '@/components/PostCard';

export default async function HomePage() {
  const [profile, projects, posts] = await Promise.all([
    client.fetch(PROFILE_QUERY).catch(() => null),
    client.fetch(FEATURED_PROJECTS_QUERY).catch(() => []),
    client.fetch(LATEST_POSTS_QUERY).catch(() => []),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="py-20 text-center">
        {profile?.avatar && (
          <img
            src={urlForImage(profile.avatar).width(200).height(200).url()}
            alt={profile.name}
            className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
          />
        )}
        <h1 className="text-4xl font-bold mb-2">{profile?.name || 'Developer'}</h1>
        {profile?.title && <p className="text-xl text-gray-600 mb-4">{profile.title}</p>}
        <div className="flex justify-center gap-4">
          {(profile?.socialLinks || []).map((link: { platform: string; url: string }) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
            >
              {link.platform}
            </a>
          ))}
        </div>
      </section>

      {/* Featured Projects */}
      {projects.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Projects</h2>
            <Link href="/projects" className="text-sm text-blue-600 hover:underline">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Posts */}
      {posts.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Latest Posts</h2>
            <Link href="/blog" className="text-sm text-blue-600 hover:underline">
              View all &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add homepage with hero, featured projects, and latest posts"
```

---

### Task 7: ProjectCard & PostCard Components

**Files:**
- Create: `components/ProjectCard.tsx`, `components/PostCard.tsx`

- [ ] **Step 1: Create `components/ProjectCard.tsx`**

```tsx
import Link from 'next/link';
import { urlForImage } from '@/sanity/lib/client';

interface ProjectCardProps {
  project: {
    _id: string;
    title: string;
    slug: { current: string };
    coverImage?: any;
    description: string;
    techStack?: string[];
    githubUrl?: string;
    liveUrl?: string;
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug.current}`}
      className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      {project.coverImage && (
        <img
          src={urlForImage(project.coverImage).width(600).height(300).url()}
          alt={project.title}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{project.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{project.description}</p>
        {project.techStack && project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="text-xs bg-gray-100 px-2 py-0.5 rounded"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create `components/PostCard.tsx`**

```tsx
import Link from 'next/link';
import { urlForImage } from '@/sanity/lib/client';

interface PostCardProps {
  post: {
    _id: string;
    title: string;
    slug: { current: string };
    coverImage?: any;
    excerpt?: string;
    tags?: string[];
    publishedAt?: string;
  };
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
    >
      {post.coverImage && (
        <img
          src={urlForImage(post.coverImage).width(600).height(300).url()}
          alt={post.title}
          className="w-full h-36 object-cover"
        />
      )}
      <div className="p-4">
        {post.publishedAt && (
          <time className="text-xs text-gray-400">
            {new Date(post.publishedAt).toLocaleDateString('zh-CN')}
          </time>
        )}
        <h3 className="font-semibold text-lg mb-1">{post.title}</h3>
        {post.excerpt && (
          <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ProjectCard.tsx components/PostCard.tsx
git commit -m "feat: add ProjectCard and PostCard components"
```

---

### Task 8: Projects Pages (List + Detail)

**Files:**
- Create: `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`

- [ ] **Step 1: Create `app/projects/page.tsx`**

```tsx
import { client } from '@/sanity/lib/client';
import { ALL_PROJECTS_QUERY, ALL_PROJECT_TECH_STACKS_QUERY } from '@/sanity/lib/queries';
import ProjectCard from '@/components/ProjectCard';

export default async function ProjectsPage() {
  const [projects, allTechs] = await Promise.all([
    client.fetch(ALL_PROJECTS_QUERY).catch(() => []),
    client.fetch(ALL_PROJECT_TECH_STACKS_QUERY).catch(() => []),
  ]);

  const uniqueTechs = [...new Set(allTechs as string[])].sort();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Projects</h1>

      {uniqueTechs.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {uniqueTechs.map((tech) => (
            <a
              key={tech}
              href={`/projects?tech=${encodeURIComponent(tech)}`}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
            >
              {tech}
            </a>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project: any) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/projects/[slug]/page.tsx`**

```tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { client, urlForImage } from '@/sanity/lib/client';
import { PROJECT_BY_SLUG_QUERY, ALL_PROJECT_SLUGS_QUERY } from '@/sanity/lib/queries';
import { PortableText } from '@portabletext/react';

export async function generateStaticParams() {
  const slugs = await client.fetch(ALL_PROJECT_SLUGS_QUERY).catch(() => []);
  return slugs.map((slug: string) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = await client.fetch(PROJECT_BY_SLUG_QUERY, { slug: params.slug }).catch(() => null);
  if (!project) return { title: 'Not Found' };
  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await client.fetch(PROJECT_BY_SLUG_QUERY, { slug: params.slug }).catch(() => null);

  if (!project) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {project.coverImage && (
        <img
          src={urlForImage(project.coverImage).width(1200).height(400).url()}
          alt={project.title}
          className="w-full h-64 object-cover rounded-lg mb-8"
        />
      )}

      <h1 className="text-3xl font-bold mb-4">{project.title}</h1>

      {project.techStack && project.techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {project.techStack.map((tech: string) => (
            <span key={tech} className="text-sm bg-gray-100 px-3 py-1 rounded-full">{tech}</span>
          ))}
        </div>
      )}

      <div className="flex gap-4 mb-8">
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
            GitHub &rarr;
          </a>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
            Live Demo &rarr;
          </a>
        )}
      </div>

      {project.body && (
        <div className="prose max-w-none mb-12">
          <PortableText value={project.body} />
        </div>
      )}

      {project.screenshots && project.screenshots.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Screenshots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.screenshots.map((img: any, i: number) => (
              <img
                key={i}
                src={urlForImage(img).width(800).url()}
                alt={`${project.title} screenshot ${i + 1}`}
                className="rounded-lg border"
              />
            ))}
          </div>
        </section>
      )}

      {project.gitRepoData && (
        <section className="mt-12 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Repository Stats</h3>
          <div className="flex gap-6 text-sm text-gray-600">
            {project.gitRepoData.stars != null && <span>⭐ {project.gitRepoData.stars} stars</span>}
            {project.gitRepoData.forks != null && <span>🍴 {project.gitRepoData.forks} forks</span>}
            {project.gitRepoData.language && <span>🔤 {project.gitRepoData.language}</span>}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/projects/
git commit -m "feat: add project listing and detail pages"
```

---

### Task 9: Blog Pages (List + Detail) & Comment Components

**Files:**
- Create: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`, `components/CommentForm.tsx`, `components/CommentList.tsx`

- [ ] **Step 1: Create `app/blog/page.tsx`**

```tsx
import { client } from '@/sanity/lib/client';
import { ALL_POSTS_QUERY } from '@/sanity/lib/queries';
import PostCard from '@/components/PostCard';

export default async function BlogPage() {
  const posts = await client.fetch(ALL_POSTS_QUERY).catch(() => []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post: any) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `components/CommentForm.tsx`**

```tsx
'use client';

import { useState, useRef } from 'react';
import Turnstile from '@react-turnstile/core';

interface CommentFormProps {
  postId: string;
}

export default function CommentForm({ postId }: CommentFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const turnstileRef = useRef<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileRef.current) {
      setErrorMsg('Please complete the CAPTCHA.');
      return;
    }
    setStatus('submitting');

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        authorName: name.trim(),
        authorEmail: email.trim(),
        body: body.trim(),
        turnstileToken: turnstileRef.current,
      }),
    });

    if (res.ok) {
      setStatus('success');
      setName('');
      setEmail('');
      setBody('');
    } else {
      const data = await res.json();
      setErrorMsg(data.error || 'Failed to submit comment.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return <p className="text-green-600 text-sm py-4">Comment submitted for review. Thank you!</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-6 border-t">
      <h3 className="font-semibold text-lg">Leave a Comment</h3>
      <div>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={60}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Your email (not shown)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
      <div>
        <textarea
          placeholder="Your comment"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          maxLength={2000}
          rows={4}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>
      <Turnstile
        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
        onVerify={(token) => { turnstileRef.current = token; }}
      />
      {status === 'error' && <p className="text-red-500 text-sm">{errorMsg}</p>}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {status === 'submitting' ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

- [ ] **Step 3: Create `components/CommentList.tsx`**

```tsx
interface Comment {
  _id: string;
  authorName: string;
  body: string;
  createdAt: string;
}

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-gray-500 text-sm py-4">No comments yet. Be the first!</p>;
  }

  return (
    <div className="space-y-4 py-4">
      {comments.map((comment) => (
        <div key={comment._id} className="border rounded p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-medium text-sm">{comment.authorName}</span>
            <span className="text-xs text-gray-400">
              {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <p className="text-sm text-gray-700">{comment.body}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create `app/blog/[slug]/page.tsx`**

```tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { client, urlForImage } from '@/sanity/lib/client';
import { POST_BY_SLUG_QUERY, COMMENTS_BY_POST_QUERY, ALL_POST_SLUGS_QUERY } from '@/sanity/lib/queries';
import { PortableText } from '@portabletext/react';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';

export async function generateStaticParams() {
  const slugs = await client.fetch(ALL_POST_SLUGS_QUERY).catch(() => []);
  return slugs.map((slug: string) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug: params.slug }).catch(() => null);
  if (!post) return { title: 'Not Found' };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await client.fetch(POST_BY_SLUG_QUERY, { slug: params.slug }).catch(() => null);

  if (!post) notFound();

  const comments = await client
    .fetch(COMMENTS_BY_POST_QUERY, { postId: post._id })
    .catch(() => []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {post.coverImage && (
        <img
          src={urlForImage(post.coverImage).width(1200).height(400).url()}
          alt={post.title}
          className="w-full h-64 object-cover rounded-lg mb-8"
        />
      )}

      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
        {post.publishedAt && (
          <time>{new Date(post.publishedAt).toLocaleDateString('zh-CN')}</time>
        )}
        {post.tags?.length > 0 && (
          <div className="flex gap-1">
            {post.tags.map((tag: string) => (
              <span key={tag} className="bg-gray-100 px-2 py-0.5 rounded text-xs">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {post.body && (
        <article className="prose max-w-none mb-12">
          <PortableText value={post.body} />
        </article>
      )}

      <section>
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        <CommentList comments={comments} />
        <CommentForm postId={post._id} />
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/blog/ components/CommentForm.tsx components/CommentList.tsx
git commit -m "feat: add blog listing, article detail, and comment components"
```

---

### Task 10: About Page

**Files:**
- Create: `app/about/page.tsx`

- [ ] **Step 1: Create `app/about/page.tsx`**

```tsx
import { Metadata } from 'next';
import { client, urlForImage, urlForFile } from '@/sanity/lib/client';
import { PROFILE_QUERY } from '@/sanity/lib/queries';
import { PortableText } from '@portabletext/react';

export const metadata: Metadata = {
  title: 'About',
};

export default async function AboutPage() {
  const profile = await client.fetch(PROFILE_QUERY).catch(() => null);

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-gray-500">No profile information configured yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="flex items-center gap-6 mb-8">
        {profile.avatar && (
          <img
            src={urlForImage(profile.avatar).width(200).height(200).url()}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          {profile.title && <p className="text-xl text-gray-600">{profile.title}</p>}
        </div>
      </div>

      {profile.bio && (
        <div className="prose max-w-none mb-8">
          <PortableText value={profile.bio} />
        </div>
      )}

      {profile.skills?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill: string) => (
              <span key={skill} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{skill}</span>
            ))}
          </div>
        </section>
      )}

      {profile.socialLinks?.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Connect</h2>
          <div className="flex gap-4">
            {profile.socialLinks.map((link: { platform: string; url: string }) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {link.platform}
              </a>
            ))}
          </div>
        </section>
      )}

      {profile.resumeFile?.asset && (
        <section>
          <a
            href={urlForFile(profile.resumeFile)}
            download
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Download Resume (PDF)
          </a>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/about/
git commit -m "feat: add about page with profile, skills, and resume"
```

---

### Task 11: API Routes — Comments, Git Import, Revalidation

**Files:**
- Create: `app/api/comments/route.ts`, `app/api/import-git-repo/route.ts`, `app/api/revalidate/route.ts`

- [ ] **Step 1: Create `app/api/comments/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const sanityWriteClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, authorName, authorEmail, body: commentBody, turnstileToken } = body;

    // Validate required fields
    if (!postId || typeof postId !== 'string') {
      return NextResponse.json({ error: 'postId is required.' }, { status: 400 });
    }
    if (!authorName || typeof authorName !== 'string' || authorName.trim().length === 0 || authorName.length > 60) {
      return NextResponse.json({ error: 'authorName is required (max 60 chars).' }, { status: 400 });
    }
    if (!authorEmail || typeof authorEmail !== 'string' || !validateEmail(authorEmail)) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    if (!commentBody || typeof commentBody !== 'string' || commentBody.trim().length === 0 || commentBody.length > 2000) {
      return NextResponse.json({ error: 'body is required (max 2000 chars).' }, { status: 400 });
    }
    if (!turnstileToken || typeof turnstileToken !== 'string') {
      return NextResponse.json({ error: 'CAPTCHA token is required.' }, { status: 400 });
    }

    // Verify Turnstile token
    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return NextResponse.json({ error: 'CAPTCHA verification failed.' }, { status: 400 });
    }

    // Create comment in Sanity
    await sanityWriteClient.create({
      _type: 'comment',
      post: { _type: 'reference', _ref: postId },
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
      body: commentBody.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Comment submission error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create `app/api/import-git-repo/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';

function extractRepoPath(url: string): string | null {
  const cleaned = url.replace(/\/$/, '').replace(/\.git$/, '');
  const match = cleaned.match(/github\.com\/([^/]+\/[^/]+)/);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json();

    if (!repoUrl || typeof repoUrl !== 'string') {
      return NextResponse.json({ error: 'repoUrl is required.' }, { status: 400 });
    }

    const repoPath = extractRepoPath(repoUrl);
    if (!repoPath) {
      return NextResponse.json({ error: 'Invalid GitHub URL.' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'personal-portfolio',
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const [repoRes, topicsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${repoPath}`, { headers }),
      fetch(`https://api.github.com/repos/${repoPath}/topics`, { headers }),
    ]);

    if (!repoRes.ok) {
      const status = repoRes.status;
      if (status === 404) return NextResponse.json({ error: 'Repository not found.' }, { status: 404 });
      if (status === 403) return NextResponse.json({ error: 'Rate limit exceeded. Configure GITHUB_TOKEN for higher limits.' }, { status: 429 });
      return NextResponse.json({ error: 'Failed to fetch repository.' }, { status: 502 });
    }

    const repo = await repoRes.json();
    let topics: string[] = [];
    if (topicsRes.ok) {
      const topicsData = await topicsRes.json();
      topics = topicsData.names || [];
    }

    return NextResponse.json({
      title: repo.name,
      description: repo.description || '',
      gitRepoData: {
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        language: repo.language || '',
        description: repo.description || '',
        topics,
        updatedAt: repo.updated_at || '',
      },
      githubUrl: repo.html_url,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Create `app/api/revalidate/route.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import crypto from 'crypto';

function verifySignature(body: string, signature: string | null): boolean {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(body).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('sanity-webhook-signature');

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  try {
    const payload = JSON.parse(body);
    const { _type, slug } = payload;

    // Revalidate type-specific paths
    switch (_type) {
      case 'profile':
        revalidatePath('/');
        revalidatePath('/about');
        break;
      case 'project':
        revalidatePath('/');
        revalidatePath('/projects');
        if (slug?.current) revalidatePath(`/projects/${slug.current}`);
        break;
      case 'post':
        revalidatePath('/');
        revalidatePath('/blog');
        if (slug?.current) revalidatePath(`/blog/${slug.current}`);
        break;
      case 'siteSettings':
        revalidatePath('/', 'layout');
        break;
      case 'comment':
        // Find the post slug from the payload and revalidate it
        if (payload.post?.slug?.current) {
          revalidatePath(`/blog/${payload.post.slug.current}`);
        }
        break;
      default:
        revalidatePath('/');
    }

    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/
git commit -m "feat: add API routes for comments, Git import, and revalidation"
```

---

### Task 12: Admin Route & Middleware Authentication

**Files:**
- Create: `middleware.ts`, `app/admin/[[...tool]]/page.tsx`

- [ ] **Step 1: Create `middleware.ts`**

```ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function verifyPassword(input: string, expected: string): boolean {
  try {
    return crypto.timingSafeEqual(Buffer.from(input), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) return NextResponse.next();

  const token = request.cookies.get('admin_token')?.value;
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return new NextResponse('ADMIN_PASSWORD not configured.', { status: 500 });
  }

  if (token && verifyPassword(token, expected)) {
    return NextResponse.next();
  }

  // If POST to /admin with password, validate and set cookie
  if (request.method === 'POST' && pathname === '/admin') {
    const formData = request.formData();
    return formData.then((data) => {
      const password = data.get('password') as string;
      if (password && verifyPassword(password, expected)) {
        const res = NextResponse.redirect(new URL('/admin', request.url));
        res.cookies.set('admin_token', password, {
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
          maxAge: 30 * 24 * 60 * 60, // 30 days
          path: '/',
        });
        return res;
      }
      return new NextResponse('Invalid password.', { status: 401 });
    });
  }

  // Show login page
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Admin Login</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #f5f5f5;
    }
    form {
      background: white;
      padding: 2rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 320px;
    }
    h1 { margin: 0 0 1.5rem; font-size: 1.25rem; text-align: center; }
    input {
      width: 100%;
      padding: 0.5rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      box-sizing: border-box;
    }
    button {
      width: 100%;
      padding: 0.5rem;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      cursor: pointer;
      margin-top: 1rem;
    }
    button:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <form method="POST">
    <h1>Admin Login</h1>
    <input type="password" name="password" placeholder="Password" required autofocus>
    <button type="submit">Sign In</button>
  </form>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

export const config = {
  matcher: '/admin/:path*',
};
```

- [ ] **Step 2: Create `app/admin/[[...tool]]/page.tsx`**

```tsx
import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity.config';

export const dynamic = 'force-static';

export { metadata, viewport } from 'next-sanity/studio';

export default function AdminPage() {
  return <NextStudio config={config} />;
}
```

- [ ] **Step 3: Commit**

```bash
git add middleware.ts app/admin/
git commit -m "feat: add /admin route with password-protected middleware"
```

---

### Task 13: Final Setup — Sanity Type Generation & Dev Verification

**Files:**
- (none created; verify existing files)

- [ ] **Step 1: Verify dev server starts**

Run: `npm run dev`
Expected: Next.js dev server starts on http://localhost:3000.

- [ ] **Step 2: Verify /admin loads**

Visit `http://localhost:3000/admin`. Confirm the password login form appears. Enter the password from `.env.local`. Confirm Sanity Studio loads.

- [ ] **Step 3: Create initial content in Sanity Studio**

- Create a `siteSettings` document with site title, description, and navigation items.
- Create a `profile` document with name, title, bio, skills, and social links.
- Verify the homepage renders the profile and navigation correctly.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore: final fixes from dev verification"
```

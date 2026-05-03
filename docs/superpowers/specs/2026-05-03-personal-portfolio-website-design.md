# Personal Portfolio Website — Design Spec

## Overview

A personal developer portfolio website built with Next.js + Sanity CMS. The site showcases personal information, development projects, and blog posts. Content is managed via a web-based admin panel (Sanity Studio). Visitors can view projects and blog posts, and leave comments on articles.

- **Target audience**: The site owner (content management) and general visitors (read-only)
- **Content types**: Profile, Projects, Blog Posts, Comments, Site Settings
- **Admin**: Sanity Studio embedded at `/admin`, password-protected via Next.js middleware

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 14+ (App Router) | Public site + API routes |
| CMS | Sanity | Content storage, image CDN, admin UI |
| Deployment | Vercel | Next.js hosting with ISR |
| Spam Protection | Cloudflare Turnstile | Comment form verification |
| Git Import | GitHub REST API | Pre-fill project metadata from repos |

**Cost**: Vercel Hobby (free), Sanity Free plan (free), Cloudflare Turnstile (free). Only cost is an optional custom domain (~$10/year).

## Content Model (Sanity Schemas)

### 1. SiteSettings (singleton)
Site-wide metadata and navigation configuration.

| Field | Type | Description |
|-------|------|-------------|
| siteTitle | string | Browser tab & SEO title |
| siteDescription | text | Default meta description |
| defaultOgImage | image | Default social share image |
| primaryNav | array of {label, url} | Header navigation items |
| footerText | text | Footer copyright/credit text |

### 2. Profile (singleton)
Personal information displayed on the homepage and /about page.

| Field | Type | Description |
|-------|------|-------------|
| name | string | Full name |
| avatar | image | Profile photo |
| title | string | Role label (e.g., "Full-Stack Developer") |
| bio | rich text | Full introduction with formatting |
| skills | array of strings | Skill tags |
| socialLinks | array of {platform, url} | GitHub, Twitter, LinkedIn, email, etc. |
| resumeFile | file | Optional PDF resume |

### 3. Project (multiple documents)
Development projects in the portfolio. Supports manual creation or Git import pre-fill.

| Field | Type | Description |
|-------|------|-------------|
| title | string | Project name |
| slug | slug | URL-friendly identifier |
| coverImage | image | Card/thumbnail for listings |
| description | text | Short summary |
| body | rich text | Full project description with images |
| screenshots | array of images | Detail page image gallery |
| techStack | array of strings | Technology tags |
| githubUrl | url | Repository link |
| liveUrl | url | Live demo link |
| featured | boolean | Show on homepage |
| sortOrder | number | Display ordering |
| importedFromGit | boolean | Whether created via Git import |
| gitRepoData | object (read-only) | Cached GitHub metadata (stars, forks, language, description). Refreshable without overwriting manual content. |

### 4. Post (multiple documents)
Blog articles. Uses Sanity's native draft/published workflow — no custom status field needed.

| Field | Type | Description |
|-------|------|-------------|
| title | string | Article title |
| slug | slug | URL path |
| coverImage | image | Article cover/hero image |
| body | rich text | Article content (code blocks, images, headings supported) |
| excerpt | text | Summary for listing pages |
| tags | array of strings | Category tags |
| publishedAt | datetime | Publication date (for sorting and display) |

### 5. Comment (multiple documents)
User-submitted comments on blog posts. Queried by post reference — no comments array stored on Post.

| Field | Type | Description |
|-------|------|-------------|
| post | reference (Post) | The article this comment belongs to |
| authorName | string | Commenter display name |
| authorEmail | string | Not publicly displayed |
| body | text | Comment content |
| status | enum: pending / approved / rejected / spam | Moderation status |
| createdAt | datetime | Submission timestamp |

## Page Routes

### Public Pages

| Route | Source | Description |
|-------|--------|-------------|
| `/` | `app/page.tsx` | Homepage — hero, featured projects, latest posts |
| `/projects` | `app/projects/page.tsx` | All projects, filterable by tech stack |
| `/projects/[slug]` | `app/projects/[slug]/page.tsx` | Project detail with gallery |
| `/blog` | `app/blog/page.tsx` | Blog post listing |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Article with comment section |
| `/about` | `app/about/page.tsx` | Full profile, skills, social links, resume |

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/comments` | POST | Submit a comment (requires Turnstile token) |
| `/api/import-git-repo` | POST | Fetch GitHub repo metadata for project pre-fill |
| `/api/revalidate` | POST | Sanity webhook for ISR revalidation |

### Admin Route

| Route | Description |
|-------|-------------|
| `/admin` | Embedded Sanity Studio. Protected by middleware password check. |

## Core Features

### Git Project Import

1. User clicks "Import from Git" in Sanity Studio project form
2. Enters a GitHub repository URL
3. Next.js API route (`/api/import-git-repo`) calls GitHub REST API server-side
4. Returns repo metadata: name, description, language, stars, forks, topics, license
5. Data pre-fills the Sanity Studio form — user supplements with screenshots, detailed description
6. **GitHub data is supplemental/pre-fill only** — manually curated content takes priority
7. `gitRepoData` is stored separately from editable fields — refreshing it (re-calling the API) updates only the cached Git metadata, never overwriting manual content
8. Optional `GITHUB_TOKEN` env var raises rate limit from 60/hr (unauthenticated) to 5000/hr

### Blog & Comments

- **Writing**: Sanity Studio rich text editor with code highlighting, image drag-and-drop, and markdown shortcuts
- **Publishing**: Sanity native draft/published workflow — save as draft, preview, then publish
- **Deployment**: Sanity webhook triggers Vercel ISR revalidation on publish
- **Comments**: Visitors submit via form on article page → POST `/api/comments` → created with status `pending` → admin reviews in Studio → approves/rejects/marks as spam → approved comments display publicly
- **Spam protection**: Cloudflare Turnstile widget on comment form; server-side token verification

### Admin Authentication

Next.js middleware protects `/admin`:

1. Request to `/admin` → check for valid auth cookie
2. No valid cookie → show password input page
3. Password submitted → compare using `crypto.timingSafeEqual` against `ADMIN_PASSWORD` env var
4. Match → set httpOnly, Secure, SameSite cookie → allow access
5. Two-layer protection: middleware password + Sanity account login to edit content

## Deployment

- **Next.js**: Deployed to Vercel via GitHub integration. Auto-deploys on push to main.
- **Sanity**: Managed cloud service. CORS configured for the production domain.
- **ISR**: Sanity webhook → Vercel deploy hook revalidates affected pages on content change.
- **Environment variables** (Vercel): `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN`, `GITHUB_TOKEN` (optional), `TURNSTILE_SECRET_KEY`, `ADMIN_PASSWORD`

## Out of Scope (v1)

- User accounts / multi-user support
- Analytics / page view tracking
- Full-text search
- RSS feed
- i18n / multi-language
- Dark mode toggle (can add later with CSS variables)
- Automated tests (can add as project grows)

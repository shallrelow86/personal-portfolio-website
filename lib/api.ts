import { headers } from "next/headers";

async function getBaseUrl() {
  const h = await headers();
  const host = h.get("host");
  if (host) {
    const proto = h.get("x-forwarded-proto") ?? "http";
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function fetchApi<T>(path: string): Promise<T | null> {
  try {
    const base = await getBaseUrl();
    const res = await fetch(`${base}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export type SocialLink = { platform: string; url: string };

export type Profile = {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  skills: string[];
  socialLinks: SocialLink[];
  resumeFile: string;
};

export type Settings = {
  siteTitle: string;
  siteDescription: string;
  ogImage: string;
  primaryNav: { label: string; url: string }[];
  footerText: string;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  coverImage: string;
  publishedAt: number;
};

export type PostDetail = Post & { body: string };

export type Project = {
  id: number;
  title: string;
  slug: string;
  description: string;
  body: string;
  aiContext?: string;
  coverImage: string;
  screenshots: string[];
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  sortOrder: number;
};

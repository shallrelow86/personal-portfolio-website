import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE = process.env.SITE_URL || "https://your-domain.com";
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: `${BASE}/sitemap.xml`,
  };
}

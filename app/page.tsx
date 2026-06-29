export const dynamic = "force-dynamic";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Projects from "@/components/Projects";
import Blog from "@/components/Blog";
import Footer from "@/components/Footer";
import { fetchApi, type Post, type Project, type Profile, type Settings } from "@/lib/api";

export default async function HomePage() {
  const [posts, projects, profile, settings] = await Promise.all([
    fetchApi<Post[]>("/api/posts"),
    fetchApi<Project[]>("/api/projects"),
    fetchApi<Profile>("/api/admin/profile"),
    fetchApi<Settings>("/api/admin/settings"),
  ]);

  const featured = (projects || []).filter((p) => p.featured);
  const latest = (posts || []).slice(0, 3);

  return (
    <>
      <Header />
      <main>
        <Hero profile={profile} />
        <hr className="border-t-2 border-border max-w-5xl mx-auto" />
        <Projects projects={featured} />
        <hr className="border-t-2 border-border max-w-5xl mx-auto" />
        <Blog posts={latest} />
        <Footer profile={profile} settings={settings} />
      </main>
    </>
  );
}

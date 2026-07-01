import { Metadata } from "next";
import Header from "@/components/Header";
import ProjectCardList from "./ProjectCardList";
import { db, schema } from "@/lib/db";
import { asc } from "drizzle-orm";
import type { Project } from "@/lib/api";

export const metadata: Metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const rows = await db.select().from(schema.project).orderBy(asc(schema.project.sortOrder));
  const projects: Project[] = rows.map((p) => ({
    ...p,
    techStack: JSON.parse(p.techStack),
    screenshots: JSON.parse(p.screenshots),
    featured: Boolean(p.featured),
  }));

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl mb-10">Projects</h1>
        {projects.length === 0 ? (
          <p className="font-mono text-sm text-text-muted text-center py-24">暂无项目</p>
        ) : (
          <ProjectCardList projects={projects} />
        )}
      </div>
    </>
  );
}

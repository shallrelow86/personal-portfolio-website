import { Metadata } from "next";
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
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <p className="eyebrow mb-4">Selected Work</p>
      <h1 className="font-display text-4xl md:text-5xl italic mb-12">Projects</h1>
      {projects.length === 0 ? (
        <p className="font-mono text-sm text-text-muted text-center py-24">暂无项目</p>
      ) : (
        <ProjectCardList projects={projects} />
      )}
    </div>
  );
}

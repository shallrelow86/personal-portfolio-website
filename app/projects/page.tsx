import { Metadata } from "next";
import Header from "@/components/Header";
import ProjectCardList from "./ProjectCardList";
import { fetchApi, type Project } from "@/lib/api";

export const metadata: Metadata = { title: "Projects" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await fetchApi<Project[]>("/api/projects");

  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl mb-10">Projects</h1>
        {!projects || projects.length === 0 ? (
          <p className="font-mono text-sm text-text-muted text-center py-24">暂无项目</p>
        ) : (
          <ProjectCardList projects={projects} />
        )}
      </div>
    </>
  );
}

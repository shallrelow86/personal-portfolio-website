"use client";
import { useEffect, useState } from "react";
import BrutalButton from "@/components/ui/BrutalButton";

type Project = {
  id: number;
  title: string;
  slug: string;
  featured: number;
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch("/api/admin/projects").then((r) => r.json()).then(setProjects);
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    setProjects((p) => p.filter((x) => x.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Projects</h1>
        <BrutalButton href="/admin/projects/new">New Project</BrutalButton>
      </div>
      {projects.length === 0 ? (
        <p className="text-text-muted">No projects yet.</p>
      ) : (
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="border-b-2 border-border text-left text-text-muted">
              <th className="pb-3 pr-4">Title</th>
              <th className="pb-3 pr-4">Slug</th>
              <th className="pb-3 pr-4">Featured</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-border">
                <td className="py-3 pr-4 font-medium">{p.title}</td>
                <td className="py-3 pr-4 text-text-muted">{p.slug}</td>
                <td className="py-3 pr-4 text-text-muted">{p.featured ? "Yes" : "No"}</td>
                <td className="py-3 text-right space-x-2">
                  <a href={`/admin/projects/${p.id}/edit`} className="hover:text-accent">Edit</a>
                  <button onClick={() => handleDelete(p.id)} className="hover:text-accent text-text-muted">Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

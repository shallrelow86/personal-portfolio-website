"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BrutalInput from "@/components/ui/BrutalInput";
import BrutalButton from "@/components/ui/BrutalButton";

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [body, setBody] = useState("");
  const [techStack, setTechStack] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setCoverImage(data.url);
  };

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slug) {
      setSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        description,
        body,
        coverImage,
        techStack: techStack.split(",").map((t) => t.trim()).filter(Boolean),
        githubUrl,
        liveUrl,
        featured,
        sortOrder: Number(sortOrder) || 0,
      }),
    });
    if (res.ok) router.push("/admin/projects");
    else setSaving(false);
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">New Project</h1>
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <BrutalInput label="Title" value={title} onChange={handleTitleChange} required />
        <BrutalInput label="Slug" value={slug} onChange={setSlug} required />
        <div className="mb-4">
          <span className="block font-mono text-xs uppercase tracking-wider text-text-secondary mb-1.5">Cover Image</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="text-sm mb-1" />
          {coverImage && <img src={coverImage} alt="" className="w-48 h-24 object-cover border-2 border-border" />}
        </div>
        <BrutalInput label="Description" value={description} onChange={setDescription} required />
        <BrutalInput label="Body (Markdown)" value={body} onChange={setBody} multiline />
        <BrutalInput label="Tech Stack (comma-separated)" value={techStack} onChange={setTechStack} placeholder="react, nextjs" />
        <BrutalInput label="GitHub URL" value={githubUrl} onChange={setGithubUrl} />
        <BrutalInput label="Live URL" value={liveUrl} onChange={setLiveUrl} />
        <label className="flex items-center gap-2 mb-4 font-mono text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          Featured
        </label>
        <BrutalInput label="Sort Order" value={sortOrder} onChange={setSortOrder} type="number" />
        <div className="flex gap-4 mt-8">
          <BrutalButton type="submit" disabled={saving}>{saving ? "Saving..." : "Create Project"}</BrutalButton>
          <BrutalButton href="/admin/projects">Cancel</BrutalButton>
        </div>
      </form>
    </div>
  );
}

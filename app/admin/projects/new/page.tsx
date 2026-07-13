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
  const [aiContext, setAiContext] = useState("");
  const [techStack, setTechStack] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState("0");
  const [saving, setSaving] = useState(false);

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    return data.url as string | undefined;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) setCoverImage(url);
    e.target.value = "";
  };

  const handleScreenshotsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadFile(file);
      if (url) urls.push(url);
    }
    if (urls.length) setScreenshots((prev) => [...prev, ...urls]);
    e.target.value = "";
  };

  const removeScreenshot = (idx: number) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== idx));
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
        title, slug, description, body, aiContext, coverImage, screenshots,
        techStack: techStack.split(",").map((t) => t.trim()).filter(Boolean),
        githubUrl, liveUrl, featured,
        sortOrder: Number(sortOrder) || 0,
      }),
    });
    if (res.ok) router.push("/admin/projects");
    else setSaving(false);
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">新建项目</h1>
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <BrutalInput label="项目名称" value={title} onChange={handleTitleChange} required />
        <BrutalInput label="Slug" value={slug} onChange={setSlug} required />
        <div className="mb-4">
          <span className="block font-mono text-xs tracking-wider text-text-secondary mb-1.5">封面图</span>
          <input type="file" accept="image/*" onChange={handleCoverUpload} className="text-sm mb-1" />
          {coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverImage} alt="" className="w-48 h-24 object-cover rounded-lg border border-border" />
          )}
        </div>
        <div className="mb-4">
          <span className="block font-mono text-xs tracking-wider text-text-secondary mb-1.5">运行截图（可多选）</span>
          <input type="file" accept="image/*" multiple onChange={handleScreenshotsUpload} className="text-sm mb-2" />
          {screenshots.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {screenshots.map((url, i) => (
                <div key={`${url}-${i}`} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-32 h-20 object-cover rounded-lg border border-border" />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(i)}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-ink text-bg text-xs rounded-full cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <BrutalInput label="简述" value={description} onChange={setDescription} required />
        <BrutalInput label="正文（Markdown）" value={body} onChange={setBody} multiline />
        <BrutalInput
          label="AI 资料（给前台助手检索用，可写别名、功能说明等）"
          value={aiContext}
          onChange={setAiContext}
          multiline
          rows={6}
          placeholder="例：别名「瞎掰王」；这是一款……"
        />
        <BrutalInput label="技术栈（逗号分隔）" value={techStack} onChange={setTechStack} placeholder="react, nextjs" />
        <BrutalInput label="GitHub 链接" value={githubUrl} onChange={setGithubUrl} />
        <BrutalInput label="在线演示" value={liveUrl} onChange={setLiveUrl} />
        <label className="flex items-center gap-2 mb-4 text-sm">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
          推荐项目
        </label>
        <BrutalInput label="排序" value={sortOrder} onChange={setSortOrder} type="number" />
        <div className="flex gap-3 mt-8">
          <BrutalButton type="submit" primary disabled={saving}>{saving ? "保存中…" : "创建项目"}</BrutalButton>
          <BrutalButton href="/admin/projects">取消</BrutalButton>
        </div>
      </form>
    </div>
  );
}

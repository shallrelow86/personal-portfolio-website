"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BrutalInput from "@/components/ui/BrutalInput";
import BrutalButton from "@/components/ui/BrutalButton";
import Markdown from "@/components/Markdown";

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

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
      const generated = v
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9一-鿿-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generated || "untitled-" + Date.now());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, slug, body, excerpt,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        coverImage,
        publishedAt: Date.now(),
      }),
    });
    if (res.ok) router.push("/admin/posts");
    else setSaving(false);
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">新建文章</h1>
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <BrutalInput label="标题" value={title} onChange={handleTitleChange} required />
        <BrutalInput label="Slug" value={slug} onChange={setSlug} required />
        <div className="mb-4">
          <span className="block font-mono text-xs tracking-wider text-text-secondary mb-1.5">封面图</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="text-sm mb-1" />
          {coverImage && <img src={coverImage} alt="" className="w-48 h-24 object-cover rounded-lg border border-border" />}
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-4 mb-1.5">
            <span className="font-mono text-xs tracking-wider text-text-secondary">正文（Markdown）</span>
            <button type="button" onClick={() => setPreview(!preview)}
              className="font-mono text-xs text-text-muted hover:text-accent">
              {preview ? "编辑" : "预览"}
            </button>
          </div>
          {preview ? (
            <div className="brutal-card min-h-[300px]">
              <Markdown content={body} />
            </div>
          ) : (
            <textarea value={body} onChange={(e) => setBody(e.target.value)}
              className="brutal-input min-h-[300px] resize-y font-mono" />
          )}
        </div>

        <BrutalInput label="摘要" value={excerpt} onChange={setExcerpt} multiline rows={3} />
        <BrutalInput label="标签（逗号分隔）" value={tags} onChange={setTags} placeholder="react, nextjs" />

        <div className="flex gap-3 mt-8">
          <BrutalButton type="submit" primary disabled={saving}>
            {saving ? "保存中…" : "创建文章"}
          </BrutalButton>
          <BrutalButton href="/admin/posts">取消</BrutalButton>
        </div>
      </form>
    </div>
  );
}

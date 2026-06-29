"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BrutalInput from "@/components/ui/BrutalInput";
import BrutalButton from "@/components/ui/BrutalButton";

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
      setSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, slug,
        body: body,
        excerpt,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        coverImage,
        publishedAt: Date.now(),
      }),
    });
    if (res.ok) {
      router.push("/admin/posts");
    } else {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">New Post</h1>
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <BrutalInput label="Title" value={title} onChange={handleTitleChange} required />
        <BrutalInput label="Slug" value={slug} onChange={setSlug} required />
        <div className="mb-4">
          <span className="block font-mono text-xs uppercase tracking-wider text-text-secondary mb-1.5">Cover Image</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="text-sm mb-1" />
          {coverImage && <img src={coverImage} alt="" className="w-48 h-24 object-cover border-2 border-border" />}
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-4 mb-1.5">
            <span className="font-mono text-xs uppercase tracking-wider text-text-secondary">Body (Markdown)</span>
            <button type="button" onClick={() => setPreview(!preview)}
              className="font-mono text-xs text-text-muted hover:text-accent">
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
          {preview ? (
            <div className="border-2 border-border bg-bg p-4 min-h-[300px] prose max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: body }} />
          ) : (
            <textarea value={body} onChange={(e) => setBody(e.target.value)}
              className="w-full border-2 border-border bg-bg px-4 py-2.5 text-sm font-mono text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors min-h-[300px] resize-y" />
          )}
        </div>

        <BrutalInput label="Excerpt" value={excerpt} onChange={setExcerpt} multiline rows={3} />
        <BrutalInput label="Tags (comma-separated)" value={tags} onChange={setTags} placeholder="react, nextjs, typescript" />

        <div className="flex gap-4 mt-8">
          <BrutalButton type="submit" disabled={saving}>
            {saving ? "Saving..." : "Create Post"}
          </BrutalButton>
          <BrutalButton href="/admin/posts">Cancel</BrutalButton>
        </div>
      </form>
    </div>
  );
}

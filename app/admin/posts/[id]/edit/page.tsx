"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import BrutalInput from "@/components/ui/BrutalInput";
import BrutalButton from "@/components/ui/BrutalButton";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/posts/${params.id}`)
      .then((r) => r.json())
      .then((p) => {
        setTitle(p.title); setSlug(p.slug); setBody(p.body);
        setExcerpt(p.excerpt); setCoverImage(p.coverImage);
        setTags(JSON.parse(p.tags).join(", "));
        setLoading(false);
      });
  }, [params.id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setCoverImage(data.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/admin/posts/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, slug, body, excerpt,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        coverImage,
        publishedAt: Date.now(),
      }),
    });
    if (res.ok) router.push("/admin/posts");
  };

  if (loading) return <p className="text-text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Edit Post</h1>
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <BrutalInput label="Title" value={title} onChange={setTitle} required />
        <BrutalInput label="Slug" value={slug} onChange={setSlug} required />
        <div className="mb-4">
          <span className="block font-mono text-xs uppercase tracking-wider text-text-secondary mb-1.5">Cover Image</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="text-sm mb-1" />
          {coverImage && <img src={coverImage} alt="" className="w-48 h-24 object-cover border-2 border-border" />}
        </div>
        <BrutalInput label="Body (Markdown)" value={body} onChange={setBody} multiline />
        <BrutalInput label="Excerpt" value={excerpt} onChange={setExcerpt} multiline rows={3} />
        <BrutalInput label="Tags" value={tags} onChange={setTags} />
        <div className="flex gap-4 mt-8">
          <BrutalButton type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </BrutalButton>
          <BrutalButton href="/admin/posts">Cancel</BrutalButton>
        </div>
      </form>
    </div>
  );
}

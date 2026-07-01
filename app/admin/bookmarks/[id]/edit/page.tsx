"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrutalInput from "@/components/ui/BrutalInput";
import BrutalButton from "@/components/ui/BrutalButton";

type Category = { id: number; name: string };
type Bookmark = {
  id: number;
  title: string;
  url: string;
  description: string;
  reason: string;
  tags: string[];
  categoryId: number | null;
  sortOrder: number;
};

export default function EditBookmarkPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [reason, setReason] = useState("");
  const [tags, setTags] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { id: idStr } = await params;
      const numId = Number(idStr);
      setId(numId);
      const [b, cats] = await Promise.all([
        fetch(`/api/admin/bookmarks/${numId}`).then((r) => r.json()),
        fetch("/api/admin/categories").then((r) => r.json()),
      ]);
      setTitle(b.title);
      setUrl(b.url);
      setDescription(b.description);
      setReason(b.reason);
      setTags(b.tags.join(", "));
      setCategoryId(b.categoryId ? String(b.categoryId) : "");
      setSortOrder(String(b.sortOrder));
      setCategories(cats);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    const res = await fetch(`/api/admin/bookmarks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title, url, description, reason,
        categoryId: categoryId ? Number(categoryId) : null,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        sortOrder: Number(sortOrder) || 0,
      }),
    });
    if (res.ok) router.push("/admin/bookmarks");
    else setSaving(false);
  };

  if (!id) return <p className="text-text-muted">Loading...</p>;

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Edit Bookmark</h1>
      <form onSubmit={handleSubmit} className="max-w-3xl">
        <BrutalInput label="Title" value={title} onChange={setTitle} required />
        <BrutalInput label="URL" value={url} onChange={setUrl} required />
        <BrutalInput label="Description" value={description} onChange={setDescription} multiline rows={2} />
        <BrutalInput label="Reason (Markdown)" value={reason} onChange={setReason} multiline rows={3} />
        <BrutalInput label="Tags (comma-separated)" value={tags} onChange={setTags} />
        <label className="block mb-4">
          <span className="block font-mono text-xs uppercase tracking-wider text-text-secondary mb-1.5">Category</span>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border-2 border-border bg-bg px-4 py-2.5 text-sm font-body"
          >
            <option value="">(none)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <BrutalInput label="Sort Order" value={sortOrder} onChange={setSortOrder} type="number" />
        <div className="flex gap-4 mt-8">
          <BrutalButton type="submit" disabled={saving}>{saving ? "Saving..." : "Update"}</BrutalButton>
          <BrutalButton href="/admin/bookmarks">Cancel</BrutalButton>
        </div>
      </form>
    </div>
  );
}

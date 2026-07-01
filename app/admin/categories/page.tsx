"use client";
import { useEffect, useState } from "react";
import BrutalButton from "@/components/ui/BrutalButton";
import BrutalInput from "@/components/ui/BrutalInput";

type Category = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  children?: Category[];
};

export default function AdminCategoriesPage() {
  const [tree, setTree] = useState<Category[]>([]);
  const [flat, setFlat] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [sortOrder, setSortOrder] = useState("0");
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = () => {
    fetch("/api/admin/categories").then((r) => r.json()).then((cats: Category[]) => {
      const map = new Map<number, Category>();
      const roots: Category[] = [];
      for (const c of cats) map.set(c.id, { ...c, children: [] });
      for (const c of cats) {
        const node = map.get(c.id)!;
        if (c.parentId && map.has(c.parentId)) map.get(c.parentId)!.children!.push(node);
        else roots.push(node);
      }
      setTree(roots);
      setFlat(cats);
    });
  };

  useEffect(() => { load(); }, []);

  const reset = () => {
    setName(""); setSlug(""); setParentId(""); setSortOrder("0"); setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name, slug,
      parentId: parentId ? Number(parentId) : null,
      sortOrder: Number(sortOrder) || 0,
    };
    if (editingId) {
      await fetch(`/api/admin/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    reset();
    load();
  };

  const handleEdit = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setParentId(c.parentId ? String(c.parentId) : "");
    setSortOrder(String(c.sortOrder));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Delete failed");
      return;
    }
    load();
  };

  const renderNode = (node: Category, depth: number): React.ReactNode => (
    <div key={node.id} style={{ marginLeft: depth * 24 }}>
      <div className="flex items-center gap-3 py-2 border-b border-border">
        <span className="font-medium text-sm">{node.name}</span>
        <span className="text-text-muted text-xs font-mono">/{node.slug}</span>
        <button onClick={() => handleEdit(node)} className="text-xs text-text-muted hover:text-accent">Edit</button>
        <button onClick={() => handleDelete(node.id)} className="text-xs text-text-muted hover:text-accent">Del</button>
      </div>
      {node.children?.map((c) => renderNode(c, depth + 1))}
    </div>
  );

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Categories</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mb-10 border-2 border-border p-5 bg-surface">
        <h2 className="font-mono text-xs uppercase tracking-wider text-text-secondary mb-4">
          {editingId ? "Edit Category" : "New Category"}
        </h2>
        <BrutalInput label="Name" value={name} onChange={setName} required />
        <BrutalInput label="Slug" value={slug} onChange={setSlug} required />
        <label className="block mb-4">
          <span className="block font-mono text-xs uppercase tracking-wider text-text-secondary mb-1.5">Parent</span>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="w-full border-2 border-border bg-bg px-4 py-2.5 text-sm font-body"
          >
            <option value="">(root)</option>
            {flat.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <BrutalInput label="Sort Order" value={sortOrder} onChange={setSortOrder} type="number" />
        <div className="flex gap-4">
          <BrutalButton type="submit">{editingId ? "Update" : "Create"}</BrutalButton>
          {editingId && <BrutalButton onClick={reset}>Cancel</BrutalButton>}
        </div>
      </form>
      {tree.length === 0 ? (
        <p className="text-text-muted">No categories yet.</p>
      ) : (
        <div>{tree.map((n) => renderNode(n, 0))}</div>
      )}
    </div>
  );
}

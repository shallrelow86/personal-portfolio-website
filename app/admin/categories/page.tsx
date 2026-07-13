"use client";
import { useEffect, useState } from "react";
import BrutalButton from "@/components/ui/BrutalButton";
import BrutalInput from "@/components/ui/BrutalInput";
import BrutalCard from "@/components/ui/BrutalCard";

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
    if (!confirm("确认删除该分类？")) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "删除失败");
      return;
    }
    load();
  };

  const renderNode = (node: Category, depth: number): React.ReactNode => (
    <div key={node.id} style={{ marginLeft: depth * 24 }}>
      <div className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
        <span className="font-medium text-sm">{node.name}</span>
        <span className="text-text-muted text-xs font-mono">/{node.slug}</span>
        <button onClick={() => handleEdit(node)} className="text-xs text-text-secondary hover:text-accent ml-auto">编辑</button>
        <button onClick={() => handleDelete(node.id)} className="text-xs text-text-muted hover:text-accent">删除</button>
      </div>
      {node.children?.map((c) => renderNode(c, depth + 1))}
    </div>
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl mb-1">分类</h1>
        <p className="text-text-muted text-sm">文章与收藏共用的无限层级分类</p>
      </div>

      <BrutalCard className="mb-8 max-w-2xl">
        <h2 className="font-mono text-xs tracking-wider text-text-secondary mb-4">
          {editingId ? "编辑分类" : "新建分类"}
        </h2>
        <form onSubmit={handleSubmit}>
          <BrutalInput label="名称" value={name} onChange={setName} required />
          <BrutalInput label="Slug" value={slug} onChange={setSlug} required />
          <label className="block mb-4">
            <span className="block font-mono text-xs tracking-wider text-text-secondary mb-1.5">父分类</span>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="brutal-input"
            >
              <option value="">（顶级）</option>
              {flat.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <BrutalInput label="排序" value={sortOrder} onChange={setSortOrder} type="number" />
          <div className="flex gap-3 mt-2">
            <BrutalButton type="submit" primary>{editingId ? "保存" : "创建"}</BrutalButton>
            {editingId && <BrutalButton onClick={reset}>取消</BrutalButton>}
          </div>
        </form>
      </BrutalCard>

      {tree.length === 0 ? (
        <BrutalCard><p className="text-text-muted text-sm">还没有分类。</p></BrutalCard>
      ) : (
        <BrutalCard>{tree.map((n) => renderNode(n, 0))}</BrutalCard>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import BrutalButton from "@/components/ui/BrutalButton";

type Post = {
  id: number;
  title: string;
  slug: string;
  publishedAt: number;
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/api/admin/posts").then((r) => r.json()).then(setPosts);
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
    setPosts((p) => p.filter((x) => x.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Posts</h1>
        <BrutalButton href="/admin/posts/new">New Post</BrutalButton>
      </div>
      {posts.length === 0 ? (
        <p className="text-text-muted">No posts yet.</p>
      ) : (
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="border-b-2 border-border text-left text-text-muted">
              <th className="pb-3 pr-4">Title</th>
              <th className="pb-3 pr-4">Slug</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-border">
                <td className="py-3 pr-4 font-medium">{p.title}</td>
                <td className="py-3 pr-4 text-text-muted">{p.slug}</td>
                <td className="py-3 pr-4 text-text-muted">
                  {new Date(p.publishedAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="py-3 text-right space-x-2">
                  <a href={`/admin/posts/${p.id}/edit`} className="hover:text-accent">Edit</a>
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

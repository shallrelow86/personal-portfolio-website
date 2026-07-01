"use client";
import { useEffect, useState } from "react";
import BrutalButton from "@/components/ui/BrutalButton";

type Bookmark = {
  id: number;
  title: string;
  url: string;
  description: string;
  tags: string[];
  createdAt: number;
};

export default function AdminBookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    fetch("/api/admin/bookmarks").then((r) => r.json()).then(setBookmarks);
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this bookmark?")) return;
    await fetch(`/api/admin/bookmarks/${id}`, { method: "DELETE" });
    setBookmarks((b) => b.filter((x) => x.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl">Bookmarks</h1>
        <BrutalButton href="/admin/bookmarks/new">New Bookmark</BrutalButton>
      </div>
      {bookmarks.length === 0 ? (
        <p className="text-text-muted">No bookmarks yet.</p>
      ) : (
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="border-b-2 border-border text-left text-text-muted">
              <th className="pb-3 pr-4">Title</th>
              <th className="pb-3 pr-4">URL</th>
              <th className="pb-3 pr-4">Tags</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {bookmarks.map((b) => (
              <tr key={b.id} className="border-b border-border">
                <td className="py-3 pr-4 font-medium">{b.title}</td>
                <td className="py-3 pr-4 text-text-muted truncate max-w-xs">{b.url}</td>
                <td className="py-3 pr-4 text-text-muted">{b.tags.join(", ")}</td>
                <td className="py-3 pr-4 text-text-muted">
                  {new Date(b.createdAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="py-3 text-right space-x-2">
                  <a href={`/admin/bookmarks/${b.id}/edit`} className="hover:text-accent">Edit</a>
                  <button onClick={() => handleDelete(b.id)} className="hover:text-accent text-text-muted">Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

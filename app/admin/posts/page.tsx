import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import BrutalButton from "@/components/ui/BrutalButton";
import BrutalCard from "@/components/ui/BrutalCard";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await db
    .select()
    .from(schema.post)
    .orderBy(desc(schema.post.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1">文章</h1>
          <p className="text-text-muted text-sm">管理博客文章</p>
        </div>
        <BrutalButton href="/admin/posts/new" primary>新建文章</BrutalButton>
      </div>
      {posts.length === 0 ? (
        <BrutalCard><p className="text-text-muted text-sm">还没有文章，点击右上角新建。</p></BrutalCard>
      ) : (
        <div className="brutal-card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted text-xs tracking-wider">
                <th className="p-4 font-medium">标题</th>
                <th className="p-4 font-medium">Slug</th>
                <th className="p-4 font-medium">状态</th>
                <th className="p-4 font-medium">发布日期</th>
                <th className="p-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors">
                  <td className="p-4 font-medium">{p.title}</td>
                  <td className="p-4 text-text-muted font-mono text-xs">{p.slug}</td>
                  <td className="p-4">
                    <span className={`brutal-tag ${p.status === "published" ? "" : "!text-accent !border-accent/30"}`}>
                      {p.status === "published" ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td className="p-4 text-text-muted">
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("zh-CN") : "—"}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <a href={`/admin/posts/${p.id}/edit`} className="text-text-secondary hover:text-accent">编辑</a>
                    <DeleteButton endpoint="/api/admin/posts" id={p.id} confirm="确认删除这篇文章？" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

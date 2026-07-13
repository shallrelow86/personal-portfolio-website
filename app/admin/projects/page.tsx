import { db, schema } from "@/lib/db";
import { asc } from "drizzle-orm";
import BrutalButton from "@/components/ui/BrutalButton";
import BrutalCard from "@/components/ui/BrutalCard";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const projects = await db
    .select()
    .from(schema.project)
    .orderBy(asc(schema.project.sortOrder));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1">项目</h1>
          <p className="text-text-muted text-sm">管理作品集项目</p>
        </div>
        <BrutalButton href="/admin/projects/new" primary>新建项目</BrutalButton>
      </div>
      {projects.length === 0 ? (
        <BrutalCard><p className="text-text-muted text-sm">还没有项目。</p></BrutalCard>
      ) : (
        <div className="brutal-card !p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted text-xs tracking-wider">
                <th className="p-4 font-medium">项目名称</th>
                <th className="p-4 font-medium">Slug</th>
                <th className="p-4 font-medium">推荐</th>
                <th className="p-4 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors">
                  <td className="p-4 font-medium">{p.title}</td>
                  <td className="p-4 text-text-muted font-mono text-xs">{p.slug}</td>
                  <td className="p-4">
                    {p.featured ? <span className="brutal-tag !text-accent !border-accent/30">推荐</span> : <span className="text-text-muted text-xs">—</span>}
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <a href={`/admin/projects/${p.id}/edit`} className="text-text-secondary hover:text-accent">编辑</a>
                    <DeleteButton endpoint="/api/admin/projects" id={p.id} confirm="确认删除这个项目？" />
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

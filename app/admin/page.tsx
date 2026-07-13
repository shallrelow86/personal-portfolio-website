import { db, schema } from "@/lib/db";
import { count, ne } from "drizzle-orm";
import { getBackupStatus } from "@/lib/backup-status";
import BrutalCard from "@/components/ui/BrutalCard";
import BrutalButton from "@/components/ui/BrutalButton";

export default async function AdminDashboard() {
  const [
    postCount,
    draftCount,
    projectCount,
    bookmarkCount,
    categoryCount,
    embeddingCount,
  ] = await Promise.all([
    db.select({ c: count() }).from(schema.post).get(),
    db.select({ c: count() }).from(schema.post).where(ne(schema.post.status, "published")).get(),
    db.select({ c: count() }).from(schema.project).get(),
    db.select({ c: count() }).from(schema.bookmark).get(),
    db.select({ c: count() }).from(schema.category).get(),
    db.select({ c: count() }).from(schema.embedding).get(),
  ]);

  const { at: lastBackup, stale: backupStale } = await getBackupStatus();

  const stats = [
    { label: "文章", value: postCount?.c ?? 0, hint: draftCount?.c ? `${draftCount.c} 篇草稿` : "" },
    { label: "项目", value: projectCount?.c ?? 0, hint: "" },
    { label: "收藏", value: bookmarkCount?.c ?? 0, hint: "" },
    { label: "分类", value: categoryCount?.c ?? 0, hint: "" },
    { label: "AI 索引", value: embeddingCount?.c ?? 0, hint: "" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl mb-1">概览</h1>
        <p className="text-text-muted text-sm">站点内容与运行状态一览</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {stats.map((s) => (
          <BrutalCard key={s.label}>
            <div className="font-mono text-4xl font-bold">{s.value}</div>
            <div className="text-text-muted text-sm mt-2">{s.label}</div>
            {s.hint && <div className="text-accent text-xs mt-1 font-mono">{s.hint}</div>}
          </BrutalCard>
        ))}
      </div>

      <BrutalCard className="mb-8">
        <div className="font-mono text-xs tracking-wider text-text-secondary mb-1">
          最近一次数据库备份
        </div>
        <div className={backupStale ? "text-accent font-mono text-sm" : "text-text-primary font-mono text-sm"}>
          {lastBackup ? lastBackup.toLocaleString("zh-CN") : "无记录"}
          {backupStale && lastBackup && " · 超过 24 小时"}
          {backupStale && !lastBackup && " · 请检查 cron"}
        </div>
      </BrutalCard>

      <div className="flex flex-wrap gap-3">
        <BrutalButton href="/admin/posts/new" primary>写新文章</BrutalButton>
        <BrutalButton href="/admin/projects/new">新建项目</BrutalButton>
        <BrutalButton href="/admin/chat">打开 AI 助手</BrutalButton>
        <BrutalButton href="/admin/settings">站点设置</BrutalButton>
      </div>
    </div>
  );
}

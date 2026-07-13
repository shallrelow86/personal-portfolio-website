import { db, schema } from "@/lib/db";
import { desc } from "drizzle-orm";
import BrutalButton from "@/components/ui/BrutalButton";
import BrutalCard from "@/components/ui/BrutalCard";
import DeleteButton from "@/components/admin/DeleteButton";
import { parseJsonArray } from "@/lib/json";

export const dynamic = "force-dynamic";

export default async function AdminBookmarksPage() {
  const bookmarks = await db
    .select()
    .from(schema.bookmark)
    .orderBy(desc(schema.bookmark.createdAt));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1">收藏</h1>
          <p className="text-text-muted text-sm">收藏的网站与外链</p>
        </div>
        <BrutalButton href="/admin/bookmarks/new" primary>新建收藏</BrutalButton>
      </div>
      {bookmarks.length === 0 ? (
        <BrutalCard><p className="text-text-muted text-sm">还没有收藏。</p></BrutalCard>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {bookmarks.map((b) => {
            const tags = parseJsonArray(b.tags);
            return (
              <BrutalCard key={b.id}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <a href={b.url} target="_blank" rel="noreferrer" className="font-medium hover:text-accent">
                    {b.title}
                  </a>
                  <div className="flex gap-2 text-xs shrink-0">
                    <a href={`/admin/bookmarks/${b.id}/edit`} className="text-text-secondary hover:text-accent">编辑</a>
                    <DeleteButton endpoint="/api/admin/bookmarks" id={b.id} confirm="确认删除这个收藏？" />
                  </div>
                </div>
                <p className="text-text-muted text-xs font-mono truncate mb-2">{b.url}</p>
                {b.description && <p className="text-text-secondary text-sm mb-2 line-clamp-2">{b.description}</p>}
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => <span key={t} className="brutal-tag">{t}</span>)}
                </div>
              </BrutalCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

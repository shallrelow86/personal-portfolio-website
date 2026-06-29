import { db, schema } from "@/lib/db";
import BrutalCard from "@/components/ui/BrutalCard";
import BrutalButton from "@/components/ui/BrutalButton";

export default async function AdminDashboard() {
  const posts = await db.select().from(schema.post);
  const projects = await db.select().from(schema.project);

  return (
    <div>
      <h1 className="font-display text-3xl mb-8">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6 mb-10">
        <BrutalCard>
          <div className="font-mono text-5xl font-bold">{posts.length}</div>
          <div className="text-text-muted text-sm mt-2">Posts</div>
        </BrutalCard>
        <BrutalCard>
          <div className="font-mono text-5xl font-bold">{projects.length}</div>
          <div className="text-text-muted text-sm mt-2">Projects</div>
        </BrutalCard>
        <BrutalCard>
          <div className="font-mono text-5xl font-bold">v2</div>
          <div className="text-text-muted text-sm mt-2">Version</div>
        </BrutalCard>
      </div>
      <div className="flex gap-4">
        <BrutalButton href="/admin/posts/new">New Post</BrutalButton>
        <BrutalButton href="/admin/projects/new">New Project</BrutalButton>
      </div>
    </div>
  );
}

import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { syncEmbedding, deleteEmbedding } from "@/lib/sync-embedding";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const project = await db
    .select()
    .from(schema.project)
    .where(eq(schema.project.id, Number(id)))
    .get();

  if (!project)
    return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(project);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const body = await req.json();

  const result = await db
    .update(schema.project)
    .set({
      title: body.title,
      slug: body.slug,
      description: body.description,
      body: body.body || "",
      coverImage: body.coverImage || "",
      screenshots: JSON.stringify(body.screenshots || []),
      techStack: JSON.stringify(body.techStack || []),
      githubUrl: body.githubUrl || "",
      liveUrl: body.liveUrl || "",
      featured: body.featured ? 1 : 0,
      sortOrder: body.sortOrder || 0,
      updatedAt: Date.now(),
    })
    .where(eq(schema.project.id, Number(id)));

  if (result.changes === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  syncEmbedding("project", Number(id));
  return Response.json({ ok: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const err = await requireAdmin();
  if (err) return err;

  const { id } = await params;
  const result = await db.delete(schema.project).where(eq(schema.project.id, Number(id)));
  if (result.changes === 0) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  deleteEmbedding("project", Number(id));
  return Response.json({ ok: true });
}

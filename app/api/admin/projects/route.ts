import { requireAdmin } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { asc } from "drizzle-orm";

export async function GET() {
  const err = await requireAdmin();
  if (err) return err;

  const projects = await db
    .select()
    .from(schema.project)
    .orderBy(asc(schema.project.sortOrder));

  return Response.json(projects);
}

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const body = await req.json();
  const now = Date.now();

  const result = await db.insert(schema.project).values({
    title: body.title,
    slug: body.slug,
    description: body.description || "",
    body: body.body || "",
    coverImage: body.coverImage || "",
    screenshots: JSON.stringify(body.screenshots || []),
    techStack: JSON.stringify(body.techStack || []),
    githubUrl: body.githubUrl || "",
    liveUrl: body.liveUrl || "",
    featured: body.featured ? 1 : 0,
    sortOrder: body.sortOrder || 0,
    createdAt: now,
    updatedAt: now,
  });

  return Response.json(
    { id: Number(result.lastInsertRowid) },
    { status: 201 }
  );
}

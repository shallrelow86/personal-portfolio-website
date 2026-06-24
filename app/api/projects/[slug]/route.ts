import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const project = await db
    .select()
    .from(schema.project)
    .where(eq(schema.project.slug, slug))
    .get();

  if (!project) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json({
    ...project,
    techStack: JSON.parse(project.techStack),
    screenshots: JSON.parse(project.screenshots),
    featured: Boolean(project.featured),
  });
}

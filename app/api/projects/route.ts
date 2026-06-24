import { db, schema } from "@/lib/db";
import { asc } from "drizzle-orm";

export async function GET() {
  const projects = await db
    .select()
    .from(schema.project)
    .orderBy(asc(schema.project.sortOrder));

  return Response.json(
    projects.map((p) => ({
      ...p,
      techStack: JSON.parse(p.techStack),
      screenshots: JSON.parse(p.screenshots),
      featured: Boolean(p.featured),
    }))
  );
}

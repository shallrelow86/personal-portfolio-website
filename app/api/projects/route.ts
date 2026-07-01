import { db, schema } from "@/lib/db";
import { asc } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  const projects = await db
    .select()
    .from(schema.project)
    .orderBy(asc(schema.project.sortOrder))
    .limit(limit)
    .offset(offset);

  return Response.json(
    projects.map((p) => ({
      ...p,
      techStack: JSON.parse(p.techStack),
      screenshots: JSON.parse(p.screenshots),
      featured: Boolean(p.featured),
    }))
  );
}

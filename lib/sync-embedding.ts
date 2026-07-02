import { generateEmbedding, buildContentText } from "./embedding";
import { db, schema } from "./db";
import { eq, and } from "drizzle-orm";

export async function syncEmbedding(
  sourceType: "post" | "project" | "bookmark" | "profile",
  sourceId: number
) {
  setImmediate(async () => {
    try {
      let contentText = "";

      if (sourceType === "post") {
        const item = await db.select().from(schema.post).where(eq(schema.post.id, sourceId)).get();
        if (!item) return;
        contentText = buildContentText({
          title: item.title,
          excerpt: item.excerpt,
          body: item.body,
          tags: JSON.parse(item.tags),
        });
      } else if (sourceType === "project") {
        const item = await db.select().from(schema.project).where(eq(schema.project.id, sourceId)).get();
        if (!item) return;
        contentText = buildContentText({
          title: item.title,
          description: item.description,
          body: item.body,
          techStack: JSON.parse(item.techStack),
        });
      } else if (sourceType === "bookmark") {
        const item = await db.select().from(schema.bookmark).where(eq(schema.bookmark.id, sourceId)).get();
        if (!item) return;
        contentText = buildContentText({
          title: item.title,
          description: item.description,
          body: item.reason,
          tags: JSON.parse(item.tags),
        });
      } else if (sourceType === "profile") {
        const item = await db.select().from(schema.profile).where(eq(schema.profile.id, sourceId)).get();
        if (!item) return;
        contentText = buildContentText({
          title: item.name,
          description: `${item.title} - ${item.bio}`,
          tags: JSON.parse(item.skills),
        });
      }

      const vec = await generateEmbedding(contentText);
      const buf = Buffer.from(new Float64Array(vec).buffer);

      await db.delete(schema.embedding).where(
        and(eq(schema.embedding.sourceType, sourceType), eq(schema.embedding.sourceId, sourceId))
      );
      await db.insert(schema.embedding).values({
        sourceType, sourceId, content: contentText, embedding: buf,
      });
    } catch (e) {
      console.error(`Embedding sync failed for ${sourceType}#${sourceId}:`, e);
    }
  });
}

export async function deleteEmbedding(sourceType: string, sourceId: number) {
  setImmediate(async () => {
    await db.delete(schema.embedding).where(
      and(eq(schema.embedding.sourceType, sourceType), eq(schema.embedding.sourceId, sourceId))
    );
  });
}

export async function rebuildAllEmbeddings() {
  const [posts, projects, bookmarks, profile] = await Promise.all([
    db.select().from(schema.post),
    db.select().from(schema.project),
    db.select().from(schema.bookmark),
    db.select().from(schema.profile).where(eq(schema.profile.id, 1)).get(),
  ]);

  await db.delete(schema.embedding);

  for (const p of posts) await syncEmbedding("post", p.id);
  for (const p of projects) await syncEmbedding("project", p.id);
  for (const b of bookmarks) await syncEmbedding("bookmark", b.id);
  if (profile) await syncEmbedding("profile", profile.id);
}

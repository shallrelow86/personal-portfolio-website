import { generateEmbedding, buildContentText, vectorToBuffer, EMBEDDING_DIM } from "./embedding";
import { parseJsonArray } from "./json";
import { db, schema } from "./db";
import { eq, and } from "drizzle-orm";
import { getCategoryPath } from "./categories";

let rebuildMutex = Promise.resolve();

export type SyncResult = { ok: boolean; error?: string };

export async function syncEmbedding(
  sourceType: "post" | "project" | "bookmark" | "profile",
  sourceId: number
): Promise<SyncResult> {
  try {
    let contentText = "";

    if (sourceType === "post") {
      const item = await db.select().from(schema.post).where(eq(schema.post.id, sourceId)).get();
      if (!item || item.status !== "published") {
        await db.delete(schema.embedding).where(
          and(eq(schema.embedding.sourceType, sourceType), eq(schema.embedding.sourceId, sourceId))
        );
        return { ok: true };
      }
      const categoryPath = await getCategoryPath(item.categoryId);
      contentText = buildContentText({
        title: item.title,
        excerpt: item.excerpt,
        body: item.body,
        tags: parseJsonArray(item.tags),
        categoryPath,
      });
    } else if (sourceType === "project") {
      const item = await db.select().from(schema.project).where(eq(schema.project.id, sourceId)).get();
      if (!item) {
        await db.delete(schema.embedding).where(
          and(eq(schema.embedding.sourceType, sourceType), eq(schema.embedding.sourceId, sourceId))
        );
        return { ok: true };
      }
      contentText = buildContentText({
        title: item.title,
        description: item.description,
        body: item.body,
        bodyMax: 800,
        aiContext: item.aiContext || "",
        techStack: parseJsonArray(item.techStack),
      });
    } else if (sourceType === "bookmark") {
      const item = await db.select().from(schema.bookmark).where(eq(schema.bookmark.id, sourceId)).get();
      if (!item) {
        await db.delete(schema.embedding).where(
          and(eq(schema.embedding.sourceType, sourceType), eq(schema.embedding.sourceId, sourceId))
        );
        return { ok: true };
      }
      const categoryPath = await getCategoryPath(item.categoryId);
      contentText = buildContentText({
        title: item.title,
        description: item.description,
        body: item.reason,
        tags: parseJsonArray(item.tags),
        categoryPath,
      });
    } else if (sourceType === "profile") {
      const item = await db.select().from(schema.profile).where(eq(schema.profile.id, sourceId)).get();
      if (!item) {
        await db.delete(schema.embedding).where(
          and(eq(schema.embedding.sourceType, sourceType), eq(schema.embedding.sourceId, sourceId))
        );
        return { ok: true };
      }
      contentText = buildContentText({
        title: item.name,
        description: `${item.title} - ${item.bio}`,
        tags: parseJsonArray(item.skills),
      });
    }

    const vec = await generateEmbedding(contentText);
    if (vec.length !== EMBEDDING_DIM) {
      throw new Error(`Embedding dim mismatch: ${vec.length}`);
    }
    const buf = vectorToBuffer(vec);

    db.delete(schema.embedding).where(
      and(eq(schema.embedding.sourceType, sourceType), eq(schema.embedding.sourceId, sourceId))
    );
    db.insert(schema.embedding).values({
      sourceType, sourceId, content: contentText, embedding: buf,
    }).run();
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`Embedding sync failed for ${sourceType}#${sourceId}:`, e);
    return { ok: false, error: msg };
  }
}

export async function deleteEmbedding(sourceType: string, sourceId: number): Promise<void> {
  try {
    await db.delete(schema.embedding).where(
      and(eq(schema.embedding.sourceType, sourceType), eq(schema.embedding.sourceId, sourceId))
    );
  } catch (e) {
    console.error(`Embedding delete failed for ${sourceType}#${sourceId}:`, e);
  }
}

export async function rebuildAllEmbeddings(): Promise<{ total: number; done: number; failed: number }> {
  const release = await acquireRebuildLock();
  try {
    const [posts, projects, bookmarks, profile] = await Promise.all([
      db.select({ id: schema.post.id }).from(schema.post).where(eq(schema.post.status, "published")),
      db.select({ id: schema.project.id }).from(schema.project),
      db.select({ id: schema.bookmark.id }).from(schema.bookmark),
      db.select({ id: schema.profile.id }).from(schema.profile).where(eq(schema.profile.id, 1)).get(),
    ]);

    const tasks: Array<["post" | "project" | "bookmark" | "profile", number]> = [
      ...posts.map((p) => ["post", p.id] as ["post", number]),
      ...projects.map((p) => ["project", p.id] as ["project", number]),
      ...bookmarks.map((b) => ["bookmark", b.id] as ["bookmark", number]),
    ];
    if (profile) tasks.push(["profile", profile.id]);

    await db.delete(schema.embedding);

    let done = 0;
    let failed = 0;
    for (const [type, id] of tasks) {
      try {
        await syncEmbeddingForce(type, id);
        done++;
      } catch (e) {
        failed++;
        console.error(`[rebuild] failed ${type}#${id}:`, e instanceof Error ? e.message : e);
      }
    }
    return { total: tasks.length, done, failed };
  } finally {
    release();
  }
}

async function syncEmbeddingForce(
  sourceType: "post" | "project" | "bookmark" | "profile",
  sourceId: number
): Promise<void> {
  let contentText = "";
  if (sourceType === "post") {
    const item = await db.select().from(schema.post).where(eq(schema.post.id, sourceId)).get();
    if (!item) return;
    const categoryPath = await getCategoryPath(item.categoryId);
    contentText = buildContentText({
      title: item.title, excerpt: item.excerpt, body: item.body,
      tags: parseJsonArray(item.tags),
      categoryPath,
    });
  } else if (sourceType === "project") {
    const item = await db.select().from(schema.project).where(eq(schema.project.id, sourceId)).get();
    if (!item) return;
    contentText = buildContentText({
      title: item.title,
      description: item.description,
      body: item.body,
      bodyMax: 800,
      aiContext: item.aiContext || "",
      techStack: parseJsonArray(item.techStack),
    });
  } else if (sourceType === "bookmark") {
    const item = await db.select().from(schema.bookmark).where(eq(schema.bookmark.id, sourceId)).get();
    if (!item) return;
    const categoryPath = await getCategoryPath(item.categoryId);
    contentText = buildContentText({
      title: item.title, description: item.description, body: item.reason,
      tags: parseJsonArray(item.tags),
      categoryPath,
    });
  } else {
    const item = await db.select().from(schema.profile).where(eq(schema.profile.id, sourceId)).get();
    if (!item) return;
    contentText = buildContentText({
      title: item.name, description: `${item.title} - ${item.bio}`,
      tags: parseJsonArray(item.skills),
    });
  }

  const vec = await generateEmbedding(contentText);
  const buf = vectorToBuffer(vec);
  db.delete(schema.embedding).where(
    and(eq(schema.embedding.sourceType, sourceType), eq(schema.embedding.sourceId, sourceId))
  );
  db.insert(schema.embedding).values({
    sourceType, sourceId, content: contentText, embedding: buf,
  }).run();
}

function acquireRebuildLock(): Promise<() => void> {
  let release!: () => void;
  const prev = rebuildMutex;
  rebuildMutex = new Promise<void>((resolve) => {
    release = resolve;
  });
  return prev.then(() => release);
}

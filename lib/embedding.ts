import { db, schema } from "@/lib/db";
import { inArray, eq } from "drizzle-orm";
import { getEmbedConfig, llmHeaders, requireChatEnv } from "./env";

export function getEmbeddingDim(): number {
  return getEmbedConfig().dim;
}

export const EMBEDDING_DIM = getEmbeddingDim();

export async function generateEmbedding(text: string): Promise<Float32Array> {
  requireChatEnv();
  const cfg = getEmbedConfig();
  const res = await fetch(`${cfg.baseUrl}/embeddings`, {
    method: "POST",
    headers: llmHeaders(cfg.apiKey),
    body: JSON.stringify({ model: cfg.model, input: text }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Embedding API ${res.status}: ${errText}`);
  }
  const data = await res.json();
  if (data.error) throw new Error(`Embedding failed: ${data.error.message}`);
  const vec: unknown = data?.data?.[0]?.embedding;
  if (!Array.isArray(vec) || vec.length === 0) {
    throw new Error("Embedding API returned empty vector");
  }
  const expected = getEmbeddingDim();
  if (vec.length !== expected) {
    throw new Error(`Embedding dim mismatch: got ${vec.length}, expected ${expected}`);
  }
  return Float32Array.from(vec as number[]);
}

export function vectorToBuffer(vec: Float32Array): Buffer {
  return Buffer.from(vec.buffer, vec.byteOffset, vec.byteLength);
}

export function bufferToVector(buf: Buffer): Float32Array {
  const byteLen = buf.byteLength;
  if (byteLen === getEmbeddingDim() * 8) {
    const f64 = new Float64Array(buf.buffer, buf.byteOffset, byteLen / 8);
    return Float32Array.from(f64);
  }
  return new Float32Array(buf.buffer, buf.byteOffset, byteLen / 4);
}

export function cosineSimilarity(a: ArrayLike<number>, b: ArrayLike<number>): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dim mismatch: ${a.length} vs ${b.length}`);
  }
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    const av = (a as Float32Array)[i];
    const bv = (b as Float32Array)[i];
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export function buildContentText(item: {
  title: string;
  excerpt?: string;
  body?: string;
  bodyMax?: number;
  tags?: string[];
  categoryPath?: string;
  techStack?: string[];
  description?: string;
  aiContext?: string;
}): string {
  const parts = [`标题: ${item.title}`];
  if (item.description) parts.push(`描述: ${item.description}`);
  if (item.excerpt) parts.push(`摘要: ${item.excerpt}`);
  if (item.aiContext) parts.push(`AI资料: ${item.aiContext}`);
  if (item.body) {
    const max = item.bodyMax ?? 200;
    parts.push(`正文: ${item.body.slice(0, max)}`);
  }
  if (item.tags?.length) parts.push(`标签: ${item.tags.join(", ")}`);
  if (item.techStack?.length) parts.push(`技术栈: ${item.techStack.join(", ")}`);
  if (item.categoryPath) parts.push(`分类: ${item.categoryPath}`);
  return parts.join(" | ");
}

export async function searchSimilar(
  queryEmbedding: Float32Array,
  sourceTypes: string[],
  limit: number = 3,
  publishedPostsOnly: boolean = false
) {
  const rows = await db
    .select()
    .from(schema.embedding)
    .where(inArray(schema.embedding.sourceType, sourceTypes));

  let filtered = rows;
  if (publishedPostsOnly) {
    const publishedIds = new Set(
      (await db.select({ id: schema.post.id }).from(schema.post).where(eq(schema.post.status, "published")))
        .map((p) => p.id)
    );
    filtered = rows.filter((row) => row.sourceType !== "post" || publishedIds.has(row.sourceId));
  }

  const scored = filtered.map((row) => {
    let score = 0;
    try {
      score = cosineSimilarity(queryEmbedding, bufferToVector(row.embedding as Buffer));
    } catch {
      score = -1;
    }
    return { ...row, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

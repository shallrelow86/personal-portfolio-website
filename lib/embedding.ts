import { db, schema } from "@/lib/db";
import { inArray } from "drizzle-orm";

const SF_BASE = "https://api.siliconflow.cn/v1/embeddings";
const SF_MODEL = "BAAI/bge-large-zh-v1.5";

export async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch(SF_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SILICONFLOW_API_KEY}`,
    },
    body: JSON.stringify({ model: SF_MODEL, input: text }),
  });
  const data = await res.json();
  if (data.error) throw new Error(`Embedding failed: ${data.error.message}`);
  return data.data[0].embedding;
}

export function cosineSimilarity(a: number[], b: number[] | Float64Array): number {
  let dot = 0, normA = 0, normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function buildContentText(item: {
  title: string; excerpt?: string; body?: string;
  tags?: string[]; categoryPath?: string; techStack?: string[]; description?: string;
}): string {
  const parts = [`标题: ${item.title}`];
  if (item.description) parts.push(`描述: ${item.description}`);
  if (item.excerpt) parts.push(`摘要: ${item.excerpt}`);
  if (item.body) parts.push(`正文: ${item.body.slice(0, 200)}`);
  if (item.tags?.length) parts.push(`标签: ${item.tags.join(", ")}`);
  if (item.techStack?.length) parts.push(`技术栈: ${item.techStack.join(", ")}`);
  if (item.categoryPath) parts.push(`分类: ${item.categoryPath}`);
  return parts.join(" | ");
}

function blobToVector(buf: Buffer): Float64Array {
  return new Float64Array(buf.buffer, buf.byteOffset, buf.byteLength / 8);
}

export async function searchSimilar(
  queryEmbedding: number[],
  sourceTypes: string[],
  limit: number = 3
) {
  const rows = await db
    .select()
    .from(schema.embedding)
    .where(inArray(schema.embedding.sourceType, sourceTypes));

  const scored = rows.map((row) => ({
    ...row,
    score: cosineSimilarity(queryEmbedding, blobToVector(row.embedding as Buffer)),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

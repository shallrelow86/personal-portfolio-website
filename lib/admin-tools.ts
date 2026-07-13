import { db, schema } from "./db";
import { asc, desc, eq, like, or } from "drizzle-orm";
import { parseJsonArray } from "./json";
import {
  makeSlug,
  type CategoryInput,
  type PostInput,
  type PreviewEvent,
  type ProjectInput,
} from "./preview-types";

export type { CategoryInput, PostInput, PreviewEvent, ProjectInput };
export { makeSlug, validateCategoryInput, validatePostInput, validateProjectInput } from "./preview-types";

export const ADMIN_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "list_posts",
      description: "列出文章（标题、slug、状态）",
      parameters: {
        type: "object",
        properties: { limit: { type: "number", description: "最多返回条数，默认20" } },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_post",
      description: "按 id 获取文章详情",
      parameters: {
        type: "object",
        properties: { id: { type: "number" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "list_projects",
      description: "列出项目",
      parameters: {
        type: "object",
        properties: { limit: { type: "number" } },
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_project",
      description: "按 id 获取项目详情",
      parameters: {
        type: "object",
        properties: { id: { type: "number" } },
        required: ["id"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_categories",
      description: "获取全部分类",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "search_content",
      description: "按关键词搜索文章与项目标题",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_post",
      description: "生成新建文章预览（不直接写入）。缺字段时先向用户追问。",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          slug: { type: "string" },
          body: { type: "string" },
          excerpt: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
          categoryId: { type: "number" },
          status: { type: "string", enum: ["draft", "published"] },
        },
        required: ["title", "body"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_project",
      description: "生成新建项目预览（不直接写入）。缺字段时先向用户追问。",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          slug: { type: "string" },
          description: { type: "string" },
          body: { type: "string" },
          aiContext: { type: "string" },
          techStack: { type: "array", items: { type: "string" } },
          githubUrl: { type: "string" },
          liveUrl: { type: "string" },
          featured: { type: "boolean" },
        },
        required: ["title", "description"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_category",
      description: "生成新建分类预览（不直接写入）",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          slug: { type: "string" },
          parentId: { type: "number" },
          sortOrder: { type: "number" },
        },
        required: ["name"],
      },
    },
  },
];

const WRITE_TOOLS = new Set(["create_post", "create_project", "create_category"]);

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNumberOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

export function toolResultToPreview(name: string, args: Record<string, unknown>): PreviewEvent | null {
  if (name === "create_post") {
    const title = asString(args.title).trim();
    if (!title) return null;
    const data: PostInput = {
      title,
      slug: asString(args.slug).trim() || makeSlug(title),
      body: asString(args.body),
      excerpt: asString(args.excerpt),
      tags: asStringArray(args.tags),
      coverImage: "",
      categoryId: asNumberOrNull(args.categoryId),
      status: args.status === "draft" ? "draft" : "published",
    };
    return { type: "preview_create_post", data };
  }
  if (name === "create_project") {
    const title = asString(args.title).trim();
    if (!title) return null;
    const data: ProjectInput = {
      title,
      slug: asString(args.slug).trim() || makeSlug(title),
      description: asString(args.description),
      body: asString(args.body),
      aiContext: asString(args.aiContext),
      coverImage: "",
      screenshots: [],
      techStack: asStringArray(args.techStack),
      githubUrl: asString(args.githubUrl),
      liveUrl: asString(args.liveUrl),
      featured: Boolean(args.featured),
      sortOrder: typeof args.sortOrder === "number" ? args.sortOrder : 0,
    };
    return { type: "preview_create_project", data };
  }
  if (name === "create_category") {
    const nameVal = asString(args.name).trim();
    if (!nameVal) return null;
    const data: CategoryInput = {
      name: nameVal,
      slug: asString(args.slug).trim() || makeSlug(nameVal),
      parentId: asNumberOrNull(args.parentId),
      sortOrder: typeof args.sortOrder === "number" ? args.sortOrder : 0,
    };
    return { type: "preview_create_category", data };
  }
  return null;
}

export async function executeReadTool(name: string, args: Record<string, unknown>): Promise<string> {
  const limit = typeof args.limit === "number" && args.limit > 0 ? Math.min(args.limit, 50) : 20;

  if (name === "list_posts") {
    const rows = await db
      .select({
        id: schema.post.id,
        title: schema.post.title,
        slug: schema.post.slug,
        status: schema.post.status,
        categoryId: schema.post.categoryId,
      })
      .from(schema.post)
      .orderBy(desc(schema.post.createdAt))
      .limit(limit);
    return JSON.stringify(rows);
  }

  if (name === "get_post") {
    const id = asNumberOrNull(args.id);
    if (!id) return JSON.stringify({ error: "id required" });
    const row = await db.select().from(schema.post).where(eq(schema.post.id, id)).get();
    if (!row) return JSON.stringify({ error: "not found" });
    return JSON.stringify({
      ...row,
      tags: parseJsonArray(row.tags),
    });
  }

  if (name === "list_projects") {
    const rows = await db
      .select({
        id: schema.project.id,
        title: schema.project.title,
        slug: schema.project.slug,
        featured: schema.project.featured,
        description: schema.project.description,
      })
      .from(schema.project)
      .orderBy(asc(schema.project.sortOrder))
      .limit(limit);
    return JSON.stringify(rows);
  }

  if (name === "get_project") {
    const id = asNumberOrNull(args.id);
    if (!id) return JSON.stringify({ error: "id required" });
    const row = await db.select().from(schema.project).where(eq(schema.project.id, id)).get();
    if (!row) return JSON.stringify({ error: "not found" });
    return JSON.stringify({
      ...row,
      techStack: parseJsonArray(row.techStack),
      screenshots: parseJsonArray(row.screenshots),
    });
  }

  if (name === "get_categories") {
    const rows = await db.select().from(schema.category).orderBy(asc(schema.category.sortOrder));
    return JSON.stringify(rows);
  }

  if (name === "search_content") {
    const q = asString(args.query).trim();
    if (!q) return JSON.stringify({ error: "query required" });
    const pattern = `%${q}%`;
    const [posts, projects] = await Promise.all([
      db
        .select({ id: schema.post.id, title: schema.post.title, slug: schema.post.slug, status: schema.post.status })
        .from(schema.post)
        .where(or(like(schema.post.title, pattern), like(schema.post.excerpt, pattern)))
        .limit(10),
      db
        .select({
          id: schema.project.id,
          title: schema.project.title,
          slug: schema.project.slug,
          description: schema.project.description,
        })
        .from(schema.project)
        .where(or(like(schema.project.title, pattern), like(schema.project.description, pattern)))
        .limit(10),
    ]);
    return JSON.stringify({ posts, projects });
  }

  return JSON.stringify({ error: `unknown tool ${name}` });
}

export function isWriteTool(name: string): boolean {
  return WRITE_TOOLS.has(name);
}

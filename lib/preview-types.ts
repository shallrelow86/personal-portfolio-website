export type PostInput = {
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  tags: string[];
  coverImage: string;
  categoryId: number | null;
  status: "draft" | "published";
};

export type ProjectInput = {
  title: string;
  slug: string;
  description: string;
  body: string;
  aiContext: string;
  coverImage: string;
  screenshots: string[];
  techStack: string[];
  githubUrl: string;
  liveUrl: string;
  featured: boolean;
  sortOrder: number;
};

export type CategoryInput = {
  name: string;
  slug: string;
  parentId: number | null;
  sortOrder: number;
};

export type PreviewEvent =
  | { type: "preview_create_post"; data: PostInput }
  | { type: "preview_create_project"; data: ProjectInput }
  | { type: "preview_create_category"; data: CategoryInput };

export function makeSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fff-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (base) return base.slice(0, 60);
  return `item-${Date.now().toString(36)}`;
}

export function validatePostInput(data: PostInput): string[] {
  const errors: string[] = [];
  if (!data.title.trim()) errors.push("标题不能为空");
  if (!data.slug.trim()) errors.push("Slug 不能为空");
  if (!data.body.trim()) errors.push("正文不能为空");
  if (data.status !== "draft" && data.status !== "published") errors.push("状态无效");
  return errors;
}

export function validateProjectInput(data: ProjectInput): string[] {
  const errors: string[] = [];
  if (!data.title.trim()) errors.push("项目名称不能为空");
  if (!data.slug.trim()) errors.push("Slug 不能为空");
  if (!data.description.trim()) errors.push("简述不能为空");
  return errors;
}

export function validateCategoryInput(data: CategoryInput): string[] {
  const errors: string[] = [];
  if (!data.name.trim()) errors.push("分类名不能为空");
  if (!data.slug.trim()) errors.push("Slug 不能为空");
  return errors;
}

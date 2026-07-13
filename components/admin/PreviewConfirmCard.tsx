"use client";
import { useMemo, useState } from "react";
import type {
  CategoryInput,
  PostInput,
  PreviewEvent,
  ProjectInput,
} from "@/lib/preview-types";
import {
  validateCategoryInput,
  validatePostInput,
  validateProjectInput,
} from "@/lib/preview-types";

type Props = {
  preview: PreviewEvent;
  onDismiss: () => void;
  onSuccess: (msg: string) => void;
};

export default function PreviewConfirmCard({ preview, onDismiss, onSuccess }: Props) {
  if (preview.type === "preview_create_post") {
    return <PostPreview data={preview.data} onDismiss={onDismiss} onSuccess={onSuccess} />;
  }
  if (preview.type === "preview_create_project") {
    return <ProjectPreview data={preview.data} onDismiss={onDismiss} onSuccess={onSuccess} />;
  }
  return <CategoryPreview data={preview.data} onDismiss={onDismiss} onSuccess={onSuccess} />;
}

function PostPreview({
  data: initial,
  onDismiss,
  onSuccess,
}: {
  data: PostInput;
  onDismiss: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [data, setData] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const errors = useMemo(() => validatePostInput(data), [data]);

  const confirm = async () => {
    if (errors.length) {
      setErr(errors.join("；"));
      return;
    }
    setSaving(true);
    setErr("");
    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setErr(body.error || "创建失败");
      return;
    }
    const synced = body.embeddingSynced !== false;
    onSuccess(
      synced
        ? `文章「${data.title}」已创建，知识库已同步`
        : `文章「${data.title}」已创建，但知识库同步失败，请到设置页重建索引`
    );
  };

  return (
    <div className="mt-3 rounded-xl border border-accent/30 bg-accent-soft/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-wider text-accent">预览 · 新建文章</p>
        <button type="button" onClick={onDismiss} className="text-text-muted text-xs hover:text-accent">
          忽略
        </button>
      </div>
      <Field label="标题" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
      <Field label="Slug" value={data.slug} onChange={(v) => setData({ ...data, slug: v })} />
      <Field label="摘要" value={data.excerpt} onChange={(v) => setData({ ...data, excerpt: v })} />
      <Field
        label="正文"
        value={data.body}
        onChange={(v) => setData({ ...data, body: v })}
        multiline
      />
      <Field
        label="标签（逗号分隔）"
        value={data.tags.join(", ")}
        onChange={(v) =>
          setData({
            ...data,
            tags: v.split(",").map((t) => t.trim()).filter(Boolean),
          })
        }
      />
      <label className="flex items-center gap-2 text-sm">
        <span className="font-mono text-xs text-text-secondary">状态</span>
        <select
          className="brutal-input !w-auto"
          value={data.status}
          onChange={(e) =>
            setData({ ...data, status: e.target.value === "draft" ? "draft" : "published" })
          }
        >
          <option value="published">发布</option>
          <option value="draft">草稿</option>
        </select>
      </label>
      {err && <p className="text-accent text-xs">{err}</p>}
      {errors.length > 0 && !err && (
        <p className="text-amber-700 text-xs">{errors.join("；")}</p>
      )}
      <button
        type="button"
        disabled={saving || errors.length > 0}
        onClick={confirm}
        className="brutal-btn brutal-btn-primary"
      >
        {saving ? "创建中…" : "确认创建"}
      </button>
    </div>
  );
}

function ProjectPreview({
  data: initial,
  onDismiss,
  onSuccess,
}: {
  data: ProjectInput;
  onDismiss: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [data, setData] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const errors = useMemo(() => validateProjectInput(data), [data]);

  const confirm = async () => {
    if (errors.length) {
      setErr(errors.join("；"));
      return;
    }
    setSaving(true);
    setErr("");
    const res = await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setErr(body.error || "创建失败");
      return;
    }
    const synced = body.embeddingSynced !== false;
    onSuccess(
      synced
        ? `项目「${data.title}」已创建，知识库已同步`
        : `项目「${data.title}」已创建，但知识库同步失败，请到设置页重建索引`
    );
  };

  return (
    <div className="mt-3 rounded-xl border border-accent/30 bg-accent-soft/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-wider text-accent">预览 · 新建项目</p>
        <button type="button" onClick={onDismiss} className="text-text-muted text-xs hover:text-accent">
          忽略
        </button>
      </div>
      <Field label="项目名称" value={data.title} onChange={(v) => setData({ ...data, title: v })} />
      <Field label="Slug" value={data.slug} onChange={(v) => setData({ ...data, slug: v })} />
      <Field
        label="简述"
        value={data.description}
        onChange={(v) => setData({ ...data, description: v })}
        multiline
      />
      <Field
        label="正文"
        value={data.body}
        onChange={(v) => setData({ ...data, body: v })}
        multiline
      />
      <Field
        label="技术栈（逗号分隔）"
        value={data.techStack.join(", ")}
        onChange={(v) =>
          setData({
            ...data,
            techStack: v.split(",").map((t) => t.trim()).filter(Boolean),
          })
        }
      />
      <Field
        label="GitHub"
        value={data.githubUrl}
        onChange={(v) => setData({ ...data, githubUrl: v })}
      />
      <Field label="演示链接" value={data.liveUrl} onChange={(v) => setData({ ...data, liveUrl: v })} />
      {err && <p className="text-accent text-xs">{err}</p>}
      {errors.length > 0 && !err && (
        <p className="text-amber-700 text-xs">{errors.join("；")}</p>
      )}
      <button
        type="button"
        disabled={saving || errors.length > 0}
        onClick={confirm}
        className="brutal-btn brutal-btn-primary"
      >
        {saving ? "创建中…" : "确认创建"}
      </button>
    </div>
  );
}

function CategoryPreview({
  data: initial,
  onDismiss,
  onSuccess,
}: {
  data: CategoryInput;
  onDismiss: () => void;
  onSuccess: (msg: string) => void;
}) {
  const [data, setData] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const errors = useMemo(() => validateCategoryInput(data), [data]);

  const confirm = async () => {
    if (errors.length) {
      setErr(errors.join("；"));
      return;
    }
    setSaving(true);
    setErr("");
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setErr(body.error || "创建失败");
      return;
    }
    onSuccess(`分类「${data.name}」已创建`);
  };

  return (
    <div className="mt-3 rounded-xl border border-accent/30 bg-accent-soft/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-wider text-accent">预览 · 新建分类</p>
        <button type="button" onClick={onDismiss} className="text-text-muted text-xs hover:text-accent">
          忽略
        </button>
      </div>
      <Field label="名称" value={data.name} onChange={(v) => setData({ ...data, name: v })} />
      <Field label="Slug" value={data.slug} onChange={(v) => setData({ ...data, slug: v })} />
      {err && <p className="text-accent text-xs">{err}</p>}
      {errors.length > 0 && !err && (
        <p className="text-amber-700 text-xs">{errors.join("；")}</p>
      )}
      <button
        type="button"
        disabled={saving || errors.length > 0}
        onClick={confirm}
        className="brutal-btn brutal-btn-primary"
      >
        {saving ? "创建中…" : "确认创建"}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-xs tracking-wider text-text-secondary mb-1">{label}</span>
      {multiline ? (
        <textarea
          className="brutal-input resize-y min-h-[80px]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input className="brutal-input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

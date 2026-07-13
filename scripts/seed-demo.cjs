const Database = require("better-sqlite3");

const db = new Database("data.db");
const now = Date.now();

db.prepare(
  "UPDATE profile SET name=?, title=?, bio=?, skills=? WHERE id=1"
).run(
  "张三",
  "全栈开发工程师",
  "专注于 Web 开发与 AI 应用，喜欢构建实用的个人项目。",
  JSON.stringify(["TypeScript", "Next.js", "Python", "SQLite", "RAG"])
);

db.prepare(
  "UPDATE site_settings SET site_title=?, site_description=? WHERE id=1"
).run("张三的个人作品集", "项目展示、技术博客与 AI 智能问答");

if (db.prepare("SELECT COUNT(*) as c FROM post").get().c === 0) {
  const ins = db.prepare(
    "INSERT INTO post (title, slug, body, excerpt, tags, published_at, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?)"
  );
  ins.run(
    "用 RAG 搭建个人知识库问答",
    "rag-personal-kb",
    "本文介绍如何用 SQLite 存储向量、Ollama 本地推理，实现基于私有知识库的智能问答。",
    "从零搭建 RAG 问答系统的实践笔记",
    JSON.stringify(["RAG", "Ollama", "Next.js"]),
    now,
    now,
    now
  );
  ins.run(
    "Next.js 16 App Router 踩坑记录",
    "nextjs-app-router-notes",
    "记录 Server Component 直查 DB、SSE 流式 API 的注意事项。",
    "App Router 开发与部署经验",
    JSON.stringify(["Next.js", "SQLite"]),
    now - 86400000,
    now,
    now
  );
}

if (db.prepare("SELECT COUNT(*) as c FROM project").get().c < 2) {
  db.prepare(
    "INSERT INTO project (title, slug, description, body, tech_stack, featured, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, 1, ?, ?)"
  ).run(
    "智能问答实验",
    "qa-lab",
    "本地大模型 + 向量检索 Demo",
    "使用 Ollama 部署 qwen2.5，embedding 用 nomic-embed-text，演示特定领域私有知识库问答。",
    JSON.stringify(["Ollama", "RAG", "Python"]),
    now,
    now
  );
}

console.log("demo data inserted");
db.close();

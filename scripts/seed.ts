import Database from "better-sqlite3";
import { hash } from "bcrypt";
import path from "path";
import fs from "fs";

async function seed() {
  const dbPath =
    process.env.DATABASE_PATH || path.join(process.cwd(), "data.db");
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");

  const migrations = fs
    .readdirSync("drizzle")
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const m of migrations) {
    sqlite.exec(fs.readFileSync(`drizzle/${m}`, "utf-8"));
  }

  const now = Date.now();

  sqlite.exec(`
    INSERT OR IGNORE INTO profile (id, name, title, bio, skills)
    VALUES (1, 'Your Name', 'Developer', '', '[]');
    INSERT OR IGNORE INTO site_settings (id, site_title, site_description)
    VALUES (1, 'My Portfolio', 'Personal portfolio website');
  `);

  sqlite.prepare(`
    UPDATE profile SET
      name = ?,
      title = ?,
      bio = ?,
      skills = ?
    WHERE id = 1
  `).run(
    "张三",
    "全栈开发工程师",
    "专注于 Web 开发与 AI 应用，喜欢构建实用的个人项目。",
    JSON.stringify(["TypeScript", "Next.js", "Python", "SQLite", "RAG"])
  );

  sqlite.prepare(`
    UPDATE site_settings SET site_title = ?, site_description = ? WHERE id = 1
  `).run("张三的个人作品集", "项目展示、技术博客与 AI 智能问答");

  const postCount = sqlite.prepare("SELECT COUNT(*) as c FROM post").get() as { c: number };
  if (postCount.c === 0) {
    const insertPost = sqlite.prepare(`
      INSERT INTO post (title, slug, body, excerpt, tags, published_at, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'published', ?, ?)
    `);
    insertPost.run(
      "用 RAG 搭建个人知识库问答",
      "rag-personal-kb",
      "本文介绍如何用 SQLite 存储向量、Ollama 本地推理，实现基于私有知识库的智能问答。核心流程：内容 CRUD 时同步 embedding，用户提问时检索 Top-K 片段拼入 prompt。",
      "从零搭建 RAG 问答系统的实践笔记",
      JSON.stringify(["RAG", "Ollama", "Next.js"]),
      now,
      now,
      now
    );
    insertPost.run(
      "Next.js 16 App Router 踩坑记录",
      "nextjs-app-router-notes",
      "记录 Server Component 直查 DB、SSE 流式 API、以及 SQLite 单进程部署的注意事项。",
      "App Router 开发与部署经验",
      JSON.stringify(["Next.js", "SQLite"]),
      now - 86400000,
      now,
      now
    );
  }

  const projectCount = sqlite.prepare("SELECT COUNT(*) as c FROM project").get() as { c: number };
  if (projectCount.c === 0) {
    const insertProject = sqlite.prepare(`
      INSERT INTO project (title, slug, description, body, tech_stack, featured, sort_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?)
    `);
    insertProject.run(
      "个人作品集网站",
      "portfolio-site",
      "带 CMS 与 AI 问答的个人站点",
      "Next.js + Drizzle + SQLite 构建，支持文章/项目管理，前台 ChatWidget 基于 RAG 回答访客问题。",
      JSON.stringify(["Next.js", "TypeScript", "Tailwind", "Ollama"]),
      0,
      now,
      now
    );
    insertProject.run(
      "智能问答实验",
      "qa-lab",
      "本地大模型 + 向量检索 Demo",
      "使用 Ollama 部署 qwen2.5，embedding 用 nomic-embed-text，演示特定领域私有知识库问答。",
      JSON.stringify(["Ollama", "RAG", "Python"]),
      1,
      now,
      now
    );
  }

  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.error("ADMIN_PASSWORD environment variable is required");
    process.exit(1);
  }
  const hashed = await hash(password, 10);
  console.log(
    `\nAdd this to your .env.local:\nADMIN_PASSWORD_HASH=${hashed}\n`
  );

  sqlite.close();
  console.log("Seed complete.");
}

seed();

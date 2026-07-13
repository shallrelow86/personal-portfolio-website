const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const { hashSync } = require("bcrypt");

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data.db");
const drizzleDir = path.join(process.cwd(), "drizzle");

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at INTEGER NOT NULL
  )
`);

function applied(name) {
  return !!db.prepare("SELECT 1 FROM _migrations WHERE name = ?").get(name);
}

function mark(name) {
  db.prepare("INSERT OR IGNORE INTO _migrations (name, applied_at) VALUES (?, ?)").run(name, Date.now());
}

function runSqlFile(file) {
  const name = path.basename(file, ".sql");
  if (applied(name)) return;
  const raw = fs.readFileSync(file, "utf8");
  const statements = raw
    .split(/--> statement-breakpoint/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const stmt of statements) {
    try {
      db.exec(stmt);
    } catch (e) {
      if (/already exists|duplicate column/i.test(String(e.message))) continue;
      throw e;
    }
  }
  mark(name);
  console.log(`[migrate] ${name}`);
}

function tableExists(name) {
  return !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(name);
}

function messageHasFk() {
  if (!tableExists("message")) return false;
  const fks = db.pragma("foreign_key_list(message)");
  return fks.some((fk) => fk.table === "conversation");
}

function applyMessageFk() {
  if (applied("0004_message_fk") || messageHasFk()) {
    mark("0004_message_fk");
    return;
  }
  if (!tableExists("message")) {
    mark("0004_message_fk");
    return;
  }
  db.exec("PRAGMA foreign_keys=OFF");
  db.exec(`
    CREATE TABLE message_new (
      id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      conversation_id integer NOT NULL REFERENCES conversation(id) ON DELETE CASCADE,
      role text NOT NULL,
      content text NOT NULL,
      created_at integer NOT NULL
    )
  `);
  db.exec("INSERT INTO message_new SELECT id, conversation_id, role, content, created_at FROM message");
  db.exec("DROP TABLE message");
  db.exec("ALTER TABLE message_new RENAME TO message");
  db.exec("CREATE INDEX IF NOT EXISTS message_conversation_id_idx ON message(conversation_id)");
  db.exec("PRAGMA foreign_keys=ON");
  mark("0004_message_fk");
  console.log("[migrate] 0004_message_fk");
}

function ensureIndexes() {
  db.exec(`
    CREATE INDEX IF NOT EXISTS embedding_source_type_idx ON embedding(source_type);
    CREATE UNIQUE INDEX IF NOT EXISTS embedding_source_unique_idx ON embedding(source_type, source_id);
  `);
}

function seed() {
  const now = Date.now();
  const profile = db.prepare("SELECT id FROM profile WHERE id = 1").get();
  if (!profile) {
    db.prepare(`
      INSERT INTO profile (id, name, title, bio, avatar, skills, social_links, resume_file)
      VALUES (1, ?, ?, ?, '', '[]', '[]', '')
    `).run(process.env.SITE_OWNER_NAME || "Your Name", process.env.SITE_OWNER_TITLE || "Developer", "");
    console.log("[seed] profile");
  }

  const settings = db.prepare("SELECT id FROM site_settings WHERE id = 1").get();
  if (!settings) {
    const nav = JSON.stringify([
      { label: "Blog", url: "/blog" },
      { label: "Projects", url: "/projects" },
      { label: "About", url: "/about" },
    ]);
    db.prepare(`
      INSERT INTO site_settings (id, site_title, site_description, og_image, primary_nav, footer_text)
      VALUES (1, ?, ?, '', ?, ?)
    `).run(
      process.env.SITE_TITLE || "Portfolio",
      process.env.SITE_DESCRIPTION || "Personal portfolio",
      nav,
      `© ${new Date().getFullYear()}`
    );
    console.log("[seed] site_settings");
  }

  if (!process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_PASSWORD) {
    const hash = hashSync(process.env.ADMIN_PASSWORD, 10);
    console.log(`[seed] ADMIN_PASSWORD_HASH=${hash}`);
    console.log("[seed] 请把上面的 hash 写入服务器 .env.local");
  }
}

const files = [
  "0000_loose_elektra.sql",
  "0001_sticky_ink.sql",
  "0002_superb_magneto.sql",
  "0003_conversations.sql",
  "0005_project_ai_context.sql",
].map((f) => path.join(drizzleDir, f));

for (const f of files) {
  if (fs.existsSync(f)) runSqlFile(f);
}
applyMessageFk();
ensureIndexes();
seed();
console.log("[setup] done");

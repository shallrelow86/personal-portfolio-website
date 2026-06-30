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

  sqlite.exec(`
    INSERT OR IGNORE INTO profile (id, name, title) VALUES (1, 'Your Name', 'Developer');
    INSERT OR IGNORE INTO site_settings (id, site_title, site_description)
    VALUES (1, 'My Portfolio', 'Personal portfolio website');
  `);

  const password = process.env.ADMIN_PASSWORD || "admin123";
  const hashed = await hash(password, 10);
  console.log(
    `\nAdd this to your .env.local:\nADMIN_PASSWORD_HASH=${hashed}\n`
  );

  sqlite.close();
  console.log("Seed complete.");
}

seed();

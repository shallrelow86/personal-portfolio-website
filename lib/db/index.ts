import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.exec(`
  CREATE INDEX IF NOT EXISTS embedding_source_type_idx ON embedding(source_type);
  CREATE UNIQUE INDEX IF NOT EXISTS embedding_source_unique_idx ON embedding(source_type, source_id);
`);

export const db = drizzle(sqlite, { schema });
export { schema };

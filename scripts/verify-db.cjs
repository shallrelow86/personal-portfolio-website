const Database = require("better-sqlite3");
const db = new Database(process.argv[2] || "test-fresh.db");
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((r) => r.name);
console.log("tables:", tables.join(", "));
for (const n of ["conversation", "message", "embedding", "post", "project", "profile"]) {
  const c = db.prepare(`SELECT COUNT(*) as c FROM ${n}`).get().c;
  console.log(`${n}: ${c}`);
}
db.close();

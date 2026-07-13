const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

const QUESTIONS = [
  "你有哪些项目？",
  "最近写了什么文章？",
  "你的技术栈是什么？",
];

async function testChat(base, question) {
  const sw = Date.now();
  const res = await fetch(`${base}/api/chat/public`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: question }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") continue;
      try {
        const json = JSON.parse(data);
        if (json.token) text += json.token;
        if (json.error) throw new Error(json.error);
      } catch (e) {
        if (e instanceof Error && e.message !== "Unexpected end of JSON input") throw e;
      }
    }
  }
  const ms = Date.now() - sw;
  return { question, ms, text: text.slice(0, 200) };
}

async function main() {
  loadEnv();
  const base = process.env.E2E_BASE_URL || "http://localhost:3000";
  console.log(`[e2e] base=${base}`);
  console.log(`[e2e] llm=${process.env.LLM_BASE_URL || "http://localhost:11434/v1"}`);
  const health = await fetch(`${base}/api/health`).then((r) => r.json()).catch(() => null);
  if (!health) {
    console.error("[e2e] server not reachable, run: npm run start");
    process.exit(1);
  }
  console.log("[e2e] health ok");
  let passed = 0;
  for (const q of QUESTIONS) {
    try {
      const r = await testChat(base, q);
      console.log(`[PASS] ${q} (${r.ms}ms)`);
      console.log(`       ${r.text.replace(/\n/g, " ")}...`);
      passed++;
    } catch (e) {
      console.error(`[FAIL] ${q}:`, e.message);
    }
  }
  console.log(`[e2e] ${passed}/${QUESTIONS.length} passed`);
  process.exit(passed === QUESTIONS.length ? 0 : 1);
}

main();

#!/usr/bin/env node
// Test DeepSeek + SiliconFlow APIs
// Usage:
//   node scripts/test-deepseek.js <DEEPSEEK_KEY> <SILICONFLOW_KEY>
//   or set env: DEEPSEEK_API_KEY + SILICONFLOW_API_KEY

const DS_KEY = process.argv[2] || process.env.DEEPSEEK_API_KEY;
const SF_KEY = process.argv[3] || process.env.SILICONFLOW_API_KEY;

if (!DS_KEY) {
  console.log("Usage: node scripts/test-deepseek.js <DEEPSEEK_KEY> [SILICONFLOW_KEY]");
  process.exit(1);
}

// 1. DeepSeek Chat
async function testDeepSeekChat() {
  console.log("1/3 DeepSeek Chat API (https://api.deepseek.com)...");
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${DS_KEY}` },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: "回复两个字：成功" }],
      max_tokens: 20,
    }),
  });
  const data = await res.json();
  if (data.error) { console.log("  FAIL:", data.error.message); return false; }
  console.log("  OK:", data.choices[0].message.content, `| tokens:${data.usage.total_tokens}`);
  return true;
}

// 2. SiliconFlow Embedding
async function testSiliconFlowEmbedding() {
  if (!SF_KEY) {
    console.log("2/3 SiliconFlow Embedding — SKIPPED (no API key provided)");
    console.log("  Register at https://siliconflow.cn to get a free key");
    return null;
  }
  console.log("2/3 SiliconFlow Embedding (https://api.siliconflow.cn)...");
  const res = await fetch("https://api.siliconflow.cn/v1/embeddings", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SF_KEY}` },
    body: JSON.stringify({
      model: "BAAI/bge-large-zh-v1.5",
      input: "你好，世界",
    }),
  });
  const data = await res.json();
  if (data.error) { console.log("  FAIL:", data.error.message); return false; }
  const emb = data.data[0].embedding;
  console.log(`  OK: ${emb.length}-dim | first 5: [${emb.slice(0, 5).map(n => n.toFixed(4)).join(", ")}]`);
  return true;
}

// 3. SiliconFlow Chat (free fallback)
async function testSiliconFlowChat() {
  if (!SF_KEY) return null;
  console.log("3/3 SiliconFlow Chat (DeepSeek-V3 free tier)...");
  const res = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${SF_KEY}` },
    body: JSON.stringify({
      model: "deepseek-ai/DeepSeek-V3",
      messages: [{ role: "user", content: "回复两个字：成功" }],
      max_tokens: 20,
    }),
  });
  const data = await res.json();
  if (data.error) { console.log("  FAIL:", data.error.message); return false; }
  console.log("  OK:", data.choices[0].message.content, `| tokens:${data.usage.total_tokens}`);
  return true;
}

async function main() {
  const ds = await testDeepSeekChat();
  const sfEmb = await testSiliconFlowEmbedding();
  const sfChat = await testSiliconFlowChat();

  console.log("\n=== Result ===");
  console.log("DeepSeek Chat:       ", ds ? "PASS" : "FAIL");
  console.log("SiliconFlow Embed:   ", sfEmb === null ? "SKIP" : sfEmb ? "PASS" : "FAIL");
  console.log("SiliconFlow Chat:    ", sfChat === null ? "SKIP" : sfChat ? "PASS" : "FAIL");

  if (ds && sfEmb) {
    console.log("\nAll good. AI assistant architecture ready:");
    console.log("  Chat:      DeepSeek API  (your key)");
    console.log("  Embedding: SiliconFlow   (free tier)");
  } else if (ds && !sfEmb) {
    console.log("\nChat works. Get SiliconFlow key at https://siliconflow.cn");
  }
}

main();

export function formatChatError(e: unknown): string {
  if (!(e instanceof Error)) return "对话失败，请稍后重试";
  const m = e.message;
  if (m.includes("Missing env")) {
    return "AI 服务未配置，请检查 .env.local 中的 LLM 配置或启动 Ollama";
  }
  if (/401|403|invalid.*key/i.test(m)) {
    return "API 密钥无效，请检查 LLM / Embedding 配置";
  }
  if (m.includes("LLM API error")) {
    return `大模型调用失败：${m.replace(/^LLM API error \d+:?\s*/, "").slice(0, 120)}`;
  }
  if (m.includes("Embedding API")) {
    return "向量检索暂不可用，已尝试无检索模式";
  }
  if (/ECONNREFUSED|fetch failed/i.test(m)) {
    return "无法连接本地 Ollama，请先运行 ollama serve";
  }
  return m.length <= 160 ? m : "对话失败，请稍后重试";
}

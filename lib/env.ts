function isLocalUrl(url: string): boolean {
  return /localhost|127\.0\.0\.1/.test(url);
}

export function getLlmConfig() {
  const baseUrl = (process.env.LLM_BASE_URL || "http://localhost:11434/v1").replace(/\/$/, "");
  return {
    baseUrl,
    model: process.env.LLM_MODEL || "qwen2.5:7b",
    apiKey: process.env.LLM_API_KEY || process.env.DEEPSEEK_API_KEY || "",
    local: isLocalUrl(baseUrl),
  };
}

export function getEmbedConfig() {
  const baseUrl = (
    process.env.EMBED_BASE_URL ||
    process.env.LLM_BASE_URL ||
    "http://localhost:11434/v1"
  ).replace(/\/$/, "");
  return {
    baseUrl,
    model: process.env.EMBED_MODEL || "nomic-embed-text",
    apiKey:
      process.env.EMBED_API_KEY ||
      process.env.SILICONFLOW_API_KEY ||
      process.env.LLM_API_KEY ||
      "",
    dim: Number(process.env.EMBEDDING_DIM || "768"),
    local: isLocalUrl(baseUrl),
  };
}

export function requireLlmEnv() {
  const cfg = getLlmConfig();
  if (!cfg.local && !cfg.apiKey) {
    throw new Error("Missing env: LLM_API_KEY or DEEPSEEK_API_KEY");
  }
}

export function requireChatEnv() {
  requireLlmEnv();
  const embed = getEmbedConfig();
  if (!embed.local && !embed.apiKey) {
    throw new Error("Missing env: EMBED_API_KEY or SILICONFLOW_API_KEY");
  }
}

export function requireDeepSeekEnv() {
  requireLlmEnv();
}

export function llmHeaders(apiKey: string): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) h.Authorization = `Bearer ${apiKey}`;
  return h;
}

export function isAiConfigured() {
  const llm = getLlmConfig();
  const embed = getEmbedConfig();
  return {
    llm: llm.local || Boolean(llm.apiKey),
    embed: embed.local || Boolean(embed.apiKey),
    llmLocal: llm.local,
    embedLocal: embed.local,
    llmModel: llm.model,
    embedModel: embed.model,
  };
}

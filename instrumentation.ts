export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { ensureAuthEnv } = await import("./lib/auth");
  ensureAuthEnv();
  const missing = ["DEEPSEEK_API_KEY", "SILICONFLOW_API_KEY"].filter((k) => !process.env[k]);
  if (missing.length) {
    console.warn(`[startup] AI chat disabled, missing: ${missing.join(", ")}`);
  }
  const cosMissing = ["COS_SECRET_ID", "COS_SECRET_KEY", "COS_BUCKET", "COS_REGION"].filter(
    (k) => !process.env[k]
  );
  if (cosMissing.length) {
    console.warn(`[startup] COS upload disabled, missing: ${cosMissing.join(", ")}`);
  }
}

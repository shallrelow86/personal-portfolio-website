import { readFile } from "node:fs/promises";

export async function getLastBackupTime(): Promise<Date | null> {
  const path = process.env.BACKUP_STATUS_FILE;
  if (!path) return null;
  try {
    const raw = await readFile(path, "utf8");
    const data = JSON.parse(raw);
    return data.at ? new Date(data.at) : null;
  } catch {
    return null;
  }
}

export async function getBackupStatus(): Promise<{ at: Date | null; stale: boolean }> {
  const at = await getLastBackupTime();
  if (!at) return { at: null, stale: true };
  return { at, stale: Date.now() - at.getTime() > 86_400_000 };
}

import { requireAdmin } from "@/lib/auth";
import { uploadToCos } from "@/lib/cos";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const { allowed } = checkRateLimit(`upload:${ip}`, 10, 60_000);
  if (!allowed) {
    return Response.json({ error: "Too many uploads. Try again later." }, { status: 429 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Only image files allowed" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "File too large (max 5MB)" }, { status: 413 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadToCos(buffer, safeName, file.type);
  return Response.json({ url });
}

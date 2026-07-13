import { requireAdmin } from "@/lib/auth";
import { uploadToCos } from "@/lib/cos";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_DOC = 20 * 1024 * 1024;
const IMAGE_TYPES = ["image/"];
const DOC_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const DOC_EXTS = [".pdf", ".doc", ".docx"];

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

  const kind = (formData.get("kind") as string) || "image";
  const isImage = IMAGE_TYPES.some((t) => file.type.startsWith(t));
  const lowerName = file.name.toLowerCase();
  const isDoc =
    DOC_TYPES.includes(file.type) || DOC_EXTS.some((ext) => lowerName.endsWith(ext));

  if (kind === "resume") {
    if (!isDoc) {
      return Response.json({ error: "Only PDF/DOC/DOCX files allowed for resume" }, { status: 400 });
    }
    if (file.size > MAX_DOC) {
      return Response.json({ error: "File too large (max 20MB)" }, { status: 413 });
    }
  } else {
    if (!isImage) {
      return Response.json({ error: "Only image files allowed" }, { status: 400 });
    }
    if (file.size > MAX_IMAGE) {
      return Response.json({ error: "File too large (max 5MB)" }, { status: 413 });
    }
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadToCos(buffer, safeName, file.type || "application/octet-stream");
  return Response.json({ url });
}

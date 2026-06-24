import { requireAdmin } from "@/lib/auth";
import { uploadToCos } from "@/lib/cos";

export async function POST(req: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return Response.json({ error: "No file" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await uploadToCos(buffer, file.name, file.type);
  return Response.json({ url });
}

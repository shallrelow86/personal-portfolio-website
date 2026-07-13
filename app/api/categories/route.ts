import { getCategoryTree } from "@/lib/categories";

export async function GET() {
  return Response.json(await getCategoryTree());
}

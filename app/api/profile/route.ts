import { fetchProfile } from "@/lib/profile";

export async function GET() {
  const profile = await fetchProfile();
  if (!profile) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(profile);
}

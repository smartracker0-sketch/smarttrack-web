import { proxyUser } from "@/lib/userBackend";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyUser(`/api/v1/dashcams/${encodeURIComponent(id)}/stream/stop${new URL(req.url).search}`, { method: "POST" });
}

import { proxyUser } from "@/lib/userBackend";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyUser(`/api/v1/dashcams/${encodeURIComponent(id)}/events${new URL(req.url).search}`);
}

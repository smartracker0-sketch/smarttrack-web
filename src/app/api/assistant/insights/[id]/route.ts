import { proxyUser } from "@/lib/userBackend";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyUser(`/api/v1/assistant/insights/${encodeURIComponent(id)}`, { method: "GET" });
}

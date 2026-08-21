import { proxyUser } from "@/lib/userBackend";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyUser(`/api/v1/telemetry/alerts/${encodeURIComponent(id)}/acknowledge`, { method: "PATCH" });
}

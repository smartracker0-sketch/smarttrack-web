import { proxyUser } from "@/lib/userBackend";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyUser(`/api/v1/consigners/${id}`, { method: "DELETE" });
}

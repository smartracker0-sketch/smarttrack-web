import { proxyAdmin } from "@/lib/adminBackend";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyAdmin(req, `/api/v1/admin/devices/${id}/check`, { method: "POST" }, 202);
}

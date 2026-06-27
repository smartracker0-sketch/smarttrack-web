import { proxyAdmin } from "@/lib/adminBackend";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qs = new URLSearchParams();
  if (searchParams.get("page")) qs.set("page", searchParams.get("page")!);
  if (searchParams.get("size")) qs.set("size", searchParams.get("size")!);
  return proxyAdmin(req, `/api/v1/admin/stats/alerts?${qs}`);
}

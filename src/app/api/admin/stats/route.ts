import { proxyAdmin } from "@/lib/adminBackend";

export async function GET(req: Request) {
  return proxyAdmin(req, "/api/v1/admin/stats");
}

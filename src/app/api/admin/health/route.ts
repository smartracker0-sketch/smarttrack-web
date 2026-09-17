import { proxyAdmin } from "@/lib/adminBackend";
export async function GET(request: Request) { return proxyAdmin(request, "/api/v1/admin/platform/health"); }

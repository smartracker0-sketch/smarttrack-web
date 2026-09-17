import { proxyAdmin } from "@/lib/adminBackend";
export async function GET(request: Request) { return proxyAdmin(request, "/api/v1/admin/platform/settings/sms-provider"); }
export async function PATCH(request: Request) { return proxyAdmin(request, "/api/v1/admin/platform/settings/sms-provider", { method: "PATCH", body: await request.text() }); }

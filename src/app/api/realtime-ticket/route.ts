import { proxyUser } from "@/lib/userBackend";
import { proxyAdmin } from "@/lib/adminBackend";
export async function POST(request: Request) {
  return new URL(request.url).searchParams.get("admin") === "true"
    ? proxyAdmin(request, "/api/v1/realtime/ticket", { method: "POST" })
    : proxyUser("/api/v1/realtime/ticket", { method: "POST" });
}

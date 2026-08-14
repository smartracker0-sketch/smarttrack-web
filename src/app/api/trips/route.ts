import { proxyUser } from "@/lib/userBackend";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  return proxyUser(status === "active" ? "/api/v1/trips/active" : "/api/v1/trips");
}

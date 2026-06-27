import { proxyUser } from "@/lib/userBackend";

export async function GET() {
  return proxyUser("/api/v1/trips");
}

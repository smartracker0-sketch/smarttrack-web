import { proxyUser } from "@/lib/userBackend";

export async function GET() {
  return proxyUser("/api/v1/drivers?size=100&sort=displayName,asc");
}

import { proxyUser } from "@/lib/userBackend";

export async function GET(request: Request) {
  const query = new URL(request.url).search;
  return proxyUser(`/api/v1/assistant/insights${query}`, { method: "GET" });
}

import { proxyUser } from "@/lib/userBackend";

export async function POST(request: Request) {
  const body = await request.text();
  return proxyUser("/api/v1/assistant/chat", { method: "POST", body });
}

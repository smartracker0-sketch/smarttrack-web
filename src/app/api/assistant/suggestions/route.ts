import { userFetch } from "@/lib/userBackend";

export async function GET() {
  try {
    const upstream = await userFetch("/api/v1/assistant/suggestions", { method: "GET" });
    if (!upstream.ok) return Response.json({ suggestions: [] }, { status: upstream.status });
    const suggestions = await upstream.json();
    return Response.json({ suggestions }, { headers: { "cache-control": "private, max-age=300" } });
  } catch {
    return Response.json({ suggestions: [] }, { status: 503 });
  }
}

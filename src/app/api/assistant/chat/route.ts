import { userFetch } from "@/lib/userBackend";

export const maxDuration = 120;

export async function POST(request: Request) {
  const body = await request.text();
  try {
    const upstream = await userFetch("/api/v1/assistant/chat", { method: "POST", body });
    if (!upstream.ok) {
      const error = await upstream.json().catch(() => ({ message: "Fleet AI is temporarily unavailable." }));
      return Response.json(error, { status: upstream.status });
    }
    return new Response(upstream.body, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHENTICATED" ? 401 : 503;
    return Response.json({ message: status === 401 ? "Your session has expired. Please sign in again." : "Fleet AI backend is unavailable." }, { status });
  }
}

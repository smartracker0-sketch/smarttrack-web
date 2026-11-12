import { userFetch } from "@/lib/userBackend";

export async function POST(request: Request, context: { params: Promise<{ id: string; operation: string }> }) {
  const { id, operation } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id) || !["confirm", "cancel"].includes(operation)) {
    return Response.json({ message: "Invalid Fleet AI action." }, { status: 400 });
  }
  try {
    const upstream = await userFetch(`/api/v1/assistant/actions/${id}/${operation}`, { method: "POST", body: await request.text() || "{}", signal: request.signal });
    const data = await upstream.json().catch(() => ({ message: "Fleet AI action failed." }));
    return Response.json(data, { status: upstream.status });
  } catch (error) {
    const status = error instanceof Error && error.message === "UNAUTHENTICATED" ? 401 : 503;
    return Response.json({ message: status === 401 ? "Your session has expired." : "Fleet AI action service is unavailable." }, { status });
  }
}

import { proxyUser } from "@/lib/userBackend";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyUser(`/api/v1/expenses/${id}`, { method: "DELETE" });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ message: "Invalid record ID" }, { status: 400 });
  return proxyUser(`/api/v1/expenses/${id}`, { method: "PUT", body: await request.text() });
}

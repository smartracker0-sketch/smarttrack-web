import { proxyUser } from "@/lib/userBackend";

type Context = { params: Promise<{ type: string; id: string }> };

export async function PUT(request: Request, context: Context) {
  const { type, id } = await context.params;
  return proxyUser(`/api/v1/fleet-records/${encodeURIComponent(type)}/${encodeURIComponent(id)}`, { method: "PUT", body: await request.text() });
}

export async function DELETE(_request: Request, context: Context) {
  const { type, id } = await context.params;
  return proxyUser(`/api/v1/fleet-records/${encodeURIComponent(type)}/${encodeURIComponent(id)}`, { method: "DELETE" }, 204);
}

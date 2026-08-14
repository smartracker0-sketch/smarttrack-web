import { NextResponse } from "next/server";
import { proxyUser } from "@/lib/userBackend";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid route" }, { status: 400 });
  return proxyUser(`/api/v1/routes/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyUser(`/api/v1/routes/${encodeURIComponent(id)}`, { method: "DELETE" }, 204);
}

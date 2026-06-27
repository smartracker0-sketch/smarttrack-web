import { NextResponse } from "next/server";
import { proxyUser } from "@/lib/userBackend";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  return proxyUser(`/api/v1/elock/${id}/status`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyUser(`/api/v1/elock/${id}`, { method: "DELETE" });
}

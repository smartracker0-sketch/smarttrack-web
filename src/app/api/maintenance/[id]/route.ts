import { NextResponse } from "next/server";
import { proxyUser } from "@/lib/userBackend";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  return proxyUser(`/api/v1/maintenance/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyUser(`/api/v1/maintenance/${id}`, { method: "DELETE" });
}

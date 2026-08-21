import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { proxyUser } from "@/lib/userBackend";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  return proxyUser(`/api/v1/devices/${encodeURIComponent(id)}`);
}

export async function PUT(req: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
  const { id } = await params;
  return proxyUser(`/api/v1/devices/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function DELETE(_: Request, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await params;
  return proxyUser(`/api/v1/devices/${encodeURIComponent(id)}`, { method: "DELETE" });
}

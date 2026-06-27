import { NextResponse } from "next/server";
import { proxyAdmin } from "@/lib/adminBackend";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyAdmin(req, `/api/v1/admin/devices/${id}`);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  const action = body.userId ? "assign-user" : body.organisationId ? "assign" : "unassign";
  return proxyAdmin(req, `/api/v1/admin/devices/${id}/${action}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyAdmin(req, `/api/v1/admin/devices/${id}`, { method: "DELETE" });
}

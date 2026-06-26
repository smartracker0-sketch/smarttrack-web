import { NextResponse } from "next/server";
import { proxyAdmin } from "@/lib/adminBackend";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyAdmin(req, `/api/v1/admin/organisations/${id}`);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  return proxyAdmin(req, `/api/v1/admin/organisations/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.status) return NextResponse.json({ message: "status is required" }, { status: 400 });
  return proxyAdmin(req, `/api/v1/admin/organisations/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: body.status }) });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyAdmin(req, `/api/v1/admin/organisations/${id}`, { method: "DELETE" });
}

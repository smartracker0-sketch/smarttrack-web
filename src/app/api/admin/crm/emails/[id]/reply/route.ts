import { NextResponse } from "next/server";
import { proxyAdmin } from "@/lib/adminBackend";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body?.message) return NextResponse.json({ message: "Message is required" }, { status: 400 });
  return proxyAdmin(req, `/api/v1/admin/crm/emails/${encodeURIComponent(id)}/reply`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

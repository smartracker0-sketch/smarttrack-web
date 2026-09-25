import { NextResponse } from "next/server";
import { proxyUser } from "@/lib/userBackend";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json().catch(() => null) as { action?: string } | null;
  if (body?.action !== "immobilise" && body?.action !== "mobilise") {
    return NextResponse.json({ message: "Action must be immobilise or mobilise" }, { status: 400 });
  }
  return proxyUser(`/api/v1/devices/${encodeURIComponent(id)}/${body.action}`, { method: "POST", body: "{}" });
}

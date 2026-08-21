import { NextResponse } from "next/server";
import { proxyUser } from "@/lib/userBackend";

type Params = { params: Promise<{ alertKey: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { alertKey } = await params;
  return proxyUser(`/api/v1/telemetry/alert-settings/${encodeURIComponent(alertKey)}`);
}

export async function PUT(req: Request, { params }: Params) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
  const { alertKey } = await params;
  return proxyUser(`/api/v1/telemetry/alert-settings/${encodeURIComponent(alertKey)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

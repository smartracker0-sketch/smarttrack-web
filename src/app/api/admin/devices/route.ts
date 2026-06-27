import { NextResponse } from "next/server";
import { proxyAdmin } from "@/lib/adminBackend";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qs = new URLSearchParams();
  if (searchParams.get("page")) qs.set("page", searchParams.get("page")!);
  if (searchParams.get("size")) qs.set("size", searchParams.get("size")!);

  return proxyAdmin(req, `/api/v1/admin/devices?${qs}`);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || !body.imeis) {
    return NextResponse.json({ message: "imeis array is required" }, { status: 400 });
  }

  const imeis: string[] = Array.isArray(body.imeis)
    ? body.imeis
    : String(body.imeis).split("\n").map((s: string) => s.trim()).filter(Boolean);

  const payload: Record<string, unknown> = { imeis };
  if (body.type)         payload.deviceType     = body.type;
  if (body.firmware)     payload.firmware       = body.firmware;
  if (body.simCard)      payload.simCard        = body.simCard;
  if (body.serialNo)     payload.serialNo       = body.serialNo;
  if (body.orgId)        payload.organisationId = body.orgId;
  if (body.userId)       payload.userId         = body.userId;
  if (body.vehicle)      payload.vehiclePlate   = body.vehicle;
  if (body.notes)        payload.notes          = body.notes;
  if (body.simNumber)    payload.simNumber      = body.simNumber;
  if (body.simApn)       payload.simApn         = body.simApn;
  if (body.manufacturer) payload.manufacturer   = body.manufacturer;

  return proxyAdmin(req, "/api/v1/admin/devices/bulk", {
    method: "POST",
    body: JSON.stringify(payload),
  }, 201);
}

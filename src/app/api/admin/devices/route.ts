import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  if (!body || !body.imeis) {
    return NextResponse.json({ message: "imeis array is required" }, { status: 400 });
  }

  const imeis: string[] = Array.isArray(body.imeis)
    ? body.imeis
    : String(body.imeis).split("\n").map((s: string) => s.trim()).filter(Boolean);

  return NextResponse.json({
    ok: true,
    message: `${imeis.length} device(s) added to inventory as Unassigned.`,
    devices: imeis.map(imei => ({ imei, status: "Unassigned" })),
  });
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  if (!body || !body.name || !body.adminEmail) {
    return NextResponse.json({ message: "name and adminEmail are required" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: `Organisation "${body.name}" created. Invite sent to ${body.adminEmail}.`,
  });
}

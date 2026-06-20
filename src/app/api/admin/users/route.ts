import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  if (!body || !body.email || !body.name || !body.role) {
    return NextResponse.json({ message: "email, name, and role are required" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: `User "${body.name}" (${body.role}) created.`,
  });
}

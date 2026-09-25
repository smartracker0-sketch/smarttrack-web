import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import { proxyUser } from "@/lib/userBackend";

export async function GET(req: Request) {
  const query = new URL(req.url).search;
  return proxyUser(`/api/v1/devices${query}`);
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
  return proxyUser("/api/v1/devices", { method: "POST", body: JSON.stringify(body) });
}

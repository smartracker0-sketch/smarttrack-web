import { NextResponse } from "next/server";
import { proxyUser } from "@/lib/userBackend";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get("deviceId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (!deviceId || !from || !to) return NextResponse.json({ message: "Device and date range are required" }, { status: 400 });
  const query = new URLSearchParams({ deviceId, from, to, limit: searchParams.get("limit") ?? "5000" });
  return proxyUser(`/api/v1/playback?${query}`);
}

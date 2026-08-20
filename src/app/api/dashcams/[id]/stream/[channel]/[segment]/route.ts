import { userFetch } from "@/lib/userBackend";
import { NextResponse } from "next/server";

export async function GET(_req: Request, context: { params: Promise<{ id: string; channel: string; segment: string }> }) {
  const { id, channel, segment } = await context.params;
  if (!/^\d+\.ts$/.test(segment)) return NextResponse.json({ message: "Invalid segment" }, { status: 400 });
  try {
    const upstream = await userFetch(`/api/v1/dashcams/${encodeURIComponent(id)}/stream/${encodeURIComponent(channel)}/${segment}`);
    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: { "content-type": "video/mp2t", "cache-control": "no-store" },
    });
  } catch {
    return NextResponse.json({ message: "Stream segment unavailable" }, { status: 503 });
  }
}

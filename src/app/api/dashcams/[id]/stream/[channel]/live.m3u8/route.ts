import { userFetch } from "@/lib/userBackend";
import { NextResponse } from "next/server";

export async function GET(_req: Request, context: { params: Promise<{ id: string; channel: string }> }) {
  const { id, channel } = await context.params;
  try {
    const upstream = await userFetch(`/api/v1/dashcams/${encodeURIComponent(id)}/stream/${encodeURIComponent(channel)}/live.m3u8`);
    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") ?? "application/vnd.apple.mpegurl", "cache-control": "no-store" },
    });
  } catch {
    return NextResponse.json({ message: "Live stream unavailable" }, { status: 503 });
  }
}

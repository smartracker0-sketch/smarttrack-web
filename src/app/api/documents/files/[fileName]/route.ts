import { NextResponse } from "next/server";
import { userFetch } from "@/lib/userBackend";

export async function GET(_request: Request, context: { params: Promise<{ fileName: string }> }) {
  try {
    const { fileName } = await context.params;
    const upstream = await userFetch(`/api/v1/document-files/${encodeURIComponent(fileName)}`);
    if (!upstream.ok) return NextResponse.json({ message: "File not found" }, { status: upstream.status });
    return new NextResponse(upstream.body, { status: 200, headers: { "content-type": upstream.headers.get("content-type") ?? "application/octet-stream", "content-disposition": upstream.headers.get("content-disposition") ?? "inline" } });
  } catch { return NextResponse.json({ message: "File unavailable" }, { status: 503 }); }
}

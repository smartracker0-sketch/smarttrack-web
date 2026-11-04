import { NextResponse } from "next/server";
import { userFetch } from "@/lib/userBackend";

async function proxy(req: Request, context: { params: Promise<{ id: string; path: string[] }> }) {
  const { id, path } = await context.params;
  const allowed = path.length === 3 && path[0] === "files" && /^[0-9a-f-]{36}$/i.test(path[1]) && path[2] === "telemetry" || path.length === 1 && ["capabilities", "commands"].includes(path[0])
    || path.length === 2 && (path[0] === "files" && /^[0-9a-f-]{36}$/i.test(path[1]) || ["audio", "data"].includes(path[0]) && /^([1-9]|[12][0-9]|3[0-7])$/.test(path[1]));
  if (!allowed || (req.method === "POST" && path[0] !== "commands" && path[0] !== "audio")) return NextResponse.json({ message: "Unknown camera operation" }, { status: 404 });
  const type = path[0] === "audio" ? "application/octet-stream" : "application/json";
  let body: ArrayBuffer | undefined;
  if (req.method === "POST") {
    const maximum = path[0] === "audio" ? 16000 : 16384;
    if (Number(req.headers.get("content-length") || 0) > maximum) return NextResponse.json({ message: "Camera request too large" }, { status: 413 });
    const reader = req.body?.getReader(), chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > maximum) { await reader.cancel(); return NextResponse.json({ message: "Camera request too large" }, { status: 413 }); } chunks.push(value); }
    const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; } body = bytes.buffer;
  }
  try {
    const response = await userFetch(`/api/v1/dashcams/${encodeURIComponent(id)}/mettax/${path.map(encodeURIComponent).join("/")}${new URL(req.url).search}`, {
      method: req.method, headers: { "content-type": type }, body,
    });
    const headers = new Headers({ "cache-control": "no-store", "X-Content-Type-Options": "nosniff" });
    for (const key of ["content-type", "content-disposition", "content-length"]) { const value = response.headers.get(key); if (value) headers.set(key, value); }
    return new NextResponse(response.body, { status: response.status, headers });
  } catch (cause) {
    const unauthorized = cause instanceof Error && cause.message === "UNAUTHENTICATED";
    return NextResponse.json({ message: unauthorized ? "Sign in to use camera tools" : "Camera service unavailable" }, { status: unauthorized ? 401 : 503 });
  }
}
export const GET = proxy;
export const POST = proxy;

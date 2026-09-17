import { NextResponse } from "next/server";
import { proxyUser } from "@/lib/userBackend";

export async function GET(_request: Request, context: { params: Promise<{ type: string }> }) {
  const { type } = await context.params;
  return proxyUser(`/api/v1/fleet-records/${encodeURIComponent(type)}`);
}

export async function POST(request: Request, context: { params: Promise<{ type: string }> }) {
  const { type } = await context.params;
  const body = await request.text();
  if (!body) return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  return proxyUser(`/api/v1/fleet-records/${encodeURIComponent(type)}`, { method: "POST", body }, 201);
}

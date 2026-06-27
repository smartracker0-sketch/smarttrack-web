import { NextResponse } from "next/server";
import { proxyUser } from "@/lib/userBackend";

export async function GET() {
  return proxyUser("/api/v1/tyres?size=100");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  return proxyUser("/api/v1/tyres", { method: "POST", body: JSON.stringify(body) }, 201);
}

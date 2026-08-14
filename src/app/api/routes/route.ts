import { NextResponse } from "next/server";
import { proxyUser } from "@/lib/userBackend";

export async function GET() {
  return proxyUser("/api/v1/routes");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid route" }, { status: 400 });
  return proxyUser("/api/v1/routes", { method: "POST", body: JSON.stringify(body) }, 201);
}

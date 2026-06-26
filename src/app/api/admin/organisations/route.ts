import { NextResponse } from "next/server";
import { proxyAdmin } from "@/lib/adminBackend";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qs = new URLSearchParams();
  if (searchParams.get("page")) qs.set("page", searchParams.get("page")!);
  if (searchParams.get("size")) qs.set("size", searchParams.get("size")!);

  return proxyAdmin(req, `/api/v1/admin/organisations?${qs}`);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || !body.name) {
    return NextResponse.json({ message: "name is required" }, { status: 400 });
  }

  return proxyAdmin(req, "/api/v1/admin/organisations", {
    method: "POST",
    body: JSON.stringify(body),
  }, 201);
}

import { NextResponse } from "next/server";
import { proxyAdmin } from "@/lib/adminBackend";

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const query = new URLSearchParams();
  query.set("page", params.get("page") ?? "0");
  query.set("size", params.get("size") ?? "50");
  if (params.get("query")) query.set("query", params.get("query")!);
  return proxyAdmin(req, `/api/v1/admin/crm/emails?${query}`);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.to || !body?.subject || !body?.message) {
    return NextResponse.json({ message: "Recipient, subject and message are required" }, { status: 400 });
  }
  return proxyAdmin(req, "/api/v1/admin/crm/emails", { method: "POST", body: JSON.stringify(body) }, 201);
}

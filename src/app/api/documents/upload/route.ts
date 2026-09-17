import { NextResponse } from "next/server";
import { userFetch } from "@/lib/userBackend";

export async function POST(request: Request) {
  try {
    const upstream = await userFetch("/api/v1/document-files", { method: "POST", body: await request.formData() });
    return NextResponse.json(await upstream.json().catch(() => null), { status: upstream.status });
  } catch { return NextResponse.json({ message: "Upload unavailable" }, { status: 503 }); }
}

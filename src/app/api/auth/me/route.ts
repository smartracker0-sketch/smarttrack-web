import { NextResponse } from "next/server";
import { userFetch } from "@/lib/userBackend";

export async function GET() {
  try {
    const upstream = await userFetch("/api/v1/users/me");
    const data = await upstream.json().catch(() => null);
    return NextResponse.json(data ?? {}, { status: upstream.status });
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "UNAUTHENTICATED";
    return NextResponse.json({ message: unauthorized ? "Unauthorized" : "Backend unavailable" }, { status: unauthorized ? 401 : 503 });
  }
}

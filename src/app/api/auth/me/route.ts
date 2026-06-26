import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.TRACKPRO_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get("tp_access")?.value ?? null;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BASE_URL}/api/v1/users/me`, {
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
  }

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: upstream.status });
}

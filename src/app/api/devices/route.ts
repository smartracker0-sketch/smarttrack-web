import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

function baseUrl() {
  return process.env.TRACKPRO_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
}

export async function GET() {
  const access = (await cookies()).get("tp_access")?.value;
  if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl()}/api/v1/devices`, {
      method: "GET",
      headers: { authorization: `Bearer ${access}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
  }

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data, { status: upstream.status });
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const access = (await cookies()).get("tp_access")?.value;
  if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl()}/api/v1/devices`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${access}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
  }

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data, { status: upstream.status });
}


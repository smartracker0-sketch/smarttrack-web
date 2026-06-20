import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";

function baseUrl() {
  return process.env.TRACKPRO_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = (await cookies()).get("tp_access")?.value;
  if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl()}/api/v1/devices/${encodeURIComponent(id)}`, {
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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const access = (await cookies()).get("tp_access")?.value;
  if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const { id } = await params;
  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl()}/api/v1/devices/${encodeURIComponent(id)}`, {
      method: "PUT",
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

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const access = (await cookies()).get("tp_access")?.value;
  if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl()}/api/v1/devices/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { authorization: `Bearer ${access}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
  }

  return NextResponse.json({ ok: upstream.ok }, { status: upstream.status });
}


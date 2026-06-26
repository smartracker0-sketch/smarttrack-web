import { NextResponse } from "next/server";

const BASE_URL = process.env.TRACKPRO_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email: string = body?.email?.trim() ?? "";
  const password: string = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
  }

  const data = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(
      { message: data?.message ?? "Login failed" },
      { status: upstream.status || 401 },
    );
  }

  const accessToken: string | undefined = data?.accessToken;
  const refreshToken: string | undefined = data?.refreshToken;

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ message: "Invalid auth response from backend" }, { status: 502 });
  }

  const secure = process.env.NODE_ENV === "production";
  const resp = NextResponse.json({ ok: true });
  resp.cookies.set("tp_access", accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  resp.cookies.set("tp_refresh", refreshToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return resp;
}

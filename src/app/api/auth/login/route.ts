import { NextResponse } from "next/server";

type LoginRequest = {
  email?: string;
  password?: string;
};

type AuthResponse = {
  accessToken?: string;
  refreshToken?: string;
  message?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as LoginRequest | null;
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  const baseUrl = process.env.TRACKPRO_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
  const mockEnabled =
    (process.env.TRACKPRO_MOCK_AUTH ?? process.env.NEXT_PUBLIC_MOCK_AUTH ?? "").toLowerCase() === "true";

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    if (!mockEnabled) {
      return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
    }
    upstream = new Response(
      JSON.stringify({
        accessToken: `mock_access_${Date.now()}`,
        refreshToken: `mock_refresh_${Date.now()}`,
      } satisfies AuthResponse),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }

  const data = (await upstream.json().catch(() => null)) as AuthResponse | null;
  if (!upstream.ok) {
    if (mockEnabled) {
      const resp = NextResponse.json({ ok: true, mock: true });
      const secure = process.env.NODE_ENV === "production";
      resp.cookies.set("tp_access", `mock_access_${Date.now()}`, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      });
      resp.cookies.set("tp_refresh", `mock_refresh_${Date.now()}`, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return resp;
    }
    return NextResponse.json(
      { message: data?.message ?? "Login failed" },
      { status: upstream.status || 401 },
    );
  }

  const accessToken = data?.accessToken;
  const refreshToken = data?.refreshToken;

  if (!accessToken || !refreshToken) {
    if (mockEnabled) {
      const resp = NextResponse.json({ ok: true, mock: true });
      const secure = process.env.NODE_ENV === "production";
      resp.cookies.set("tp_access", `mock_access_${Date.now()}`, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      });
      resp.cookies.set("tp_refresh", `mock_refresh_${Date.now()}`, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return resp;
    }
    return NextResponse.json({ message: "Invalid auth response" }, { status: 502 });
  }

  const resp = NextResponse.json({ ok: true });
  const secure = process.env.NODE_ENV === "production";

  resp.cookies.set("tp_access", accessToken, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
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

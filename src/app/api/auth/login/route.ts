import { NextResponse } from "next/server";
import {
  LEGACY_ACCESS_COOKIE,
  LEGACY_REFRESH_COOKIE,
  USER_ACCESS_COOKIE,
  USER_REFRESH_COOKIE,
  sessionCookieOptions,
} from "@/lib/sessionCookies";
import { serverBackendUrl } from '@/lib/serverBackendUrl';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${serverBackendUrl()}/api/v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
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

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const resp = NextResponse.json({ ok: true });
  resp.cookies.set(USER_ACCESS_COOKIE, accessToken, sessionCookieOptions(host, 60 * 60 * 8));
  resp.cookies.set(USER_REFRESH_COOKIE, refreshToken, sessionCookieOptions(host, 60 * 60 * 24 * 7));
  resp.cookies.set(LEGACY_ACCESS_COOKIE, "", { path: "/", maxAge: 0 });
  resp.cookies.set(LEGACY_REFRESH_COOKIE, "", { path: "/", maxAge: 0 });
  return resp;
}

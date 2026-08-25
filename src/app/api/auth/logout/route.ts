import { NextResponse } from "next/server";
import {
  LEGACY_ACCESS_COOKIE,
  LEGACY_REFRESH_COOKIE,
  USER_ACCESS_COOKIE,
  USER_REFRESH_COOKIE,
  sessionCookieDomain,
} from "@/lib/sessionCookies";

export async function POST(req: Request) {
  const resp = NextResponse.json({ ok: true });
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const domain = sessionCookieDomain(host);
  for (const name of [USER_ACCESS_COOKIE, USER_REFRESH_COOKIE, LEGACY_ACCESS_COOKIE, LEGACY_REFRESH_COOKIE]) {
    resp.cookies.set(name, "", { path: "/", maxAge: 0 });
    if (domain) resp.cookies.set(name, "", { path: "/", domain, maxAge: 0 });
  }
  return resp;
}

import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { revokeWebRefreshToken } from '@/lib/revokeWebSession';
import {
  LEGACY_ACCESS_COOKIE,
  LEGACY_REFRESH_COOKIE,
  USER_ACCESS_COOKIE,
  USER_REFRESH_COOKIE,
  sessionCookieDomain,
} from "@/lib/sessionCookies";

export async function POST(req: Request) {
  const jar = await cookies();
  const revoked = await revokeWebRefreshToken(jar.get(USER_REFRESH_COOKIE)?.value);
  const resp = NextResponse.json(revoked ? {ok: true} : {message: 'Browser session cleared; server revocation could not be confirmed'}, {status: revoked ? 200 : 503});
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const domain = sessionCookieDomain(host);
  for (const name of [USER_ACCESS_COOKIE, USER_REFRESH_COOKIE, LEGACY_ACCESS_COOKIE, LEGACY_REFRESH_COOKIE]) {
    resp.cookies.set(name, "", { path: "/", maxAge: 0 });
    if (domain) resp.cookies.set(name, "", { path: "/", domain, maxAge: 0 });
  }
  return resp;
}

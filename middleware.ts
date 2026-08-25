import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { USER_ACCESS_COOKIE, USER_REFRESH_COOKIE } from "@/lib/sessionCookies";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/app")) {
    const access = request.cookies.get(USER_ACCESS_COOKIE)?.value;
    const refresh = request.cookies.get(USER_REFRESH_COOKIE)?.value;
    if (!access && !refresh) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminToken = request.cookies.get("stt_admin_token")?.value;
    if (!adminToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/admin/login") {
    const adminToken = request.cookies.get("stt_admin_token")?.value;
    if (adminToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/overview";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login", "/admin/:path*"],
  // /tracking is intentionally public — no auth required
};

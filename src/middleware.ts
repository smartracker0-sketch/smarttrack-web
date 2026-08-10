import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isApp =
    pathname.startsWith("/app") &&
    !pathname.startsWith("/api/");

  if (isApp) {
    const token = req.cookies.get("tp_access")?.value;
    if (!token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect all admin console pages (not login, not api routes)
  const isConsole =
    pathname.startsWith("/admin/") &&
    !pathname.startsWith("/admin/login") &&
    !pathname.startsWith("/api/");

  if (isConsole) {
    const token = req.cookies.get("stt_admin_token")?.value;
    if (!token) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};

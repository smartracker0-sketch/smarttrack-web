import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
  matcher: ["/admin/:path*"],
};

import { NextRequest, NextResponse } from 'next/server';
import { USER_ACCESS_COOKIE, USER_REFRESH_COOKIE } from '@/lib/sessionCookies';
import { allowedOrigins, browserSecurityHeaders, rejectCrossOriginWrite } from '@/lib/securityPolicy';

export function proxy(request: NextRequest) {
  const production = process.env.NODE_ENV === 'production';
  const origins = allowedOrigins(process.env.SMARTTRACKER_ALLOWED_ORIGINS, !production);
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  let apiOrigin: string | undefined;
  try { apiOrigin = new URL(process.env.TRACKPRO_API_BASE_URL || 'http://localhost:8080').origin; } catch { /* Invalid server URL is rejected by the server helper. */ }
  const security = browserSecurityHeaders(nonce, production, apiOrigin);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', security['Content-Security-Policy']);
  let response: NextResponse;
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/api/') && rejectCrossOriginWrite(request, origins)) {
    response = NextResponse.json({message: 'Same-origin request required'}, {status: 403});
  } else if ((pathname === '/app' || pathname.startsWith('/app/')) && !request.cookies.has(USER_ACCESS_COOKIE) && !request.cookies.has(USER_REFRESH_COOKIE)) {
    const target = request.nextUrl.clone();target.pathname = '/login';target.searchParams.set('next', pathname);
    response = NextResponse.redirect(target);
  } else if ((pathname === '/admin' || pathname.startsWith('/admin/')) && pathname !== '/admin/login' && !request.cookies.has('stt_admin_token')) {
    const target = request.nextUrl.clone();target.pathname = '/admin/login';target.search = '';
    response = NextResponse.redirect(target);
  } else response = NextResponse.next({request: {headers: requestHeaders}});
  for (const [name,value] of Object.entries(security)) response.headers.set(name,value);
  if (!pathname.startsWith('/api/')) response.headers.set('Cache-Control','private, no-store');
  return response;
}

export const config = {matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon|logo|fonts/|.*\\.(?:png|jpg|jpeg|webp|svg|ico|woff2)$).*)']};

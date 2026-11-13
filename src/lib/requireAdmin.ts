import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { serverBackendUrl } from './serverBackendUrl';

/**
 * Call at the top of any API route handler that requires Super Admin access.
 * Returns null if the request is authorised, or a 403 NextResponse to return immediately.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const jar = await cookies();
  const token = jar.get("stt_admin_token")?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Forbidden: Super Admin access required." },
      { status: 403 }
    );
  }
  try {
    const response = await fetch(`${serverBackendUrl()}/api/v1/users/me`, {
      headers: {authorization: `Bearer ${token}`}, cache: 'no-store', signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return NextResponse.json({message: 'Admin session required'}, {status: response.status === 401 || response.status === 403 ? 403 : 503});
    const user = await response.json();
    return Array.isArray(user.roles) && user.roles.includes('SUPER_ADMIN') ? null : NextResponse.json({message: 'Super admin access required'}, {status: 403});
  } catch { return NextResponse.json({message: 'Admin session could not be verified'}, {status: 503}); }
}

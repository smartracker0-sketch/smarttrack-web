import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revokeWebRefreshToken } from '@/lib/revokeWebSession';
import { sessionCookieOptions } from '@/lib/sessionCookies';

export async function POST() {
  const jar = await cookies();
  const revoked = await revokeWebRefreshToken(jar.get('stt_admin_refresh')?.value);
  const response = NextResponse.json(revoked ? {ok: true} : {message: 'Browser session cleared; server revocation could not be confirmed'}, {status: revoked ? 200 : 503});
  for(const name of ['stt_admin_token','stt_admin_refresh']) response.cookies.set(name,'',sessionCookieOptions(null,0));
  return response;
}


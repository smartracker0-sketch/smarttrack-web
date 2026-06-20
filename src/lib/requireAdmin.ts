import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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
  return null;
}

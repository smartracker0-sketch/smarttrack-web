import { NextResponse } from "next/server";
import { backendUrl } from "@/lib/adminBackend";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email: string = body?.email ?? "";
  const password: string = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${backendUrl()}/api/v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
  }

  const data = await upstream.json().catch(() => null);
  if (!upstream.ok) {
    return NextResponse.json(
      { message: data?.message ?? "Invalid credentials" },
      { status: upstream.status === 401 ? 401 : upstream.status }
    );
  }

  const accessToken: string | undefined = data?.accessToken;
  if (!accessToken) {
    return NextResponse.json({ message: "Invalid auth response from backend" }, { status: 502 });
  }

  const roles: string[] = data?.roles ?? [];
  console.log("[admin/login] user roles:", roles);
  if (!roles.includes("SUPER_ADMIN")) {
    return NextResponse.json({ message: "Access denied: Super Admin role required" }, { status: 403 });
  }

  const resp = NextResponse.json({ ok: true, email });
  resp.cookies.set("stt_admin_token", accessToken, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return resp;
}

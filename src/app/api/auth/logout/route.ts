import { NextResponse } from "next/server";

export async function POST() {
  const resp = NextResponse.json({ ok: true });
  resp.cookies.set("tp_access", "", { path: "/", maxAge: 0 });
  resp.cookies.set("tp_refresh", "", { path: "/", maxAge: 0 });
  return resp;
}


import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const MOCK_ADMINS = [
  { email: "admin@smarttracker.cloud", password: "admin123!", name: "Platform Admin", role: "SUPER_ADMIN" },
  { email: "emeka@smarttracker.cloud", password: "admin123!", name: "Emeka Okonkwo", role: "SUPER_ADMIN" },
];

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const admin = MOCK_ADMINS.find(
    (a) => a.email === email && a.password === password
  );

  if (!admin) {
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = Buffer.from(`${admin.email}:${admin.role}:${Date.now()}`).toString("base64");

  const jar = await cookies();
  jar.set("stt_admin_token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 8,
    sameSite: "lax",
  });

  return NextResponse.json({
    ok: true,
    name: admin.name,
    email: admin.email,
    token,
  });
}

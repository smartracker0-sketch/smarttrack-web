import { NextResponse } from "next/server";
import { adminFetch } from "@/lib/adminBackend";
export async function GET(request: Request) {
  try {
    const response = await adminFetch(request, "/api/v1/users/me");
    if (!response.ok)
      return NextResponse.json(
        { message: "Admin session could not be verified" },
        { status: response.status },
      );
    const account = await response.json();
    if (!Array.isArray(account.roles) || !account.roles.includes("SUPER_ADMIN"))
      return NextResponse.json(
        { message: "Super admin access required" },
        { status: 403 },
      );
    return NextResponse.json(account);
  } catch (cause) {
    if (cause instanceof Error && cause.message === "UNAUTHENTICATED")
      return NextResponse.json(
        { message: "Admin sign-in required" },
        { status: 401 },
      );
    return NextResponse.json(
      { message: "Admin session is unavailable" },
      { status: 503 },
    );
  }
}

import { NextResponse } from "next/server";
import { proxyAdmin } from "@/lib/adminBackend";
export async function GET(request: Request) {
  return proxyAdmin(
    request,
    "/api/v1/admin/platform/settings/support-contacts",
  );
}
export async function PATCH(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body))
    return NextResponse.json(
      { message: "A support contacts object is required" },
      { status: 400 },
    );
  const allowed = ["email", "phone", "whatsapp", "hours", "helpUrl"];
  if (allowed.some((key) => typeof body[key] !== "string"))
    return NextResponse.json(
      {
        message:
          "All five contact fields are required as text; use an empty value to hide a channel",
      },
      { status: 400 },
    );
  return proxyAdmin(
    request,
    "/api/v1/admin/platform/settings/support-contacts",
    {
      method: "PUT",
      body: JSON.stringify(
        Object.fromEntries(
          allowed
            .filter((key) => body[key] !== undefined)
            .map((key) => [key, body[key]]),
        ),
      ),
    },
  );
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function baseUrl() {
  return (
    process.env.TRACKPRO_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8080"
  );
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const access = (await cookies()).get("tp_access")?.value;
  if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  let upstream: Response;
  try {
    upstream = await fetch(
      `${baseUrl()}/api/v1/telemetry/alerts/${id}/acknowledge`,
      {
        method: "PATCH",
        headers: { authorization: `Bearer ${access}` },
        cache: "no-store",
      }
    );
  } catch {
    return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
  }

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data, { status: upstream.status });
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function baseUrl() {
  return (
    process.env.TRACKPRO_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8080"
  );
}

async function getAccess() {
  return (await cookies()).get("tp_access")?.value ?? null;
}

/** GET /api/telemetry?deviceId=<uuid>&type=latest|history&from=&to= */
export async function GET(req: Request) {
  const access = await getAccess();
  if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "latest";

  let backendPath = `/api/v1/telemetry/latest`;
  if (type === "history") backendPath = `/api/v1/telemetry/history`;
  if (type === "fuel-latest") backendPath = `/api/v1/telemetry/fuel/latest`;
  if (type === "fuel-history") backendPath = `/api/v1/telemetry/fuel/history`;
  if (type === "alerts") backendPath = `/api/v1/telemetry/alerts`;

  const qs = new URLSearchParams();
  if (searchParams.get("deviceId")) qs.set("deviceId", searchParams.get("deviceId")!);
  if (searchParams.get("from")) qs.set("from", searchParams.get("from")!);
  if (searchParams.get("to")) qs.set("to", searchParams.get("to")!);
  if (searchParams.get("unacknowledgedOnly"))
    qs.set("unacknowledgedOnly", searchParams.get("unacknowledgedOnly")!);

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl()}${backendPath}?${qs}`, {
      headers: { authorization: `Bearer ${access}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
  }

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data, { status: upstream.status });
}

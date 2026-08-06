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

const TAB_PATHS: Record<string, string> = {
  objects: "/api/v1/live-tracking/objects",
  notifications: "/api/v1/live-tracking/notifications",
  history: "/api/v1/live-tracking/history",
  geofence: "/api/v1/live-tracking/geofences",
  landmark: "/api/v1/live-tracking/landmarks",
};

export async function GET(req: Request) {
  const access = await getAccess();
  if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const tab = (searchParams.get("tab") ?? "objects").toLowerCase();
  const backendPath = TAB_PATHS[tab] ?? TAB_PATHS.objects;

  const qs = new URLSearchParams();
  if (searchParams.get("deviceId")) qs.set("deviceId", searchParams.get("deviceId")!);
  if (searchParams.get("limit")) qs.set("limit", searchParams.get("limit")!);

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl()}${backendPath}?${qs}`, {
      headers: { authorization: `Bearer ${access}` },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
  }

  if (upstream.status === 204) return new NextResponse(null, { status: 204 });
  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data, { status: upstream.status });
}

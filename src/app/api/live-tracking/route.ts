import { proxyUser } from "@/lib/userBackend";

const TAB_PATHS: Record<string, string> = {
  objects: "/api/v1/live-tracking/objects",
  notifications: "/api/v1/live-tracking/notifications",
  history: "/api/v1/live-tracking/history",
  geofence: "/api/v1/live-tracking/geofences",
  landmark: "/api/v1/live-tracking/landmarks",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const backendPath = TAB_PATHS[(searchParams.get("tab") ?? "objects").toLowerCase()] ?? TAB_PATHS.objects;
  const query = new URLSearchParams();
  for (const key of ["deviceId", "limit"]) {
    const value = searchParams.get(key);
    if (value) query.set(key, value);
  }
  return proxyUser(`${backendPath}?${query}`);
}

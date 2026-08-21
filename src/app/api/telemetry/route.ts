import { proxyUser } from "@/lib/userBackend";

/** GET /api/telemetry?deviceId=<uuid>&type=latest|history&from=&to= */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "latest";

  let backendPath = "/api/v1/telemetry/latest";
  if (type === "history") backendPath = "/api/v1/telemetry/history";
  if (type === "fuel-latest") backendPath = "/api/v1/telemetry/fuel/latest";
  if (type === "fuel-history") backendPath = "/api/v1/telemetry/fuel/history";
  if (type === "alerts") backendPath = "/api/v1/telemetry/alerts";

  const query = new URLSearchParams();
  for (const key of ["deviceId", "from", "to", "unacknowledgedOnly"]) {
    const value = searchParams.get(key);
    if (value) query.set(key, value);
  }
  return proxyUser(`${backendPath}?${query}`);
}

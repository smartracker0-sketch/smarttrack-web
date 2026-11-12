import { proxyUser, userFetch } from "@/lib/userBackend";
type Context = { params: Promise<{ path?: string[] }> };
async function forward(request: Request, context: Context) {
  const { path = [] } = await context.params;
  const url = new URL(request.url);
  if (path.length > 4 || path.some((part) => !/^[a-zA-Z0-9-]+$/.test(part)))
    return Response.json({ message: "Unknown schedule route" }, { status: 404 });
  const area = url.searchParams.get("area");
  if (area && !["maintenance", "reports"].includes(area))
    return Response.json({ message: "Unknown schedule workspace" }, { status: 404 });
  url.searchParams.delete("area");
  const target = `/api/v1/${area === "maintenance" ? "maintenance/" : ""}report-schedules${path.length ? `/${path.join("/")}` : ""}${url.searchParams.size ? `?${url.searchParams}` : ""}`;
  const init: RequestInit = { method: request.method, headers: request.headers.has("idempotency-key") ? { "idempotency-key": request.headers.get("idempotency-key")! } : {}, ...(["POST", "PUT"].includes(request.method) ? { body: await request.text() } : {}) };
  if (path.at(-1) !== "download") return proxyUser(target, init);
  try {
    const response = await userFetch(target, init);
    return new Response(response.body, { status: response.status, headers: { "content-type": response.headers.get("content-type") ?? "application/octet-stream", "content-disposition": response.headers.get("content-disposition") ?? "attachment", "cache-control": "private, no-store" } });
  } catch (cause) {
    return Response.json({ message: "The report could not be downloaded" }, { status: cause instanceof Error && cause.message === "UNAUTHENTICATED" ? 401 : 503 });
  }
}
export const GET = forward, POST = forward, PUT = forward, DELETE = forward;

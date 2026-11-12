import { proxyUser, userFetch } from "@/lib/userBackend";
type Context = { params: Promise<{ path?: string[] }> };
export async function GET(request: Request, context: Context) {
  const { path = [] } = await context.params;
  if (path.length > 1 || path.some((part) => part !== "export")) return Response.json({ message: "Unknown trip route" }, { status: 404 });
  const target = `/api/v1/trips/fleet${path.length ? "/export" : ""}${new URL(request.url).search}`;
  if (!path.length) return proxyUser(target);
  try {
    const response = await userFetch(target);
    return new Response(response.body, { status: response.status, headers: { "content-type": response.headers.get("content-type") ?? "application/octet-stream", "content-disposition": response.headers.get("content-disposition") ?? "attachment", "cache-control": "private, no-store" } });
  } catch (cause) {
    return Response.json({ message: "Trips could not be exported" }, { status: cause instanceof Error && cause.message === "UNAUTHENTICATED" ? 401 : 503 });
  }
}

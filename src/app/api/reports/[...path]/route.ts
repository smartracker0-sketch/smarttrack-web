import { proxyUser, userFetch } from "@/lib/userBackend";
type Context = { params: Promise<{ path: string[] }> };
export async function GET(request: Request, context: Context) {
  const { path } = await context.params;
  if (path.length > 2 || path.some((part) => !/^[a-z0-9-]+$/.test(part)))
    return Response.json({ message: "Report not found" }, { status: 404 });
  const backendPath = `/api/v1/reports/${path.join("/")}${new URL(request.url).search}`;
  if (path.at(-1) !== "export") return proxyUser(backendPath);
  try {
    const response = await userFetch(backendPath);
    return new Response(response.body, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/octet-stream",
        "content-disposition":
          response.headers.get("content-disposition") ?? "attachment",
        "cache-control": "no-store",
      },
    });
  } catch (cause) {
    return Response.json(
      { message: "The report could not be exported" },
      {
        status:
          cause instanceof Error && cause.message === "UNAUTHENTICATED"
            ? 401
            : 503,
      },
    );
  }
}

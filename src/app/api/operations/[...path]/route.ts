import { proxyUser } from "@/lib/userBackend";
type Context = { params: Promise<{ path: string[] }> };
async function forward(request: Request, context: Context) {
  const { path } = await context.params;
  if (path.length > 3 || path.some((part) => !/^[a-zA-Z0-9-]+$/.test(part)))
    return Response.json(
      { message: "Unknown operations route" },
      { status: 404 },
    );
  const hasBody = ["POST", "PUT"].includes(request.method);
  return proxyUser(
    `/api/v1/operations/${path.map(encodeURIComponent).join("/")}${new URL(request.url).search}`,
    {
      method: request.method,
      ...(hasBody ? { body: await request.text() } : {}),
    },
  );
}
export const GET = forward,
  POST = forward,
  PUT = forward,
  DELETE = forward;

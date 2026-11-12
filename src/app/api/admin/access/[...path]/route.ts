import { proxyAdmin } from "@/lib/adminBackend";
type Context = { params: Promise<{ path: string[] }> };
async function forward(request: Request, context: Context) {
  const { path } = await context.params;
  if (path.length > 3 || path.some((part) => !/^[a-zA-Z0-9-]+$/.test(part)))
    return Response.json({ message: "Unknown access route" }, { status: 404 });
  return proxyAdmin(
    request,
    `/api/v1/admin/access/${path.map(encodeURIComponent).join("/")}`,
    {
      method: request.method,
      ...(["POST", "PUT"].includes(request.method)
        ? { body: await request.text() }
        : {}),
    },
  );
}
export const GET = forward,
  POST = forward,
  PUT = forward;

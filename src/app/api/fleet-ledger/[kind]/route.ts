import { userFetch } from "@/lib/userBackend";
const kinds = ["vendors", "expenses", "documents", "consigners", "elock", "tyres", "drivers", "devices"];
export async function GET(_: Request, context: { params: Promise<{ kind: string }> }) {
  const { kind } = await context.params;
  if (!kinds.includes(kind)) return Response.json({ message: "Unknown fleet records" }, { status: 404 });
  try {
    const rows: unknown[] = [];
    let page = 0, totalPages = 1;
    do {
      const response = await userFetch(`/api/v1/${kind}?size=200&page=${page}&sort=id,asc`);
      if (!response.ok) return Response.json(await response.json().catch(() => ({ message: "Records could not be loaded" })), { status: response.status });
      const body = await response.json();
      if (!Array.isArray(body.content)) return Response.json({ message: "Records returned an incomplete response" }, { status: 502 });
      rows.push(...body.content);
      totalPages = body.totalPages || 1;
      page++;
    } while (page < totalPages);
    return Response.json(rows, { headers: { "cache-control": "private, no-store" } });
  } catch (cause) { return Response.json({ message: cause instanceof Error && cause.message === "UNAUTHENTICATED" ? "Unauthorized" : "Records could not be loaded" }, { status: cause instanceof Error && cause.message === "UNAUTHENTICATED" ? 401 : 503 }); }
}

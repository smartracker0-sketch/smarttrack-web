import { NextRequest, NextResponse } from "next/server";

export function backendUrl() {
  return (
    process.env.TRACKPRO_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8080"
  );
}

function getAdminJwtFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name.trim() === "stt_admin_token") {
      const val = rest.join("=");
      console.log("[adminBackend] stt_admin_token length:", val.length);
      return val;
    }
  }
  console.log("[adminBackend] stt_admin_token not found");
  return null;
}

export async function adminFetch(
  req: Request,
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const jwt = getAdminJwtFromRequest(req);
  if (!jwt) throw new Error("UNAUTHENTICATED");

  return fetch(`${backendUrl()}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${jwt}`,
      ...(init.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  });
}

export async function proxyAdmin(
  req: Request,
  path: string,
  init: RequestInit = {},
  successStatus = 200
): Promise<NextResponse> {
  let upstream: Response;
  try {
    upstream = await adminFetch(req, path, init);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
  }

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await upstream.json().catch(() => null);
  console.log("[adminBackend] upstream status:", upstream.status, "path:", path, "body:", JSON.stringify(data)?.slice(0, 200));
  return NextResponse.json(data, { status: upstream.ok ? successStatus : upstream.status });
}

export type { NextRequest };

import { NextRequest, NextResponse } from "next/server";
import { serverBackendUrl } from './serverBackendUrl';

export function backendUrl() {
  return serverBackendUrl();
}

function getAdminJwtFromRequest(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name.trim() === "stt_admin_token") {
      const val = rest.join("=");
      return val;
    }
  }
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
  return NextResponse.json(data, { status: upstream.ok ? successStatus : upstream.status });
}

export type { NextRequest };

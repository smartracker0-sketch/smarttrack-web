import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export function backendUrl() {
  return (
    process.env.TRACKPRO_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8080"
  );
}

async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get("tp_access")?.value ?? null;
}

export async function userFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();
  if (!token) throw new Error("UNAUTHENTICATED");

  return fetch(`${backendUrl()}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...(init.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  });
}

/**
 * Proxy a request to the user-scoped backend API.
 * Handles auth, 204, and backend unavailable errors uniformly.
 */
export async function proxyUser(
  path: string,
  init: RequestInit = {},
  successStatus = 200
): Promise<NextResponse> {
  let upstream: Response;
  try {
    upstream = await userFetch(path, init);
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "UNAUTHENTICATED") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ message: "Backend unavailable" }, { status: 503 });
  }

  if (upstream.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await upstream.json().catch(() => null);
  return NextResponse.json(data, { status: upstream.ok ? successStatus : upstream.status });
}

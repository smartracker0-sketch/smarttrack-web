import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import {
  USER_ACCESS_COOKIE,
  USER_REFRESH_COOKIE,
  sessionCookieOptions,
} from "@/lib/sessionCookies";

const refreshRequests = new Map<string, Promise<string | null>>();

export function backendUrl() {
  return (
    process.env.TRACKPRO_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8080"
  );
}

export async function userFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const cookieStore = await cookies();
  let token = cookieStore.get(USER_ACCESS_COOKIE)?.value ?? null;
  const refreshToken = cookieStore.get(USER_REFRESH_COOKIE)?.value ?? null;

  if (!token && refreshToken) token = await refreshAccessTokenOnce(refreshToken);
  if (!token) throw new Error("UNAUTHENTICATED");

  let response = await authenticatedFetch(path, token, init);
  if (response.status === 401 && refreshToken) {
    token = await refreshAccessTokenOnce(refreshToken);
    if (token) response = await authenticatedFetch(path, token, init);
  }
  return response;
}

async function refreshAccessTokenOnce(refreshToken: string): Promise<string | null> {
  const pending = refreshRequests.get(refreshToken);
  if (pending) return pending;

  const request = refreshAccessToken(refreshToken).finally(() => {
    refreshRequests.delete(refreshToken);
  });
  refreshRequests.set(refreshToken, request);
  return request;
}

async function authenticatedFetch(path: string, token: string, init: RequestInit) {
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

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const response = await fetch(`${backendUrl()}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  }).catch(() => null);
  if (!response?.ok) return null;

  const data = await response.json().catch(() => null);
  const accessToken = data?.accessToken as string | undefined;
  const nextRefreshToken = data?.refreshToken as string | undefined;
  if (!accessToken || !nextRefreshToken) return null;

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const cookieStore = await cookies();
  cookieStore.set(USER_ACCESS_COOKIE, accessToken, sessionCookieOptions(host, 60 * 60 * 8));
  cookieStore.set(USER_REFRESH_COOKIE, nextRefreshToken, sessionCookieOptions(host, 60 * 60 * 24 * 7));
  return accessToken;
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

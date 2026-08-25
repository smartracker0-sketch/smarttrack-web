export const USER_ACCESS_COOKIE = "tp_access_v2";
export const USER_REFRESH_COOKIE = "tp_refresh_v2";
export const LEGACY_ACCESS_COOKIE = "tp_access";
export const LEGACY_REFRESH_COOKIE = "tp_refresh";

export function sessionCookieDomain(hostHeader: string | null): string | undefined {
  const host = hostHeader?.split(",")[0]?.trim().split(":")[0]?.toLowerCase();
  return host === "smarttracker.cloud" || host?.endsWith(".smarttracker.cloud")
    ? ".smarttracker.cloud"
    : undefined;
}

export function sessionCookieOptions(hostHeader: string | null, maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
    domain: sessionCookieDomain(hostHeader),
  };
}

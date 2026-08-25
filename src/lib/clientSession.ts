"use client";

let redirectingForLogin = false;

export async function redirectIfUnauthorized(
  response: Response | null | undefined,
  options: { verifySession?: boolean } = {},
) {
  if (response?.status !== 401) return false;

  if (options.verifySession !== false) {
    const session = await fetch("/api/auth/me", {
      cache: "no-store",
      credentials: "same-origin",
    }).catch(() => null);
    if (session?.ok) return false;
    if (session && session.status !== 401) return false;
  }

  if (!redirectingForLogin) {
    redirectingForLogin = true;
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.replace(`/login?next=${encodeURIComponent(next)}&session=expired`);
  }

  return true;
}

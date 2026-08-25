"use client";

let redirectingForLogin = false;

export async function redirectIfUnauthorized(response: Response | null | undefined) {
  if (response?.status !== 401) return false;

  if (!redirectingForLogin) {
    redirectingForLogin = true;
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => null);
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.replace(`/login?next=${encodeURIComponent(next)}&session=expired`);
  }

  return true;
}

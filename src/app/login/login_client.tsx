"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FormState = {
  email: string;
  password: string;
};

export default function LoginClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    email: "admin@trackpro.local",
    password: "admin123!",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    setError("");
    setIsSubmitting(true);
    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      if (!resp.ok) {
        const data = (await resp.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Login failed");
        return;
      }

      router.replace(nextPath || "/app");
      router.refresh();
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col px-6 py-10">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
            <span className="text-sm font-extrabold tracking-tight">TP</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight">TrackPro</div>
            <div className="text-xs text-muted">Fleet Intelligence Platform</div>
          </div>
        </Link>

        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start">
          <div className="rounded-3xl border border-divider bg-surface p-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Sign in</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Access your fleet dashboard, devices, alerts, geofences, reports, and admin tools.
            </p>

            <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
              <label className="grid gap-2 text-sm font-semibold">
                Email
                <input
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  type="email"
                  autoComplete="email"
                  className="h-11 rounded-xl border border-divider bg-background px-4 text-sm outline-none focus:border-primary"
                  placeholder="you@company.com"
                  required
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold">
                Password
                <input
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  type="password"
                  autoComplete="current-password"
                  className="h-11 rounded-xl border border-divider bg-background px-4 text-sm outline-none focus:border-primary"
                  placeholder="••••••••"
                  required
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                  {error}
                </div>
              ) : null}

              <button
                disabled={isSubmitting}
                type="submit"
                className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </button>

              <div className="text-xs text-muted">
                By continuing, you agree to use TrackPro responsibly and protect your credentials.
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-divider bg-surface p-8">
            <div className="text-sm font-bold">What you’ll get</div>
            <ul className="mt-4 grid gap-3 text-sm text-muted">
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
                Live tracking, device status, and map overlays.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
                Alerts for speeding, geofence breaches, SOS, and more.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
                Reports, exports, and scheduled delivery.
              </li>
              <li className="flex gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
                Multi-tenant and white-label tooling (admin).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}


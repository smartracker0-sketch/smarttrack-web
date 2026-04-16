"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-divider/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/app" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <span className="text-sm font-extrabold tracking-tight">TP</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight">TrackPro</div>
              <div className="text-xs text-muted">Web Console</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 text-sm text-muted lg:flex">
            <Link href="/app" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/app/devices" className="hover:text-foreground">
              Devices
            </Link>
            <Link href="/app/map" className="hover:text-foreground">
              Map
            </Link>
            <Link href="/app/alerts" className="hover:text-foreground">
              Alerts
            </Link>
            <Link href="/app/geofences" className="hover:text-foreground">
              Geofences
            </Link>
            <Link href="/app/history" className="hover:text-foreground">
              History
            </Link>
            <Link href="/app/reports" className="hover:text-foreground">
              Reports
            </Link>
            <Link href="/app/eco-driving" className="hover:text-foreground">
              Eco-driving
            </Link>
            <Link href="/app/whitelabel" className="hover:text-foreground">
              Whitelabel
            </Link>
            <Link href="/app/settings" className="hover:text-foreground">
              Settings
            </Link>
          </nav>

          <button
            type="button"
            onClick={logout}
            className="inline-flex rounded-full border border-divider bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-background"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

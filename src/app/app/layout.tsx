"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen" style={{ background: '#E8F4F3', color: '#0A3835' }}>
      <header className="sticky top-0 z-40 border-b backdrop-blur" style={{ background: '#fff', borderColor: '#C5E0DE' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/app" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Smart Tracker Telematics"
              width={36}
              height={36}
              className="rounded-full flex-shrink-0"
            />
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Smart Tracker</div>
              <div className="text-xs" style={{ color: '#1A7A75' }}>Telematics</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 text-sm lg:flex" style={{ color: '#1A7A75' }}>
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
            className="inline-flex rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110"
            style={{ background: '#0D4A47' }}
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}

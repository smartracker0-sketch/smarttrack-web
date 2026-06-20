"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  FiMenu, FiX, FiLogOut, FiUser,
  FiPieChart, FiTruck, FiNavigation, FiAlertTriangle,
  FiBarChart2, FiDollarSign, FiFileText, FiTool,
  FiUsers, FiMapPin, FiShoppingCart, FiDisc,
  FiCpu, FiHelpCircle, FiSettings, FiLock,
} from "react-icons/fi";

const SIDEBAR_ITEMS = [
  { href: "/app",                  icon: FiPieChart,      label: "Analytics" },
  { href: "/app/devices",          icon: FiTruck,         label: "Vehicles" },
  { href: "/app/history",          icon: FiNavigation,    label: "Trips" },
  { href: "/app/alerts",           icon: FiAlertTriangle, label: "Alerts" },
  { href: "/app/reports",          icon: FiBarChart2,     label: "Reports" },
  { href: "/app/expenses",         icon: FiDollarSign,    label: "My Expenses" },
  { href: "/app/documents",        icon: FiFileText,      label: "Documents" },
  { href: "/app/maintenance",      icon: FiTool,          label: "Maintenance" },
  { href: "/app/drivers",          icon: FiUsers,         label: "Drivers" },
  { href: "/app/geofences",        icon: FiMapPin,        label: "Geofence" },
  { href: "/app/vendors",          icon: FiShoppingCart,  label: "Vendors" },
  { href: "/app/tyre-management",  icon: FiDisc,          label: "Tyre Management" },
  { href: "/app/devices-mgmt",     icon: FiCpu,           label: "Devices" },
  { href: "/app/support",          icon: FiHelpCircle,    label: "Support" },
  { href: "/app/settings",         icon: FiSettings,      label: "Configurations" },
  { href: "/app/elock",            icon: FiLock,          label: "E-Lock Status" },
];

const DRAWER_GROUPS = [
  {
    label: "Overview",
    links: SIDEBAR_ITEMS.slice(0, 4),
  },
  {
    label: "Operations",
    links: SIDEBAR_ITEMS.slice(4, 9),
  },
  {
    label: "Fleet",
    links: SIDEBAR_ITEMS.slice(9, 13),
  },
  {
    label: "System",
    links: SIDEBAR_ITEMS.slice(13),
  },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f3f4f6', color: '#0A3835' }}>

      {/* ── Desktop Hover-Expand Sidebar ── */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0 py-3 z-30 overflow-hidden transition-all duration-200 group"
        style={{
          background: '#fff',
          borderRight: '1px solid #e5e7eb',
          width: 56,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.width = '220px'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.width = '56px'; }}
      >
        {/* Logo + brand name */}
        <Link href="/app" className="flex items-center gap-2.5 px-3 mb-4 flex-shrink-0 overflow-hidden">
          <Image
            src="/logo.png"
            alt="Smart Tracker"
            width={32}
            height={32}
            className="rounded-full flex-shrink-0"
          />
          <div className="leading-tight whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="text-xs font-extrabold" style={{ color: '#0D4A47' }}>Smart Tracker</div>
            <div className="text-[10px]" style={{ color: '#1A7A75' }}>Telematics</div>
          </div>
        </Link>

        {/* Nav items */}
        <div className="flex flex-col gap-0.5 flex-1 overflow-y-auto overflow-x-hidden px-2">
          {SIDEBAR_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative flex items-center gap-3 h-10 px-2 rounded-lg transition-colors whitespace-nowrap overflow-hidden"
                style={{
                  background: active ? '#E8F4F3' : 'transparent',
                  color: active ? '#0D4A47' : '#6b7280',
                  fontWeight: active ? 700 : 500,
                }}
              >
                {active && (
                  <span
                    className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                    style={{ background: '#0D4A47' }}
                  />
                )}
                <Icon size={17} className="flex-shrink-0" />
                <span
                  className="text-sm overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ color: active ? '#0D4A47' : '#374151' }}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 h-10 px-2 mx-2 rounded-lg transition-colors whitespace-nowrap overflow-hidden mt-1"
          style={{ color: '#9ca3af' }}
        >
          <FiLogOut size={17} className="flex-shrink-0" />
          <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            Log out
          </span>
        </button>
      </aside>

      {/* ── Main area (top bar + content) ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top bar */}
        <header
          className="flex-shrink-0 flex items-center justify-between px-4 py-2.5 z-20 border-b"
          style={{ background: '#fff', borderColor: '#e5e7eb', minHeight: 52 }}
        >
          {/* Left — title */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ background: '#E8F4F3', color: '#0D4A47' }}
              aria-label="Open menu"
            >
              <FiMenu size={18} />
            </button>
            <div>
              <div className="text-xs font-semibold" style={{ color: '#9ca3af' }}>
                Smart Tracker Telematics
              </div>
              <div className="text-sm font-extrabold leading-tight" style={{ color: '#0D4A47' }}>
                All Vehicles
              </div>
            </div>
          </div>

          {/* Right — actions */}
          <div className="flex items-center gap-2">
            <button className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-semibold" style={{ borderColor: '#e5e7eb', color: '#374151' }}>
              🔍 Search
            </button>
            <button className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-semibold" style={{ borderColor: '#e5e7eb', color: '#374151' }}>
              Geofences: All ▾
            </button>
            <Link
              href="/app/alerts"
              className="relative flex items-center justify-center w-8 h-8 rounded-lg border"
              style={{ borderColor: '#e5e7eb' }}
            >
              <FiAlertTriangle size={15} style={{ color: '#EF4444' }} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-bold" style={{ background: '#EF4444' }}>3</span>
            </Link>
            <Link href="/app/profile" className="flex items-center justify-center w-8 h-8 rounded-full" style={{ background: '#0D4A47', color: '#fff' }}>
              <FiUser size={14} />
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={closeDrawer}
          style={{ background: 'rgba(7,46,44,0.5)', backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <div
        className="fixed top-0 left-0 bottom-0 z-50 w-72 flex flex-col md:hidden transition-transform duration-300"
        style={{
          background: '#0D4A47',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Smart Tracker" width={32} height={32} className="rounded-full flex-shrink-0" />
            <div className="leading-tight">
              <div className="text-sm font-extrabold text-white">Smart Tracker</div>
              <div className="text-xs" style={{ color: '#B2D4D2' }}>Telematics</div>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="w-9 h-9 flex items-center justify-center rounded-xl"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}
            aria-label="Close menu"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {DRAWER_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-bold uppercase tracking-widest px-2 pb-1.5" style={{ color: '#B2D4D2' }}>
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.links.map(({ href, icon: Icon, label }) => {
                  const active = pathname === href;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={closeDrawer}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                      style={{
                        background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                        color: active ? '#fff' : 'rgba(255,255,255,0.75)',
                        fontWeight: active ? 700 : 500,
                      }}
                    >
                      {active && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#F97316' }} />}
                      <Icon size={15} />
                      {label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
          <button
            type="button"
            onClick={async () => { closeDrawer(); await logout(); }}
            className="w-full flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
            style={{ background: '#F97316', color: '#fff' }}
          >
            <FiLogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}

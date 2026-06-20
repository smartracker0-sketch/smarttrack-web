"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiGrid, FiUsers, FiTruck, FiCpu, FiAlertTriangle,
  FiDollarSign, FiSettings, FiHeadphones, FiLogOut,
  FiActivity, FiFileText, FiSliders, FiChevronDown,
  FiChevronRight, FiBell, FiSearch, FiExternalLink,
  FiUser, FiMenu, FiX,
} from "react-icons/fi";
import { useAdminAuthStore } from "@/admin/store/useAdminAuthStore";

const NAV = [
  { href: "/admin/overview",       icon: FiGrid,          label: "Overview" },
  { href: "/admin/organisations",  icon: FiUsers,         label: "Organisations" },
  { href: "/admin/vehicles",       icon: FiTruck,         label: "Vehicles" },
  { href: "/admin/users",          icon: FiUser,          label: "Users" },
  { href: "/admin/devices",        icon: FiCpu,           label: "Devices" },
  { href: "/admin/alerts",         icon: FiAlertTriangle, label: "Alerts" },
  { href: "/admin/billing",        icon: FiDollarSign,    label: "Billing" },
];

const SYSTEM_NAV = [
  { href: "/admin/system/health",    icon: FiActivity,  label: "System Health" },
  { href: "/admin/system/audit-log", icon: FiFileText,  label: "Audit Log" },
  { href: "/admin/system/settings",  icon: FiSliders,   label: "Platform Settings" },
];

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminName, adminEmail, logout } = useAdminAuthStore();
  const [systemOpen, setSystemOpen] = useState(
    pathname.startsWith("/admin/system")
  );

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    logout();
    router.replace("/admin/login");
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#071E1C", borderRight: "1px solid rgba(255,255,255,0.07)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div>
          <div className="text-white font-extrabold text-base tracking-tight">Smart Tracker</div>
          <div className="text-xs font-semibold tracking-widest uppercase mt-0.5" style={{ color: "#4A8A87" }}>Admin Console</div>
        </div>
        {mobile && (
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: "#4A8A87" }}>
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className="flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: active ? "rgba(249,115,22,0.1)" : "transparent",
                color: active ? "#F97316" : "rgba(255,255,255,0.6)",
                borderLeft: active ? "3px solid #F97316" : "3px solid transparent",
              }}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* System group */}
        <div className="pt-3">
          <button
            onClick={() => setSystemOpen(o => !o)}
            className="w-full flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            <FiSettings size={16} className="flex-shrink-0" />
            <span className="flex-1 text-left">System</span>
            {systemOpen ? <FiChevronDown size={13} /> : <FiChevronRight size={13} />}
          </button>
          {systemOpen && (
            <div className="ml-6 mt-0.5 space-y-0.5">
              {SYSTEM_NAV.map(({ href, icon: Icon, label }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={onClose}
                    className="flex items-center gap-3 h-9 px-3 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: active ? "rgba(249,115,22,0.1)" : "transparent",
                      color: active ? "#F97316" : "rgba(255,255,255,0.5)",
                      borderLeft: active ? "3px solid #F97316" : "3px solid transparent",
                    }}
                  >
                    <Icon size={14} />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <Link
          href="/admin/support"
          onClick={onClose}
          className="flex items-center gap-3 h-10 px-3 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: isActive("/admin/support") ? "rgba(249,115,22,0.1)" : "transparent",
            color: isActive("/admin/support") ? "#F97316" : "rgba(255,255,255,0.6)",
            borderLeft: isActive("/admin/support") ? "3px solid #F97316" : "3px solid transparent",
          }}
        >
          <FiHeadphones size={16} />
          Support Tickets
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 12 }}>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "#F97316" }}>
            {adminName ? adminName[0] : "A"}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">{adminName || "Admin"}</div>
            <div className="text-[10px] truncate" style={{ color: "#4A8A87" }}>{adminEmail}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 h-9 px-3 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <FiLogOut size={14} />
          Log out
        </button>
        <Link
          href="/"
          className="flex items-center gap-3 h-9 px-3 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <FiExternalLink size={14} />
          ← Exit to main site
        </Link>
      </div>
    </div>
  );
}

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const { adminName } = useAdminAuthStore();
  const env = process.env.NEXT_PUBLIC_ENV || "DEVELOPMENT";

  const PAGE_TITLES: Record<string, string> = {
    "/admin/overview": "Overview",
    "/admin/organisations": "Organisations",
    "/admin/vehicles": "Global Vehicles",
    "/admin/users": "Global Users",
    "/admin/devices": "Device Manager",
    "/admin/alerts": "Global Alerts",
    "/admin/billing": "Billing",
    "/admin/system/health": "System Health",
    "/admin/system/audit-log": "Audit Log",
    "/admin/system/settings": "Platform Settings",
    "/admin/support": "Support Tickets",
  };

  const title = PAGE_TITLES[pathname] ?? "Admin Console";

  return (
    <header
      className="flex items-center justify-between px-5 h-14 flex-shrink-0"
      style={{ background: "#0A2A28", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg" style={{ color: "#7BBBB8" }}>
          <FiMenu size={18} />
        </button>
        <div>
          <div className="text-sm font-extrabold text-white">{title}</div>
          <div className="text-xs" style={{ color: "#4A8A87" }}>Admin Console</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.05)", color: "#7BBBB8", border: "1px solid rgba(255,255,255,0.08)" }}>
          <FiSearch size={13} />
          <span>Search platform…</span>
        </div>

        <div className="relative">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color: "#7BBBB8" }}>
            <FiBell size={15} />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center font-bold" style={{ background: "#EF4444" }}>4</span>
        </div>

        <span
          className="hidden sm:inline-flex items-center h-6 px-2 rounded text-[10px] font-bold tracking-widest"
          style={{
            background: env === "PRODUCTION" ? "#EF44441a" : "#F59E0B1a",
            color: env === "PRODUCTION" ? "#EF4444" : "#F59E0B",
            border: `1px solid ${env === "PRODUCTION" ? "#EF444433" : "#F59E0B33"}`,
          }}
        >
          {env}
        </span>

        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "#F97316" }}>
          {adminName ? adminName[0] : "A"}
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { impersonating, stopImpersonation } = useAdminAuthStore();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0F2422" }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)} style={{ background: "rgba(0,0,0,0.6)" }} />
      )}

      {/* Mobile sidebar */}
      <div
        className="fixed top-0 left-0 bottom-0 z-50 w-64 lg:hidden transition-transform duration-300"
        style={{ transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}
      >
        <Sidebar mobile onClose={() => setMobileOpen(false)} />
      </div>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Impersonation banner */}
        {impersonating && (
          <div className="flex items-center justify-between px-5 py-2 text-sm font-semibold" style={{ background: "#F97316", color: "#fff" }}>
            <span>⚠️ Viewing as <strong>{impersonating.orgName}</strong> (Super Admin Mode)</span>
            <button
              onClick={() => { stopImpersonation(); router.replace("/admin/organisations"); }}
              className="underline text-xs font-bold"
            >
              Exit Impersonation
            </button>
          </div>
        )}

        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 overflow-auto p-5" style={{ background: "#0F2422" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

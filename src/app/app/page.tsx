"use client";

import { useState, useEffect, useMemo } from "react";
import { FiTruck, FiAlertTriangle, FiActivity, FiRefreshCw } from "react-icons/fi";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "#EF4444",
  WARNING: "#F59E0B",
  INFO: "#6366F1",
};

export default function AnalyticsPage() {
  const [devices, setDevices]   = useState<AnyRow[]>([]);
  const [alerts, setAlerts]     = useState<AnyRow[]>([]);
  const [loading, setLoading]   = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [dRes, aRes] = await Promise.allSettled([
        fetch("/api/devices"),
        fetch("/api/telemetry?type=alerts&unacknowledgedOnly=false"),
      ]);
      if (dRes.status === "fulfilled" && dRes.value.ok) {
        const data = await dRes.value.json();
        setDevices(Array.isArray(data) ? data : data?.content ?? []);
      }
      if (aRes.status === "fulfilled" && aRes.value.ok) {
        const data = await aRes.value.json();
        const list: AnyRow[] = Array.isArray(data) ? data : data?.content ?? [];
        setAlerts(list.slice(0, 10));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totalDevices    = devices.length;
  const activeAlerts   = useMemo(() => alerts.filter(a => !a.acknowledged), [alerts]);
  const criticalAlerts = useMemo(() => activeAlerts.filter(a => a.severity === "CRITICAL"), [activeAlerts]);

  const statCards = [
    { label: "Total Devices",  value: loading ? "…" : String(totalDevices),        sub: "Registered to your account",  icon: FiTruck,         color: "#0D4A47", bg: "#E8F4F3" },
    { label: "Active Alerts",  value: loading ? "…" : String(activeAlerts.length),  sub: `${criticalAlerts.length} critical`, icon: FiAlertTriangle,  color: "#EF4444", bg: "#FEF2F2" },
    { label: "All Alerts",     value: loading ? "…" : String(alerts.length),        sub: "Total loaded",                icon: FiActivity,      color: "#F59E0B", bg: "#FFFBEB" },
  ];

  return (
    <div className="p-6 grid gap-6" style={{ background: "#f3f4f6", minHeight: "100%" }}>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1A7A75" }}>Dashboard</p>
          <h1 className="mt-1 text-2xl font-extrabold" style={{ color: "#0D4A47" }}>Analytics Overview</h1>
          <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>Fleet performance at a glance — live data from backend.</p>
        </div>
        <button onClick={load} className="mt-1 w-9 h-9 rounded-xl border flex items-center justify-center hover:bg-white transition-colors" style={{ borderColor: "#e5e7eb", color: "#6b7280" }}>
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((c) => (
          <div key={c.label} className="rounded-2xl border p-4 flex flex-col gap-2" style={{ background: "#fff", borderColor: "#e5e7eb" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
              <c.icon size={17} style={{ color: c.color }} />
            </div>
            <div className="text-2xl font-extrabold leading-none" style={{ color: "#111827" }}>{c.value}</div>
            <div className="text-xs font-semibold" style={{ color: "#374151" }}>{c.label}</div>
            <div className="text-[11px]" style={{ color: "#9ca3af" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom row: devices + recent alerts */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Devices list */}
        <div className="rounded-2xl border p-5" style={{ background: "#fff", borderColor: "#e5e7eb" }}>
          <div className="text-sm font-extrabold mb-3" style={{ color: "#111827" }}>Your Devices</div>
          {loading ? (
            <div className="text-xs py-6 text-center" style={{ color: "#9ca3af" }}>Loading…</div>
          ) : devices.length === 0 ? (
            <div className="text-xs py-6 text-center" style={{ color: "#9ca3af" }}>No devices registered yet.</div>
          ) : (
            <div className="grid gap-2">
              {devices.slice(0, 8).map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                  <div>
                    <div className="text-xs font-bold" style={{ color: "#111827" }}>{d.name ?? d.imei}</div>
                    <div className="text-[11px] font-mono" style={{ color: "#9ca3af" }}>{d.imei}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: d.vehiclePlate ? "#E8F4F3" : "rgba(255,255,255,0.06)", color: d.vehiclePlate ? "#0D4A47" : "#9ca3af" }}>
                    {d.vehiclePlate ?? "Unassigned"}
                  </span>
                </div>
              ))}
              {devices.length > 8 && <div className="text-[11px] text-center" style={{ color: "#9ca3af" }}>+{devices.length - 8} more devices</div>}
            </div>
          )}
        </div>

        {/* Recent alerts */}
        <div className="rounded-2xl border p-5" style={{ background: "#fff", borderColor: "#e5e7eb" }}>
          <div className="text-sm font-extrabold mb-3" style={{ color: "#111827" }}>Recent Alerts</div>
          {loading ? (
            <div className="text-xs py-6 text-center" style={{ color: "#9ca3af" }}>Loading…</div>
          ) : alerts.length === 0 ? (
            <div className="text-xs py-6 text-center" style={{ color: "#9ca3af" }}>No alerts yet — all clear.</div>
          ) : (
            <div className="grid gap-2">
              {alerts.map((a, i) => (
                <div key={a.id ?? i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: SEVERITY_COLOR[a.severity] ?? "#9CA3AF" }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate" style={{ color: "#111827" }}>{a.alertType ?? a.type ?? "Alert"}</div>
                    <div className="text-[11px] truncate" style={{ color: "#6b7280" }}>{a.message ?? a.description ?? ""}</div>
                  </div>
                  <span className="text-[11px] flex-shrink-0 whitespace-nowrap" style={{ color: "#9ca3af" }}>
                    {a.alertTime ? new Date(a.alertTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

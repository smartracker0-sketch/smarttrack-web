"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { FiUsers, FiTruck, FiAlertTriangle, FiCpu, FiActivity, FiRefreshCw } from "react-icons/fi";

const TOOLTIP_STYLE = { background: "#071E1C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 };
const CARD_STYLE = { background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" };

function StatCard({ icon: Icon, label, value, sub, iconColor, loading }: {
  icon: React.ElementType; label: string; value: string; sub: string; iconColor: string; loading?: boolean;
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={CARD_STYLE}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#4A8A87" }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconColor + "1a" }}>
          <Icon size={15} style={{ color: iconColor }} />
        </div>
      </div>
      <div className="text-2xl font-extrabold text-white">
        {loading ? <span className="inline-block w-12 h-6 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.1)" }} /> : value}
      </div>
      <div className="text-xs" style={{ color: "#4A8A87" }}>{sub}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Active:    { bg: "#22C55E1a", color: "#22C55E" },
    Trial:     { bg: "#F59E0B1a", color: "#F59E0B" },
    Suspended: { bg: "#EF44441a", color: "#EF4444" },
    Churned:   { bg: "rgba(255,255,255,0.05)", color: "#9CA3AF" },
  };
  const s = map[status] ?? map.Churned;
  return <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: s.bg, color: s.color }}>{status}</span>;
}

function SeverityDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = { Low: "#22C55E", Medium: "#F59E0B", High: "#F97316", CRITICAL: "#EF4444", WARNING: "#F59E0B", INFO: "#22C55E" };
  return <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[severity] ?? "#9CA3AF" }} />;
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Low: { bg: "#22C55E1a", color: "#22C55E" }, Medium: { bg: "#F59E0B1a", color: "#F59E0B" },
    High: { bg: "#F9731614", color: "#F97316" }, Critical: { bg: "#EF44441a", color: "#EF4444" },
    CRITICAL: { bg: "#EF44441a", color: "#EF4444" }, WARNING: { bg: "#F59E0B1a", color: "#F59E0B" }, INFO: { bg: "#22C55E1a", color: "#22C55E" },
  };
  const s = map[severity] ?? { bg: "rgba(255,255,255,0.06)", color: "#9CA3AF" };
  return <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: s.bg, color: s.color }}>{severity}</span>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Stats = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrgRow = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AlertRow = Record<string, any>;

export default function AdminOverviewPage() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [orgs, setOrgs]     = useState<OrgRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  async function load() {
    setLoading(true);
    try {
      const [sRes, oRes, aRes] = await Promise.allSettled([
        fetch("/api/admin/stats"),
        fetch("/api/admin/organisations?size=100"),
        fetch("/api/admin/alerts?size=50"),
      ]);
      if (sRes.status === "fulfilled" && sRes.value.ok) setStats(await sRes.value.json());
      if (oRes.status === "fulfilled" && oRes.value.ok) {
        const d = await oRes.value.json();
        setOrgs(d?.content ?? d ?? []);
      }
      if (aRes.status === "fulfilled" && aRes.value.ok) {
        const d = await aRes.value.json();
        setAlerts(d?.content ?? d ?? []);
      }
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }

  useEffect(() => { load(); }, []);

  // Derive chart data from real orgs
  const vehiclesPerOrg = [...orgs]
    .filter(o => (o.deviceCount ?? 0) > 0)
    .sort((a, b) => (b.deviceCount ?? 0) - (a.deviceCount ?? 0))
    .slice(0, 8)
    .map(o => ({ name: o.name?.split(" ").slice(0, 2).join(" "), devices: o.deviceCount ?? 0 }));

  // Alert severity breakdown from real alerts
  const severityMap: Record<string, number> = {};
  alerts.forEach(a => { const k = a.severity ?? a.alertType ?? "INFO"; severityMap[k] = (severityMap[k] ?? 0) + 1; });
  const severityColors: Record<string, string> = { CRITICAL: "#EF4444", WARNING: "#F59E0B", INFO: "#22C55E", High: "#F97316", Medium: "#F59E0B", Low: "#22C55E", Critical: "#EF4444" };
  const alertSeverityData = Object.entries(severityMap).map(([name, value]) => ({ name, value, color: severityColors[name] ?? "#9CA3AF" }));

  const recentOrgs = [...orgs].sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-white">Platform Overview</h1>
          <p className="text-xs mt-0.5" style={{ color: "#4A8A87" }}>Last refreshed: {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 h-8 px-3 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors" style={{ color: "#7BBBB8" }}>
          <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={FiUsers}         label="Organisations"   value={String(stats?.totalOrgs ?? "—")}    sub={`${stats?.activeOrgs ?? "—"} active`}              iconColor="#22C55E"  loading={loading} />
        <StatCard icon={FiCpu}           label="Devices"         value={String(stats?.totalDevices ?? "—")} sub={`${stats?.onlineDevices ?? "—"} online`}           iconColor="#1A7A75"  loading={loading} />
        <StatCard icon={FiUsers}         label="Users"           value={String(stats?.totalUsers ?? "—")}   sub="Platform-wide"                                     iconColor="#F97316"  loading={loading} />
        <StatCard icon={FiAlertTriangle} label="Total Alerts"    value={String(stats?.totalAlerts ?? "—")}  sub={`${stats?.unackedAlerts ?? "—"} unacknowledged`}   iconColor="#EF4444"  loading={loading} />
        <StatCard icon={FiActivity}      label="Orgs w/ Devices" value={String(vehiclesPerOrg.length)}      sub="Have active devices"                               iconColor="#F59E0B"  loading={loading} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Devices per org */}
        <div className="rounded-2xl p-5" style={CARD_STYLE}>
          <div className="text-sm font-bold text-white mb-4">Devices per Organisation (Top 8)</div>
          {vehiclesPerOrg.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs" style={{ color: "#4A8A87" }}>
              {loading ? "Loading…" : "No device data yet"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={vehiclesPerOrg} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#4A8A87", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#4A8A87", fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="devices" fill="#0D4A47" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Alert severity donut */}
        <div className="rounded-2xl p-5" style={CARD_STYLE}>
          <div className="text-sm font-bold text-white mb-4">Alert Severity Breakdown</div>
          {alertSeverityData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs" style={{ color: "#4A8A87" }}>
              {loading ? "Loading…" : "No alerts recorded"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={alertSeverityData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                  {alertSeverityData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Legend formatter={(v) => <span style={{ color: "#7BBBB8", fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent orgs */}
        <div className="rounded-2xl p-5" style={CARD_STYLE}>
          <div className="text-sm font-bold text-white mb-4">Recent Organisations</div>
          {loading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />)}</div>
          ) : recentOrgs.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: "#4A8A87" }}>No organisations yet</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: "#4A8A87" }}>
                  <th className="text-left pb-3 font-semibold">Name</th>
                  <th className="text-left pb-3 font-semibold">Status</th>
                  <th className="text-left pb-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {recentOrgs.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2.5 text-white font-medium">{o.name}</td>
                    <td className="py-2.5"><StatusBadge status={o.status ?? "Active"} /></td>
                    <td className="py-2.5" style={{ color: "#4A8A87" }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent alerts */}
        <div className="rounded-2xl p-5" style={CARD_STYLE}>
          <div className="text-sm font-bold text-white mb-4">Recent Alerts</div>
          {loading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />)}</div>
          ) : alerts.length === 0 ? (
            <p className="text-xs text-center py-6" style={{ color: "#4A8A87" }}>No alerts recorded yet</p>
          ) : (
            <div className="space-y-1">
              {alerts.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <SeverityDot severity={a.severity ?? a.alertType ?? "INFO"} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{a.alertType ?? a.type ?? "Alert"} — {a.deviceImei ?? a.deviceId ?? "—"}</div>
                    <div className="text-[10px] truncate" style={{ color: "#4A8A87" }}>{a.alertTime ? new Date(a.alertTime).toLocaleString() : "—"}</div>
                  </div>
                  <SeverityBadge severity={a.severity ?? a.alertType ?? "INFO"} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

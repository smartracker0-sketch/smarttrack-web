"use client";

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import {
  FiUsers, FiTruck, FiAlertTriangle, FiDollarSign,
  FiActivity, FiTrendingUp,
} from "react-icons/fi";
import {
  ORGS, ALERTS, MONTHLY_ORGS, VEHICLES_PER_ORG,
  ALERT_SEVERITY, DAILY_ACTIVE_USERS,
} from "@/admin/data/mockData";

function StatCard({ icon: Icon, label, value, sub, iconColor }: {
  icon: React.ElementType; label: string; value: string; sub: string; iconColor: string;
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#4A8A87" }}>{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: iconColor + "1a" }}>
          <Icon size={15} style={{ color: iconColor }} />
        </div>
      </div>
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="text-xs" style={{ color: "#4A8A87" }}>{sub}</div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const totalVehicles = ORGS.reduce((s, o) => s + o.vehicles, 0);
  const totalUsers = ORGS.reduce((s, o) => s + o.users, 0) + 2;
  const totalMRR = ORGS.reduce((s, o) => s + o.mrr, 0);
  const activeOrgs = ORGS.filter(o => o.status === "Active").length;
  const criticalAlerts = ALERTS.filter(a => a.severity === "Critical").length;

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard icon={FiUsers} label="Organisations" value={String(ORGS.length)} sub={`${activeOrgs} active · +2 this month`} iconColor="#22C55E" />
        <StatCard icon={FiTruck} label="Vehicles Tracked" value={String(totalVehicles)} sub="Across all organisations" iconColor="#1A7A75" />
        <StatCard icon={FiUsers} label="Active Users" value={String(totalUsers)} sub="Platform-wide" iconColor="#F97316" />
        <StatCard icon={FiAlertTriangle} label="Alerts Today" value={String(ALERTS.length)} sub={`${criticalAlerts} critical`} iconColor="#EF4444" />
        <StatCard icon={FiDollarSign} label="Monthly Revenue" value={`₦${(totalMRR / 1000).toFixed(0)}k`} sub="MRR this month" iconColor="#F59E0B" />
        <StatCard icon={FiActivity} label="System Uptime" value="99.8%" sub="Last 30 days" iconColor="#22C55E" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* New orgs line chart */}
        <div className="rounded-2xl p-5" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-sm font-bold text-white mb-4">New Organisations (Last 12 months)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY_ORGS}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#4A8A87", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4A8A87", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#071E1C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Line type="monotone" dataKey="orgs" stroke="#F97316" strokeWidth={2} dot={{ fill: "#F97316", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Vehicles per org bar */}
        <div className="rounded-2xl p-5" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-sm font-bold text-white mb-4">Vehicles per Organisation (Top 8)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={VEHICLES_PER_ORG} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#4A8A87", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#4A8A87", fontSize: 10 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ background: "#071E1C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Bar dataKey="vehicles" fill="#0D4A47" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Alert severity donut */}
        <div className="rounded-2xl p-5" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-sm font-bold text-white mb-4">Alert Severity Breakdown</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={ALERT_SEVERITY} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {ALERT_SEVERITY.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#071E1C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Legend formatter={(v) => <span style={{ color: "#7BBBB8", fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Daily active users area */}
        <div className="rounded-2xl p-5 lg:col-span-2" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-sm font-bold text-white mb-4">Daily Active Users (Last 30 days)</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={DAILY_ACTIVE_USERS}>
              <defs>
                <linearGradient id="dauGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D4A47" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#0D4A47" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: "#4A8A87", fontSize: 10 }} axisLine={false} tickLine={false} interval={4} />
              <YAxis tick={{ fill: "#4A8A87", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#071E1C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Area type="monotone" dataKey="users" stroke="#1A7A75" strokeWidth={2} fill="url(#dauGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent orgs */}
        <div className="rounded-2xl p-5" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-sm font-bold text-white mb-4">Recent Organisations</div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "#4A8A87" }}>
                <th className="text-left pb-3 font-semibold">Name</th>
                <th className="text-left pb-3 font-semibold">Plan</th>
                <th className="text-left pb-3 font-semibold">Status</th>
                <th className="text-left pb-3 font-semibold">Onboarded</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {[...ORGS].sort((a, b) => b.onboarded.localeCompare(a.onboarded)).slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td className="py-2.5 text-white font-medium">{o.name}</td>
                  <td className="py-2.5" style={{ color: "#7BBBB8" }}>{o.plan}</td>
                  <td className="py-2.5">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-2.5" style={{ color: "#4A8A87" }}>{o.onboarded}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent critical alerts */}
        <div className="rounded-2xl p-5" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-sm font-bold text-white mb-4">Recent Critical Alerts</div>
          <div className="space-y-2">
            {ALERTS.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <SeverityDot severity={a.severity} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{a.type} — {a.vehicle}</div>
                  <div className="text-[10px] truncate" style={{ color: "#4A8A87" }}>{a.orgName} · {a.time}</div>
                </div>
                <SeverityBadge severity={a.severity} />
              </div>
            ))}
          </div>
        </div>
      </div>
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
  return (
    <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

function SeverityDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = { Low: "#22C55E", Medium: "#F59E0B", High: "#F97316", Critical: "#EF4444" };
  return <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[severity] ?? "#9CA3AF" }} />;
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Low:      { bg: "#22C55E1a", color: "#22C55E" },
    Medium:   { bg: "#F59E0B1a", color: "#F59E0B" },
    High:     { bg: "#F9731614", color: "#F97316" },
    Critical: { bg: "#EF44441a", color: "#EF4444" },
  };
  const s = map[severity] ?? map.Low;
  return (
    <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: s.bg, color: s.color }}>
      {severity}
    </span>
  );
}

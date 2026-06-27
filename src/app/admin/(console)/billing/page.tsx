"use client";

import { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FiRefreshCw } from "react-icons/fi";

const PLAN_TABLE = [
  { plan: "Starter",    vehicles: 10,    price: "₦35,000/mo",   features: "Basic tracking, 1 admin" },
  { plan: "Pro",        vehicles: 20,    price: "₦85,000/mo",   features: "Full tracking, 5 users, reports" },
  { plan: "Enterprise", vehicles: "100+", price: "₦250,000+/mo", features: "All features, SLA, dedicated support" },
];

const TOOLTIP = { background: "#071E1C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrgRow = Record<string, any>;

export default function BillingPage() {
  const [orgs, setOrgs]     = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/organisations?size=200");
      if (res.ok) {
        const data = await res.json();
        setOrgs(data?.content ?? data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const activeOrgs  = useMemo(() => orgs.filter(o => o.status === "Active"), [orgs]);

  const planData = useMemo(() => [
    { name: "Starter",    value: orgs.filter(o => (o.plan ?? "").toLowerCase() === "starter").length,    color: "#4A8A87" },
    { name: "Pro",        value: orgs.filter(o => (o.plan ?? "").toLowerCase() === "pro").length,        color: "#1A7A75" },
    { name: "Enterprise", value: orgs.filter(o => (o.plan ?? "").toLowerCase() === "enterprise").length, color: "#F97316" },
  ].filter(d => d.value > 0), [orgs]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-white">Billing Overview</h1>
        <button onClick={load} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10" style={{ color: "#7BBBB8" }}>
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[
          { label: "Total Organisations", value: loading ? "…" : String(orgs.length),       color: "#22C55E" },
          { label: "Active Organisations", value: loading ? "…" : String(activeOrgs.length), color: "#1A7A75" },
          { label: "Suspended / Churned",  value: loading ? "…" : String(orgs.filter(o => o.status === "Suspended" || o.status === "Churned").length), color: "#EF4444" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "#4A8A87" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Plan donut */}
        <div className="rounded-2xl p-5" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-sm font-bold text-white mb-3">Orgs by Plan</div>
          {loading ? (
            <div className="h-44 flex items-center justify-center text-xs" style={{ color: "#4A8A87" }}>Loading…</div>
          ) : planData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs" style={{ color: "#4A8A87" }}>No plan data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={planData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                  {planData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP} />
                <Legend formatter={(v) => <span style={{ color: "#7BBBB8", fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Plan tier table */}
        <div className="rounded-2xl p-5 lg:col-span-2" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-sm font-bold text-white mb-3">Plan Tiers</div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "#4A8A87", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Plan", "Vehicle Cap", "Price", "Features"].map(h => <th key={h} className="text-left pb-3 pr-4 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {PLAN_TABLE.map(p => (
                <tr key={p.plan} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td className="py-3 pr-4 text-white font-semibold">{p.plan}</td>
                  <td className="py-3 pr-4" style={{ color: "#7BBBB8" }}>{p.vehicles}</td>
                  <td className="py-3 pr-4 font-semibold" style={{ color: "#F97316" }}>{p.price}</td>
                  <td className="py-3" style={{ color: "#4A8A87" }}>{p.features}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Organisations table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-5 py-4 text-sm font-bold text-white" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>All Organisations</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
                {["Name", "Status", "Devices", "Users", "Created"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: "#4A8A87" }}>Loading…</td></tr>
              ) : orgs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: "#4A8A87" }}>No organisations yet</td></tr>
              ) : orgs.map(o => {
                const statusMap: Record<string, { bg: string; color: string }> = {
                  Active:    { bg: "#22C55E1a", color: "#22C55E" },
                  Trial:     { bg: "#F59E0B1a", color: "#F59E0B" },
                  Suspended: { bg: "#EF44441a", color: "#EF4444" },
                  Churned:   { bg: "rgba(255,255,255,0.05)", color: "#9CA3AF" },
                };
                const sc = statusMap[o.status] ?? statusMap.Churned;
                return (
                  <tr key={o.id} className="hover:bg-white/[0.03] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-4 py-3 text-white font-semibold">{o.name}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex h-5 px-2 rounded text-[10px] font-bold" style={{ background: sc.bg, color: sc.color }}>{o.status ?? "Active"}</span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{o.deviceCount ?? "—"}</td>
                    <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{o.userCount ?? "—"}</td>
                    <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs" style={{ color: "#4A8A87", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {orgs.length} organisations
        </div>
      </div>
    </div>
  );
}

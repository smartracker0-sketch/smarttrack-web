"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { INVOICES, ORGS } from "@/admin/data/mockData";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Paid:    { bg: "#22C55E1a", color: "#22C55E" },
  Pending: { bg: "#F59E0B1a", color: "#F59E0B" },
  Overdue: { bg: "#EF44441a", color: "#EF4444" },
};

const PLAN_DATA = [
  { name: "Starter", value: ORGS.filter(o => o.plan === "Starter").length, color: "#4A8A87" },
  { name: "Pro", value: ORGS.filter(o => o.plan === "Pro").length, color: "#1A7A75" },
  { name: "Enterprise", value: ORGS.filter(o => o.plan === "Enterprise").length, color: "#F97316" },
];

const PLAN_TABLE = [
  { plan: "Starter", vehicles: 10, price: "₦35,000/mo", features: "Basic tracking, 1 admin" },
  { plan: "Pro", vehicles: 20, price: "₦85,000/mo", features: "Full tracking, 5 users, reports" },
  { plan: "Enterprise", vehicles: "100+", price: "₦250,000+/mo", features: "All features, SLA, dedicated support" },
];

export default function BillingPage() {
  const totalMRR = ORGS.reduce((s, o) => s + o.mrr, 0);
  const paidCount = INVOICES.filter(i => i.status === "Paid").length;
  const overdueCount = INVOICES.filter(i => i.status === "Overdue").length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Monthly Recurring Revenue", value: `₦${(totalMRR / 1000).toFixed(0)}k`, color: "#22C55E" },
          { label: "Active Paying Orgs", value: String(ORGS.filter(o => o.mrr > 0).length), color: "#1A7A75" },
          { label: "Overdue Invoices", value: String(overdueCount), color: "#EF4444" },
          { label: "Churn Rate (30d)", value: "2.4%", color: "#F59E0B" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-xl font-extrabold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: "#4A8A87" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Donut */}
        <div className="rounded-2xl p-5" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-sm font-bold text-white mb-3">Orgs by Plan</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={PLAN_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {PLAN_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#071E1C", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff", fontSize: 12 }} />
              <Legend formatter={(v) => <span style={{ color: "#7BBBB8", fontSize: 11 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Plan table */}
        <div className="rounded-2xl p-5 lg:col-span-2" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-sm font-bold text-white mb-3">Plan Tiers</div>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ color: "#4A8A87", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Plan", "Vehicle Cap", "Price", "Features"].map(h => <th key={h} className="text-left pb-3 pr-4 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody className="space-y-1">
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

      {/* Invoice table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-5 py-4 text-sm font-bold text-white" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>All Invoices</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
                {["Invoice #", "Organisation", "Amount (₦)", "Status", "Due Date", "Issued"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INVOICES.map(inv => {
                const sc = STATUS_COLORS[inv.status] ?? STATUS_COLORS.Pending;
                return (
                  <tr key={inv.id} className="hover:bg-white/[0.03] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-4 py-3 text-white font-mono font-semibold">{inv.id}</td>
                    <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{inv.orgName}</td>
                    <td className="px-4 py-3 text-white font-semibold">{inv.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: sc.bg, color: sc.color }}>{inv.status}</span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{inv.dueDate}</td>
                    <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{inv.issued}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

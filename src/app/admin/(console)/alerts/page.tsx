"use client";

import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { ALERTS, ORGS } from "@/admin/data/mockData";

const SEVERITY_COLORS: Record<string, { bg: string; color: string }> = {
  Low:      { bg: "#22C55E1a", color: "#22C55E" },
  Medium:   { bg: "#F59E0B1a", color: "#F59E0B" },
  High:     { bg: "#F974161a", color: "#F97316" },
  Critical: { bg: "#EF44441a", color: "#EF4444" },
};

export default function GlobalAlertsPage() {
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterOrg, setFilterOrg] = useState("All");

  const filtered = ALERTS.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = a.vehicle.toLowerCase().includes(q) || a.driver.toLowerCase().includes(q) || a.type.toLowerCase().includes(q);
    const matchSev = filterSeverity === "All" || a.severity === filterSeverity;
    const matchOrg = filterOrg === "All" || a.orgId === filterOrg;
    return matchSearch && matchSev && matchOrg;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4A8A87" }} />
          <input placeholder="Search alerts…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }} />
        </div>
        {["All", "Low", "Medium", "High", "Critical"].map(s => (
          <button key={s} onClick={() => setFilterSeverity(s)}
            className="h-9 px-3 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: filterSeverity === s ? "#0D4A47" : "rgba(255,255,255,0.06)", color: filterSeverity === s ? "#fff" : "#7BBBB8" }}>
            {s}
          </button>
        ))}
        <select value={filterOrg} onChange={e => setFilterOrg(e.target.value)}
          className="h-9 px-3 rounded-xl text-xs text-white outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <option value="All">All Organisations</option>
          {ORGS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
                {["Time", "Organisation", "Vehicle", "Driver", "Alert Type", "Severity", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const sc = SEVERITY_COLORS[a.severity] ?? SEVERITY_COLORS.Low;
                return (
                  <tr key={a.id} className="hover:bg-white/[0.03] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-4 py-3 text-white font-mono">{a.time}</td>
                    <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{a.orgName}</td>
                    <td className="px-4 py-3 text-white font-semibold">{a.vehicle}</td>
                    <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{a.driver}</td>
                    <td className="px-4 py-3 text-white">{a.type}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: sc.bg, color: sc.color }}>{a.severity}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold"
                        style={{ background: a.status === "Unread" ? "#EF44441a" : "rgba(255,255,255,0.06)", color: a.status === "Unread" ? "#EF4444" : "#9CA3AF" }}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs" style={{ color: "#4A8A87", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {filtered.length} of {ALERTS.length} alerts
        </div>
      </div>
    </div>
  );
}

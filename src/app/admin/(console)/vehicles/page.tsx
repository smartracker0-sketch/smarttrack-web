"use client";

import { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { VEHICLES, ORGS } from "@/admin/data/mockData";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Moving:  { bg: "#22C55E1a", color: "#22C55E" },
  Idle:    { bg: "#F59E0B1a", color: "#F59E0B" },
  Stopped: { bg: "#F974161a", color: "#F97316" },
  Offline: { bg: "rgba(255,255,255,0.06)", color: "#9CA3AF" },
};

export default function GlobalVehiclesPage() {
  const [search, setSearch] = useState("");
  const [filterOrg, setFilterOrg] = useState("All");
  const [selected, setSelected] = useState<typeof VEHICLES[0] | null>(null);

  const filtered = VEHICLES.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = v.plate.toLowerCase().includes(q) || v.driver.toLowerCase().includes(q) || v.imei.includes(q);
    const matchOrg = filterOrg === "All" || v.orgId === filterOrg;
    return matchSearch && matchOrg;
  });

  return (
    <div className="flex gap-5 h-full">
      <div className="flex-1 min-w-0 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4A8A87" }} />
            <input placeholder="Search by plate, driver, IMEI…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-9 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }} />
          </div>
          <select value={filterOrg} onChange={e => setFilterOrg(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <option value="All">All Organisations</option>
            {ORGS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
                  {["Plate Number", "Organisation", "Driver", "Status", "Device IMEI", "Last Seen", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => {
                  const sc = STATUS_COLORS[v.status] ?? STATUS_COLORS.Offline;
                  return (
                    <tr key={v.id} className="hover:bg-white/[0.03] cursor-pointer transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      onClick={() => setSelected(v)}>
                      <td className="px-4 py-3 text-white font-semibold">{v.plate}</td>
                      <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{v.orgName}</td>
                      <td className="px-4 py-3 text-white">{v.driver}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: sc.bg, color: sc.color }}>{v.status}</span>
                      </td>
                      <td className="px-4 py-3 font-mono" style={{ color: "#4A8A87" }}>{v.imei}</td>
                      <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{v.lastSeen}</td>
                      <td className="px-4 py-3">
                        <button className="text-[10px] font-semibold px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "#7BBBB8" }}>Details</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-xs" style={{ color: "#4A8A87", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {filtered.length} of {VEHICLES.length} vehicles
          </div>
        </div>
      </div>

      {/* Slide-over panel */}
      {selected && (
        <div className="w-72 flex-shrink-0 rounded-2xl p-5 space-y-4" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white">{selected.plate}</div>
            <button onClick={() => setSelected(null)} style={{ color: "#7BBBB8" }}><FiX size={15} /></button>
          </div>
          <div className="rounded-xl overflow-hidden flex items-center justify-center text-xs font-semibold"
            style={{ height: 140, background: "rgba(13,74,71,0.4)", border: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
            📍 Live Map — {selected.status}
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Organisation", value: selected.orgName },
              { label: "Driver", value: selected.driver },
              { label: "Status", value: selected.status },
              { label: "IMEI", value: selected.imei },
              { label: "Last Seen", value: selected.lastSeen },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs">
                <span style={{ color: "#4A8A87" }}>{r.label}</span>
                <span className="text-white font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

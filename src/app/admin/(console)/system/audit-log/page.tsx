"use client";

import { useState } from "react";
import { AUDIT_LOG } from "@/admin/data/mockData";

export default function AuditLogPage() {
  const [filterAction, setFilterAction] = useState("All");

  const actions = ["All", ...Array.from(new Set(AUDIT_LOG.map(a => a.action.split(" ").slice(0, 2).join(" "))))];

  const filtered = AUDIT_LOG.filter(a =>
    filterAction === "All" || a.action.startsWith(filterAction)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {actions.slice(0, 6).map(a => (
          <button key={a} onClick={() => setFilterAction(a)}
            className="h-8 px-3 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: filterAction === a ? "#0D4A47" : "rgba(255,255,255,0.06)", color: filterAction === a ? "#fff" : "#7BBBB8" }}>
            {a}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
                {["Timestamp", "Actor", "Action", "Target", "IP Address"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-white/[0.03] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-4 py-3 font-mono" style={{ color: "#4A8A87" }}>{entry.timestamp}</td>
                  <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{entry.actor}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: "#F974161a", color: "#F97316" }}>{entry.action}</span>
                  </td>
                  <td className="px-4 py-3 text-white">{entry.target}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: "#4A8A87" }}>{entry.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs" style={{ color: "#4A8A87", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {filtered.length} of {AUDIT_LOG.length} entries
        </div>
      </div>
    </div>
  );
}

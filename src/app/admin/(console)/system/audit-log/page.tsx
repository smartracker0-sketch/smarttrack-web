"use client";

import { useState, useEffect } from "react";
import { FiRefreshCw, FiShield } from "react-icons/fi";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AuditEntry = Record<string, any>;

export default function AuditLogPage() {
  const [entries, setEntries]   = useState<AuditEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filterAction, setFilterAction] = useState("All");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit-log?size=200");
      if (res.ok) {
        const data = await res.json();
        setEntries(data?.content ?? data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const actionTypes = ["All", ...Array.from(new Set(entries.map(a => (a.action ?? a.eventType ?? "").split(" ").slice(0, 2).join(" ")).filter(Boolean)))];

  const filtered = entries.filter(a =>
    filterAction === "All" || (a.action ?? a.eventType ?? "").startsWith(filterAction)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-wrap gap-2">
          {actionTypes.slice(0, 6).map(a => (
            <button key={a} onClick={() => setFilterAction(a)}
              className="h-8 px-3 rounded-xl text-xs font-semibold transition-colors"
              style={{ background: filterAction === a ? "#0D4A47" : "rgba(255,255,255,0.06)", color: filterAction === a ? "#fff" : "#7BBBB8" }}>
              {a}
            </button>
          ))}
        </div>
        <button onClick={load} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10" style={{ color: "#7BBBB8" }}>
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
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
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center" style={{ color: "#4A8A87" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FiShield size={28} style={{ color: "#4A8A87" }} />
                      <div className="text-xs font-semibold" style={{ color: "#4A8A87" }}>
                        No audit entries yet
                      </div>
                      <div className="text-[10px] max-w-xs" style={{ color: "#2A5A57" }}>
                        Admin actions such as creating organisations, managing users, and suspending accounts will appear here.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(entry => (
                <tr key={entry.id} className="hover:bg-white/[0.03] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-4 py-3 font-mono whitespace-nowrap" style={{ color: "#4A8A87" }}>
                    {entry.timestamp ?? entry.createdAt ? new Date(entry.timestamp ?? entry.createdAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{entry.actor ?? entry.actorEmail ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: "#F974161a", color: "#F97316" }}>
                      {entry.action ?? entry.eventType ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">{entry.target ?? entry.resourceId ?? "—"}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: "#4A8A87" }}>{entry.ip ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs" style={{ color: "#4A8A87", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {filtered.length} of {entries.length} entries
        </div>
      </div>
    </div>
  );
}

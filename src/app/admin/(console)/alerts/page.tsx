"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiRefreshCw, FiCheckCircle } from "react-icons/fi";

const SEVERITY_COLORS: Record<string, { bg: string; color: string }> = {
  Low:      { bg: "#22C55E1a", color: "#22C55E" },
  Medium:   { bg: "#F59E0B1a", color: "#F59E0B" },
  High:     { bg: "#F974161a", color: "#F97316" },
  Critical: { bg: "#EF44441a", color: "#EF4444" },
  CRITICAL: { bg: "#EF44441a", color: "#EF4444" },
  WARNING:  { bg: "#F59E0B1a", color: "#F59E0B" },
  INFO:     { bg: "#22C55E1a", color: "#22C55E" },
  SPEEDING: { bg: "#EF44441a", color: "#EF4444" },
  LOW_BATTERY: { bg: "#F59E0B1a", color: "#F59E0B" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AlertRow = Record<string, any>;

export default function GlobalAlertsPage() {
  const [alerts, setAlerts]       = useState<AlertRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [ackingId, setAckingId]   = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/alerts?size=200");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data?.content ?? data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const severities = ["All", "CRITICAL", "WARNING", "INFO", "SPEEDING", "LOW_BATTERY"];

  const filtered = alerts.filter(a => {
    const q = search.toLowerCase();
    const type = (a.alertType ?? a.type ?? "").toLowerCase();
    const deviceId = (a.deviceId ?? a.deviceImei ?? "").toLowerCase();
    const matchSearch = type.includes(q) || deviceId.includes(q);
    const severity = a.severity ?? a.alertType ?? "INFO";
    const matchSev = filterSeverity === "All" || severity === filterSeverity;
    return matchSearch && matchSev;
  });

  async function handleAcknowledge(id: string) {
    setAckingId(id);
    try {
      await fetch(`/api/telemetry/alerts/${id}/acknowledge`, { method: "PATCH" });
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
    } finally {
      setAckingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4A8A87" }} />
          <input placeholder="Search by type or device…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }} />
        </div>
        {severities.map(s => (
          <button key={s} onClick={() => setFilterSeverity(s)}
            className="h-9 px-3 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: filterSeverity === s ? "#0D4A47" : "rgba(255,255,255,0.06)", color: filterSeverity === s ? "#fff" : "#7BBBB8" }}>
            {s}
          </button>
        ))}
        <button onClick={load} className="ml-auto w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10" style={{ color: "#7BBBB8" }}>
          <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
                {["Time", "Device", "Alert Type", "Severity", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: "#4A8A87" }}>Loading alerts…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center" style={{ color: "#4A8A87" }}>
                  {alerts.length === 0 ? "No alerts recorded yet" : "No alerts match your filter"}
                </td></tr>
              ) : filtered.map(a => {
                const severity = a.severity ?? a.alertType ?? "INFO";
                const sc = SEVERITY_COLORS[severity] ?? { bg: "rgba(255,255,255,0.06)", color: "#9CA3AF" };
                const isAcked = a.acknowledged === true;
                return (
                  <tr key={a.id} className="hover:bg-white/[0.03] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-4 py-3 text-white font-mono whitespace-nowrap">
                      {a.alertTime ? new Date(a.alertTime).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>
                      {a.deviceImei ?? a.deviceId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-white">{a.alertType ?? a.type ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: sc.bg, color: sc.color }}>
                        {severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold"
                        style={{ background: isAcked ? "rgba(255,255,255,0.06)" : "#EF44441a", color: isAcked ? "#9CA3AF" : "#EF4444" }}>
                        {isAcked ? "Acknowledged" : "Unread"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {!isAcked && (
                        <button
                          disabled={ackingId === a.id}
                          onClick={() => handleAcknowledge(a.id)}
                          title="Acknowledge"
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 disabled:opacity-40"
                          style={{ color: "#22C55E" }}>
                          <FiCheckCircle size={13} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs" style={{ color: "#4A8A87", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {filtered.length} of {alerts.length} alerts
        </div>
      </div>
    </div>
  );
}

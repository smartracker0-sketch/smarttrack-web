"use client";

import { useState, useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AlertRow = Record<string, any>;

const SEV_STYLE: Record<string, { border: string; bg: string; color: string }> = {
  CRITICAL: { border: "rgba(239,68,68,0.3)",  bg: "rgba(239,68,68,0.08)",  color: "#EF4444" },
  WARNING:  { border: "rgba(245,158,11,0.3)", bg: "rgba(245,158,11,0.08)", color: "#F59E0B" },
  INFO:     { border: "rgba(99,102,241,0.3)", bg: "rgba(99,102,241,0.08)", color: "#6366F1" },
};

export default function AlertsPage() {
  const [alerts, setAlerts]     = useState<AlertRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("All");
  const [acking, setAcking]     = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/telemetry?type=alerts&unacknowledgedOnly=false");
      if (res.ok) {
        const data = await res.json();
        const list: AlertRow[] = Array.isArray(data) ? data : data?.content ?? [];
        setAlerts(list.sort((a, b) => new Date(b.alertTime ?? 0).getTime() - new Date(a.alertTime ?? 0).getTime()));
      }
    } finally {
      setLoading(false);
    }
  }

  async function acknowledge(id: string) {
    setAcking(id);
    try {
      await fetch(`/api/telemetry/alerts/${id}/acknowledge`, { method: "PATCH" });
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
    } finally {
      setAcking(null);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = filter === "All" ? alerts
    : filter === "Unread" ? alerts.filter(a => !a.acknowledged)
    : alerts.filter(a => a.severity === filter);

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: "#1A7A75" }}>Alerts</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: "#0D4A47" }}>Alert Centre</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Real-time alerts from your fleet devices.</p>
      </div>

      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 flex-wrap">
            {["All", "Unread", "CRITICAL", "WARNING", "INFO"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="h-9 px-3 rounded-xl text-xs font-semibold transition-colors"
                style={{ background: filter === f ? "#0D4A47" : "#E8F4F3", color: filter === f ? "#fff" : "#0D4A47" }}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={load} className="h-9 px-4 rounded-xl border text-sm font-semibold transition-colors" style={{ borderColor: "#C5E0DE", color: "#0D4A47", background: "#E8F4F3" }}>
            Refresh
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          {loading ? (
            <div className="py-10 text-center text-sm" style={{ color: "#9ca3af" }}>Loading alerts…</div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: "#9ca3af" }}>
              {alerts.length === 0 ? "No alerts yet — all clear!" : "No alerts match this filter."}
            </div>
          ) : filtered.map((a) => {
            const sev = a.severity ?? "INFO";
            const s = SEV_STYLE[sev] ?? SEV_STYLE.INFO;
            const timeAgo = a.alertTime ? new Date(a.alertTime).toLocaleString() : "";
            return (
              <div key={a.id} className="rounded-2xl border bg-background p-4" style={{ borderColor: s.border, background: s.bg }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-extrabold" style={{ color: "#111827" }}>{a.alertType ?? a.type ?? "Alert"}</span>
                      {a.acknowledged && <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: "#E8F4F3", color: "#1A7A75" }}>Acknowledged</span>}
                    </div>
                    <div className="mt-1 text-xs" style={{ color: "#6b7280" }}>{a.message ?? a.description ?? ""}</div>
                  </div>
                  <span className="shrink-0 rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: s.border, color: s.color, background: "transparent" }}>{sev}</span>
                </div>
                <div className="mt-1 text-[11px]" style={{ color: "#9ca3af" }}>{timeAgo}</div>
                {!a.acknowledged && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => acknowledge(a.id)}
                      disabled={acking === a.id}
                      className="inline-flex h-9 items-center justify-center rounded-xl px-4 text-xs font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
                      style={{ background: "#0D4A47" }}>
                      {acking === a.id ? "Acknowledging…" : "Acknowledge"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

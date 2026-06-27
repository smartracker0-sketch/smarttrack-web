"use client";

import { useState, useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TelemetryRow = Record<string, any>;

export default function HistoryPage() {
  const [events, setEvents]   = useState<TelemetryRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/telemetry?type=history");
      if (res.ok) {
        const data = await res.json();
        const list: TelemetryRow[] = Array.isArray(data) ? data : data?.content ?? [];
        setEvents(list.sort((a, b) => new Date(b.timestamp ?? b.createdAt ?? 0).getTime() - new Date(a.timestamp ?? a.createdAt ?? 0).getTime()));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: "#1A7A75" }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: "#0D4A47" }}>History</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Telemetry events from your fleet devices.</p>
      </div>

      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-extrabold">Recent Telemetry Events</div>
          <button onClick={load} className="h-9 px-4 rounded-xl border text-xs font-semibold" style={{ borderColor: "#C5E0DE", color: "#0D4A47", background: "#E8F4F3" }}>Refresh</button>
        </div>
        {loading ? (
          <div className="py-10 text-center text-sm" style={{ color: "#9ca3af" }}>Loading…</div>
        ) : events.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: "#9ca3af" }}>No telemetry history yet. Events will appear as your devices send data.</div>
        ) : (
          <div className="grid gap-3">
            {events.slice(0, 50).map((e, i) => (
              <div key={e.id ?? i} className="rounded-2xl border p-4 flex items-center justify-between" style={{ borderColor: "#C5E0DE", background: "#fff" }}>
                <div>
                  <div className="text-sm font-extrabold" style={{ color: "#0D4A47" }}>
                    {e.deviceId ? `Device ${String(e.deviceId).slice(0, 8)}…` : "Unknown device"}
                  </div>
                  <div className="mt-0.5 text-xs" style={{ color: "#1A7A75" }}>
                    Speed: {e.speed != null ? `${e.speed} km/h` : "—"}
                    {e.latitude != null ? ` · ${Number(e.latitude).toFixed(4)}, ${Number(e.longitude).toFixed(4)}` : ""}
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-right" style={{ color: "#9ca3af" }}>
                  {e.timestamp ? new Date(e.timestamp).toLocaleString() : e.createdAt ? new Date(e.createdAt).toLocaleString() : "—"}
                </div>
              </div>
            ))}
            {events.length > 50 && <div className="text-xs text-center" style={{ color: "#9ca3af" }}>Showing 50 of {events.length} events</div>}
          </div>
        )}
      </div>
    </div>
  );
}


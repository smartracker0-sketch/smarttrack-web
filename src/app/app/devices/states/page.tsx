"use client";
import { useState, useEffect } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeviceRow = Record<string, any>;

export default function VehicleStatesPage() {
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/devices")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setDevices(Array.isArray(data) ? data : data?.content ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const total    = devices.length;
  const assigned = devices.filter(d => d.status === "Assigned" || d.vehiclePlate).length;
  const unassigned = total - assigned;

  const states = [
    { label: "Total Devices",  count: total,      color: "#0D4A47" },
    { label: "Assigned",       count: assigned,   color: "#22C55E" },
    { label: "Unassigned",     count: unassigned, color: "#F59E0B" },
  ];

  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Vehicles</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>My Vehicle States</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Live counts of your devices by assignment status.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {states.map((s) => (
          <div key={s.label} className="rounded-2xl border p-5 flex flex-col items-center gap-2" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
            <div className="text-2xl font-extrabold" style={{ color: s.color }}>
              {loading ? "…" : s.count}
            </div>
            <div className="text-xs font-semibold" style={{ color: '#374151' }}>{s.label}</div>
          </div>
        ))}
      </div>
      {!loading && total === 0 && (
        <div className="rounded-3xl border border-divider bg-surface p-6 text-center">
          <div className="text-sm" style={{ color: '#9ca3af' }}>No devices registered yet. Add devices to see their states here.</div>
        </div>
      )}
    </div>
  );
}

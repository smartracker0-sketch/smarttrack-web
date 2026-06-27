"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeviceRow = Record<string, any>;

export default function DevicesMgmtPage() {
  const [devices, setDevices]   = useState<DeviceRow[]>([]);
  const [loading, setLoading]   = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/devices");
      if (res.ok) {
        const data = await res.json();
        setDevices(Array.isArray(data) ? data : data?.content ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: "#1A7A75" }}>System</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: "#0D4A47" }}>Devices</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Manage GPS trackers, SIM cards, firmware versions, and device assignments.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-extrabold" style={{ color: "#0D4A47" }}>Device inventory</div>
          <button onClick={load} className="h-9 px-4 rounded-xl border text-xs font-semibold" style={{ borderColor: "#C5E0DE", color: "#0D4A47", background: "#E8F4F3" }}>Refresh</button>
        </div>
        {loading ? (
          <div className="py-10 text-center text-sm" style={{ color: "#9ca3af" }}>Loading…</div>
        ) : devices.length === 0 ? (
          <div className="py-10 text-center text-sm" style={{ color: "#9ca3af" }}>No devices found. Add a device to get started.</div>
        ) : (
          <div className="grid gap-3">
            {devices.map((d) => (
              <Link key={d.id} href={`/app/devices/${d.id}`}
                className="rounded-2xl border p-4 block hover:bg-[#f0f4ff] transition-colors" style={{ borderColor: "#C5E0DE", background: "#fff" }}>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-extrabold" style={{ color: "#0D4A47" }}>{d.name ?? d.imei}</div>
                  <div className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: d.status === "Online" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: d.status === "Online" ? "#22C55E" : "#EF4444" }}>
                    {d.status ?? "Unknown"}
                  </div>
                </div>
                <div className="mt-1 text-xs" style={{ color: "#1A7A75" }}>
                  IMEI: {d.imei ?? "—"}
                  {d.simCard ? ` · SIM: ${d.simCard}` : ""}
                  {d.firmware ? ` · FW: ${d.firmware}` : ""}
                  {d.vehiclePlate ? ` · Plate: ${d.vehiclePlate}` : ""}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FiShare2, FiRefreshCw, FiMapPin, FiChevronRight, FiX } from "react-icons/fi";
import type { MarkerData } from "@/components/MapboxMap";

const MapboxMap = dynamic(() => import("@/components/MapboxMap"), { ssr: false });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeviceRow = Record<string, any>;

const STATUS_COLOR: Record<string, string> = {
  moving:  "#22C55E",
  stopped: "#EF4444",
  idle:    "#F59E0B",
  offline: "#9CA3AF",
  Assigned: "#22C55E",
  Unassigned: "#9CA3AF",
};

function statusLabel(d: DeviceRow, telem: DeviceRow | null): string {
  if (!telem) return d.status ?? "Unknown";
  const spd = telem.speedKph ?? 0;
  if (spd > 5) return `Moving · ${spd} km/h`;
  if (telem.ignition) return "Idle";
  return "Stopped";
}

function statKey(d: DeviceRow, telem: DeviceRow | null): string {
  if (!telem) return "offline";
  const spd = telem.speedKph ?? 0;
  if (spd > 5) return "moving";
  if (telem.ignition) return "idle";
  return "stopped";
}

function StatCell({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <div className="flex flex-col items-center px-3 py-2" style={{ borderRight: divider ? "1px solid #e5e7eb" : undefined }}>
      <p className="text-xs font-bold" style={{ color: "#111827" }}>{value}</p>
      <p className="text-[10px]" style={{ color: "#9ca3af" }}>{label}</p>
    </div>
  );
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-sm text-white font-medium" style={{ background: "#3949ab" }}>
      {msg}
      <button onClick={onDone}><FiX size={14} /></button>
    </div>
  );
}

export default function AllVehiclesPage() {
  const [devices, setDevices]   = useState<DeviceRow[]>([]);
  const [telemetry, setTelemetry] = useState<Record<string, DeviceRow>>({});
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAll, setShowAll]   = useState(true);
  const [toast, setToast]       = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const notify = (msg: string) => setToast(msg);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/devices");
      if (res.ok) {
        const data = await res.json();
        const list: DeviceRow[] = Array.isArray(data) ? data : data?.content ?? [];
        setDevices(list);
        if (list.length > 0 && !selected) setSelected(list[0].id);
        // Fetch latest telemetry for each device in parallel
        const telemResults = await Promise.allSettled(
          list.map(d => fetch(`/api/telemetry?type=latest&deviceId=${d.id}`).then(r => (r.ok && r.status !== 204) ? r.json() : null))
        );
        const telemMap: Record<string, DeviceRow> = {};
        telemResults.forEach((r, i) => {
          if (r.status === "fulfilled" && r.value) telemMap[list[i].id] = r.value;
        });
        setTelemetry(telemMap);
      }
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => { load(); }, []);

  const handleRefresh = async (e: React.MouseEvent, deviceId: string, name: string) => {
    e.stopPropagation();
    setRefreshing(deviceId);
    try {
      const res = await fetch(`/api/telemetry?type=latest&deviceId=${deviceId}`);
      if (res.ok && res.status !== 204) {
        const t = await res.json();
        setTelemetry(prev => ({ ...prev, [deviceId]: t }));
        notify(`Location refreshed for ${name}`);
      }
    } finally {
      setRefreshing(null);
    }
  };

  const handleShare = (e: React.MouseEvent, d: DeviceRow) => {
    e.stopPropagation();
    const t = telemetry[d.id];
    const text = `${d.name ?? d.imei}\nPlate: ${d.vehiclePlate ?? "—"} | Speed: ${t?.speedKph ?? 0} km/h`;
    if (navigator.share) navigator.share({ title: d.name ?? d.imei, text }).catch(() => {});
    else navigator.clipboard.writeText(text).then(() => notify(`Info copied for ${d.name ?? d.imei}`));
  };

  const displayed = showAll ? devices : devices.filter(d => d.id === selected);

  const markers: MarkerData[] = useMemo(() =>
    devices
      .filter(d => {
        const t = telemetry[d.id];
        return t?.latitude != null && t?.longitude != null;
      })
      .map(d => {
        const t = telemetry[d.id];
        const sk = statKey(d, t ?? null);
        return {
          id: d.id,
          lat: t.latitude,
          lng: t.longitude,
          color: STATUS_COLOR[sk],
          pulsing: sk === "moving",
          popupHtml: `
            <div style="font-family:Inter,sans-serif">
              <strong style="color:#f3f4f6">${d.name ?? d.imei}</strong>
              <div style="margin-top:6px;font-size:12px;color:#d1d5db;line-height:1.7">
                <div>Speed: ${t.speedKph ?? 0} km/h</div>
                <div>Plate: ${d.vehiclePlate ?? "—"}</div>
              </div>
            </div>
          `,
        };
      }),
    [devices, telemetry]
  );

  return (
    <div className="flex h-full" style={{ background: "#f3f4f6" }}>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* ── Device list panel ── */}
      <div className="flex flex-col w-full max-w-xs flex-shrink-0 border-r overflow-hidden" style={{ background: "#fff", borderColor: "#e5e7eb" }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: "#e5e7eb" }}>
          <p className="text-xs" style={{ color: "#9ca3af" }}>
            {loading ? "Loading…" : `All Devices · ${devices.length} Device${devices.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-10 text-center text-xs" style={{ color: "#9ca3af" }}>Loading devices…</div>
          ) : devices.length === 0 ? (
            <div className="py-10 text-center text-xs" style={{ color: "#9ca3af" }}>No devices registered yet.</div>
          ) : displayed.map((d) => {
            const t = telemetry[d.id] ?? null;
            const isSelected = d.id === selected;
            const isRef = refreshing === d.id;
            const sk = statKey(d, t);
            const sl = statusLabel(d, t);
            return (
              <button key={d.id} type="button" onClick={() => setSelected(d.id)}
                className="w-full text-left px-4 py-4 border-b transition-colors"
                style={{ borderColor: "#e5e7eb", background: isSelected ? "#eef0fb" : "#fff", borderLeft: isSelected ? "3px solid #3949ab" : "3px solid transparent" }}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold leading-tight" style={{ color: "#111827" }}>{d.name ?? d.imei}</span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={(e) => handleShare(e, d)} title="Share" className="p-0.5 rounded hover:bg-gray-100">
                      <FiShare2 size={13} style={{ color: "#9ca3af" }} />
                    </button>
                    <button onClick={(e) => handleRefresh(e, d.id, d.name ?? d.imei)} title="Refresh" className="p-0.5 rounded hover:bg-gray-100">
                      <FiRefreshCw size={13} className={isRef ? "animate-spin" : ""} style={{ color: isRef ? "#3949ab" : "#9ca3af" }} />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs font-semibold" style={{ color: STATUS_COLOR[sk] ?? "#9CA3AF" }}>{sl}</p>
                {d.vehiclePlate && (
                  <div className="mt-1 flex items-center gap-1">
                    <FiMapPin size={11} className="flex-shrink-0" style={{ color: "#6b7280" }} />
                    <p className="text-xs" style={{ color: "#4b5563" }}>{d.vehiclePlate}</p>
                  </div>
                )}
                {d.organisationName && (
                  <p className="mt-0.5 text-[11px]" style={{ color: "#6b7280" }}>Org: {d.organisationName}</p>
                )}
                {t?.receivedAt && <p className="mt-0.5 text-[11px]" style={{ color: "#9ca3af" }}>Updated {new Date(t.receivedAt ?? t.eventTime).toLocaleTimeString()}</p>}
                {isSelected && t && (
                  <div className="mt-3 flex items-center rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
                    <StatCell label="Speed" value={`${t.speedKph ?? 0} km/h`} divider />
                    <StatCell label="Battery" value={t.voltageMv != null ? `${(t.voltageMv / 1000).toFixed(2)} V` : "—"} divider />
                    <div className="flex-1 flex items-center justify-between px-3 py-2">
                      <div>
                        <p className="text-xs font-bold" style={{ color: "#111827" }}>{t.ignition ? "ON" : "OFF"}</p>
                        <p className="text-[10px]" style={{ color: "#9ca3af" }}>Ignition</p>
                      </div>
                      <FiChevronRight size={14} style={{ color: "#9ca3af" }} />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t" style={{ borderColor: "#e5e7eb" }}>
          <button onClick={() => setShowAll(s => !s)}
            className="w-full h-9 rounded-lg border text-sm font-semibold transition-colors hover:bg-gray-50"
            style={{ borderColor: "#3949ab", color: "#3949ab" }}>
            {showAll ? "Show Selected Only" : "Show All"}
          </button>
        </div>
      </div>

      {/* ── Map area ── */}
      <div className="flex-1 relative overflow-hidden">
        <MapboxMap
          markers={markers}
          flyToId={selected ?? ""}
          center={[9.082, 8.675]}
          zoom={markers.length > 0 ? 10 : 5}
          style="mapbox://styles/mapbox/streets-v12"
          className="w-full h-full"
          onMarkerClick={setSelected}
        />
        <Link href="/app/map"
          className="absolute bottom-4 right-4 z-10 px-4 py-2 rounded-xl shadow text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ background: "#3949ab" }}>
          Open Live Tracking →
        </Link>
      </div>
    </div>
  );
}

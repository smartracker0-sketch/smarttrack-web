"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FiShare2, FiUser, FiRefreshCw, FiMessageSquare, FiMapPin, FiChevronRight, FiX } from "react-icons/fi";
import type { MarkerData } from "@/components/MapboxMap";

const MapboxMap = dynamic(() => import("@/components/MapboxMap"), { ssr: false });

const MOCK_VEHICLES = [
  {
    id: "1",
    name: "R7_Binder Singh...GK1292",
    status: "stopped",
    statusLabel: "Stopped: 5 hours and 35 minutes",
    distance: "Today: 0.1 km",
    lastSeen: "Last data received 3 min ago",
    location: "Payal Maksudra Rd, Payal, Punjab 141416, India",
    ignition: "OFF",
    speed: "0 km/h",
    battery: "12.76 V",
    lat: 30.678,
    lng: 76.021,
  },
  {
    id: "2",
    name: "Truck 12 — PB10GK1234",
    status: "moving",
    statusLabel: "Moving",
    distance: "Today: 42.3 km",
    lastSeen: "Last data received just now",
    location: "GT Road, Ludhiana, Punjab, India",
    ignition: "ON",
    speed: "68 km/h",
    battery: "13.2 V",
    lat: 30.901,
    lng: 75.857,
  },
  {
    id: "3",
    name: "Van 3 — PB07CA5678",
    status: "idle",
    statusLabel: "Idle: 22 minutes",
    distance: "Today: 18.7 km",
    lastSeen: "Last data received 1 min ago",
    location: "Industrial Area, Phase 2, Chandigarh",
    ignition: "ON",
    speed: "0 km/h",
    battery: "12.9 V",
    lat: 30.733,
    lng: 76.779,
  },
];

const STATUS_COLOR: Record<string, string> = {
  moving: "#22C55E",
  stopped: "#EF4444",
  idle: "#F59E0B",
  offline: "#9CA3AF",
};

function StatCell({ label, value, divider }: { label: string; value: string; divider?: boolean }) {
  return (
    <div
      className="flex flex-col items-center px-3 py-2"
      style={{ borderRight: divider ? "1px solid #e5e7eb" : undefined }}
    >
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
  const [selected, setSelected] = useState<string>(MOCK_VEHICLES[0].id);
  const [showAll, setShowAll] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);

  const displayedVehicles = showAll ? MOCK_VEHICLES : MOCK_VEHICLES.filter((v) => v.id === selected);

  const notify = (msg: string) => setToast(msg);

  const handleRefresh = (e: React.MouseEvent, vehicleId: string, vehicleName: string) => {
    e.stopPropagation();
    setRefreshing(vehicleId);
    setTimeout(() => {
      setRefreshing(null);
      notify(`Location refreshed for ${vehicleName}`);
    }, 1200);
  };

  const handleShare = (e: React.MouseEvent, v: typeof MOCK_VEHICLES[0]) => {
    e.stopPropagation();
    const text = `${v.name} — ${v.location}\nStatus: ${v.statusLabel} | Speed: ${v.speed}`;
    if (navigator.share) {
      navigator.share({ title: v.name, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => notify(`Location copied for ${v.name}`));
    }
  };

  const handleDriver = (e: React.MouseEvent, vehicleName: string) => {
    e.stopPropagation();
    notify(`Driver info for ${vehicleName} — feature coming soon`);
  };

  const handleMessage = (e: React.MouseEvent, vehicleName: string) => {
    e.stopPropagation();
    notify(`Message sent to driver of ${vehicleName}`);
  };

  const markers: MarkerData[] = useMemo(() =>
    MOCK_VEHICLES.map((v) => ({
      id: v.id,
      lat: v.lat,
      lng: v.lng,
      color: STATUS_COLOR[v.status],
      pulsing: v.status === "moving",
      popupHtml: `
        <div style="font-family:Inter,sans-serif">
          <strong style="color:#f3f4f6">${v.name}</strong>
          <div style="margin-top:6px;font-size:12px;color:#d1d5db;line-height:1.7">
            <div>Status: ${v.statusLabel}</div>
            <div>Ignition: ${v.ignition}</div>
            <div>Speed: ${v.speed}</div>
            <div>Battery: ${v.battery}</div>
            <div style="margin-top:4px;color:#9ca3af">${v.location}</div>
          </div>
        </div>
      `,
    })),
    []
  );

  return (
    <div className="flex h-full" style={{ background: "#f3f4f6" }}>
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      {/* ── Vehicle list panel ── */}
      <div
        className="flex flex-col w-full max-w-xs flex-shrink-0 border-r overflow-hidden"
        style={{ background: "#fff", borderColor: "#e5e7eb" }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: "#e5e7eb" }}>
          <p className="text-xs" style={{ color: "#9ca3af" }}>
            All Vehicles · {MOCK_VEHICLES.length} Vehicle{MOCK_VEHICLES.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {displayedVehicles.map((v) => {
            const isSelected = v.id === selected;
            const isRefreshing = refreshing === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelected(v.id)}
                className="w-full text-left px-4 py-4 border-b transition-colors"
                style={{
                  borderColor: "#e5e7eb",
                  background: isSelected ? "#eef0fb" : "#fff",
                  borderLeft: isSelected ? "3px solid #3949ab" : "3px solid transparent",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold leading-tight" style={{ color: "#111827" }}>
                    {v.name}
                  </span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={(e) => handleShare(e, v)}
                      title="Share location"
                      className="p-0.5 rounded hover:bg-gray-100 transition-colors"
                    >
                      <FiShare2 size={13} style={{ color: "#9ca3af" }} />
                    </button>
                    <button
                      onClick={(e) => handleDriver(e, v.name)}
                      title="Driver info"
                      className="p-0.5 rounded hover:bg-gray-100 transition-colors"
                    >
                      <FiUser size={13} style={{ color: "#9ca3af" }} />
                    </button>
                    <button
                      onClick={(e) => handleRefresh(e, v.id, v.name)}
                      title="Refresh location"
                      className="p-0.5 rounded hover:bg-gray-100 transition-colors"
                      style={{ animation: isRefreshing ? "spin 0.8s linear infinite" : undefined }}
                    >
                      <FiRefreshCw size={13} style={{ color: isRefreshing ? "#3949ab" : "#9ca3af" }} />
                    </button>
                    <button
                      onClick={(e) => handleMessage(e, v.name)}
                      title="Message driver"
                      className="p-0.5 rounded hover:bg-gray-100 transition-colors"
                    >
                      <FiMessageSquare size={13} style={{ color: "#9ca3af" }} />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs font-semibold" style={{ color: STATUS_COLOR[v.status] }}>
                  {v.statusLabel}
                  <span className="ml-2 font-normal" style={{ color: "#9ca3af" }}>| {v.distance}</span>
                </p>
                <p className="mt-0.5 text-xs" style={{ color: "#9ca3af" }}>{v.lastSeen}</p>
                <div className="mt-2 flex items-start gap-1">
                  <FiMapPin size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#6b7280" }} />
                  <p className="text-xs leading-snug" style={{ color: "#4b5563" }}>{v.location}</p>
                </div>
                {isSelected && (
                  <div className="mt-3 flex items-center gap-0 rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
                    <StatCell label="Ignition" value={v.ignition} divider />
                    <StatCell label="Speed" value={v.speed} divider />
                    <div className="flex-1 flex items-center justify-between px-3 py-2">
                      <div>
                        <p className="text-xs font-bold" style={{ color: "#111827" }}>{v.battery}</p>
                        <p className="text-[10px]" style={{ color: "#9ca3af" }}>Battery Voltage</p>
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
          <button
            onClick={() => setShowAll((s) => !s)}
            className="w-full h-9 rounded-lg border text-sm font-semibold transition-colors hover:bg-gray-50"
            style={{ borderColor: "#3949ab", color: "#3949ab" }}
          >
            {showAll ? "Show Selected Only" : "Show All"}
          </button>
        </div>
      </div>

      {/* ── Map area ── */}
      <div className="flex-1 relative overflow-hidden">
        <MapboxMap
          markers={markers}
          flyToId={selected}
          center={[30.733, 76.779]}
          zoom={10}
          style="mapbox://styles/mapbox/streets-v12"
          className="w-full h-full"
          onMarkerClick={setSelected}
        />
        <Link
          href="/app/map"
          className="absolute bottom-4 right-4 z-10 px-4 py-2 rounded-xl shadow text-sm font-semibold text-white transition-all hover:brightness-110"
          style={{ background: "#3949ab" }}
        >
          Open Live Tracking →
        </Link>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

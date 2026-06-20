"use client";

import { useState } from "react";
import Link from "next/link";
import { FiShare2, FiUser, FiRefreshCw, FiMessageSquare, FiMapPin, FiChevronRight } from "react-icons/fi";

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

export default function AppHomePage() {
  const [selected, setSelected] = useState<string>(MOCK_VEHICLES[0].id);

  const vehicle = MOCK_VEHICLES.find((v) => v.id === selected) ?? MOCK_VEHICLES[0];

  return (
    <div className="flex h-full" style={{ background: "#f3f4f6" }}>

      {/* ── Vehicle list panel ── */}
      <div
        className="flex flex-col w-full max-w-xs flex-shrink-0 border-r overflow-hidden"
        style={{ background: "#fff", borderColor: "#e5e7eb" }}
      >
        {/* Panel header */}
        <div className="px-4 py-3 border-b" style={{ borderColor: "#e5e7eb" }}>
          <p className="text-xs" style={{ color: "#9ca3af" }}>
            All Vehicles · {MOCK_VEHICLES.length} Vehicle{MOCK_VEHICLES.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Vehicle cards */}
        <div className="flex-1 overflow-y-auto">
          {MOCK_VEHICLES.map((v) => {
            const isSelected = v.id === selected;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setSelected(v.id)}
                className="w-full text-left px-4 py-4 border-b transition-colors"
                style={{
                  borderColor: "#e5e7eb",
                  background: isSelected ? "#f0faf9" : "#fff",
                  borderLeft: isSelected ? "3px solid #0D4A47" : "3px solid transparent",
                }}
              >
                {/* Row 1: name + actions */}
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold leading-tight" style={{ color: "#111827" }}>
                    {v.name}
                  </span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <FiShare2 size={13} style={{ color: "#9ca3af" }} />
                    <FiUser size={13} style={{ color: "#9ca3af" }} />
                    <FiRefreshCw size={13} style={{ color: "#9ca3af" }} />
                    <FiMessageSquare size={13} style={{ color: "#9ca3af" }} />
                  </div>
                </div>

                {/* Row 2: status */}
                <p className="mt-1 text-xs font-semibold" style={{ color: STATUS_COLOR[v.status] }}>
                  {v.statusLabel}
                  <span className="ml-2 font-normal" style={{ color: "#9ca3af" }}>| {v.distance}</span>
                </p>

                {/* Row 3: last seen */}
                <p className="mt-0.5 text-xs" style={{ color: "#9ca3af" }}>{v.lastSeen}</p>

                {/* Row 4: location */}
                <div className="mt-2 flex items-start gap-1">
                  <FiMapPin size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#6b7280" }} />
                  <p className="text-xs leading-snug" style={{ color: "#4b5563" }}>{v.location}</p>
                </div>

                {/* Row 5: stats bar (only when selected) */}
                {isSelected && (
                  <div className="mt-3 flex items-center gap-0 rounded-xl border overflow-hidden" style={{ borderColor: "#e5e7eb" }}>
                    <StatCell label="Ignition" value={v.ignition} />
                    <StatCell label="Speed" value={v.speed} divider />
                    <div className="flex-1 flex items-center justify-between px-3 py-2">
                      <div>
                        <p className="text-xs font-bold" style={{ color: "#111827" }}>{v.battery}</p>
                        <p className="text-[10px]" style={{ color: "#9ca3af" }}>Vehicle Battery Voltage</p>
                      </div>
                      <FiChevronRight size={14} style={{ color: "#9ca3af" }} />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Show All button */}
        <div className="px-4 py-3 border-t" style={{ borderColor: "#e5e7eb" }}>
          <button
            className="w-full h-9 rounded-lg border text-sm font-semibold transition-colors hover:bg-gray-50"
            style={{ borderColor: "#e5e7eb", color: "#374151" }}
          >
            Show All
          </button>
        </div>
      </div>

      {/* ── Map area ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map placeholder — replace with Leaflet component when ready */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4"
          style={{ background: "linear-gradient(135deg, #e8f4f3 0%, #d1ece9 50%, #b2d4d2 100%)" }}
        >
          {/* Simulated map grid */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0D4A47" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Vehicle pin on map */}
          <div className="relative z-10 flex flex-col items-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: STATUS_COLOR[vehicle.status] }}
            >
              <span className="text-white text-xl">🚗</span>
            </div>
            <div
              className="mt-2 px-3 py-1.5 rounded-xl shadow text-xs font-bold text-white"
              style={{ background: "#0D4A47" }}
            >
              {vehicle.name}
            </div>
          </div>

          {/* "More Options" overlay */}
          <div
            className="absolute top-4 right-4 px-4 py-2 rounded-xl shadow text-sm font-semibold flex items-center gap-2"
            style={{ background: "#fff", color: "#374151", border: "1px solid #e5e7eb" }}
          >
            <FiChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
            More Options
          </div>

          {/* Map attribution stub */}
          <div className="absolute bottom-3 left-4 text-xs" style={{ color: "#6b7280" }}>
            Map data ©2026 · 200 m
          </div>

          {/* Link to full tracking page */}
          <Link
            href="/tracking"
            className="absolute bottom-4 right-4 px-4 py-2 rounded-xl shadow text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: "#0D4A47" }}
          >
            Open Live Tracking →
          </Link>
        </div>
      </div>
    </div>
  );
}

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

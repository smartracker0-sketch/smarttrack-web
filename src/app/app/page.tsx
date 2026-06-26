"use client";

import { useState } from "react";
import { FiTruck, FiAlertTriangle, FiActivity, FiChevronDown, FiNavigation, FiZap } from "react-icons/fi";

const CHART_OPTIONS = [
  { value: "distance", label: "Distance Driven" },
  { value: "trips", label: "Trip Count" },
  { value: "fuel", label: "Fuel Consumption" },
  { value: "alerts", label: "Alert Frequency" },
  { value: "idling", label: "Idling Time" },
  { value: "speed", label: "Avg Speed" },
];

const STAT_CARDS = [
  { label: "Total Vehicles", value: "3", sub: "2 active now", icon: FiTruck, color: "#0D4A47", bg: "#E8F4F3" },
  { label: "Trips Today", value: "18", sub: "+3 vs yesterday", icon: FiNavigation, color: "#6366F1", bg: "#EEF2FF" },
  { label: "Active Alerts", value: "3", sub: "1 critical", icon: FiAlertTriangle, color: "#EF4444", bg: "#FEF2F2" },
  { label: "Km Driven Today", value: "61.1", sub: "Across all vehicles", icon: FiActivity, color: "#F59E0B", bg: "#FFFBEB" },
  { label: "Avg Speed", value: "47 km/h", sub: "Moving vehicles", icon: FiZap, color: "#22C55E", bg: "#F0FDF4" },
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CHART_DATA: Record<string, number[]> = {
  distance: [312, 278, 410, 365, 290, 180, 61],
  trips: [22, 19, 28, 25, 20, 12, 5],
  fuel: [48, 42, 61, 55, 44, 28, 10],
  alerts: [4, 2, 7, 5, 3, 1, 3],
  idling: [38, 31, 52, 44, 35, 20, 8],
  speed: [44, 47, 49, 46, 45, 42, 47],
};

const RECENT_EVENTS = [
  { time: "12:34", vehicle: "Truck 12", event: "Speeding alert — 132 km/h", type: "alert" },
  { time: "11:20", vehicle: "Van 3", event: "Trip started — Chandigarh Industrial", type: "trip" },
  { time: "09:55", vehicle: "R7_Binder", event: "Ignition ON", type: "info" },
  { time: "08:12", vehicle: "Truck 12", event: "Low battery — 11.4 V", type: "alert" },
  { time: "07:30", vehicle: "Van 3", event: "Trip ended — 18.7 km", type: "trip" },
];

const EVENT_COLOR: Record<string, string> = {
  alert: "#EF4444",
  trip: "#22C55E",
  info: "#6366F1",
};

export default function AnalyticsPage() {
  const [chartType, setChartType] = useState("distance");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const data = CHART_DATA[chartType] ?? CHART_DATA.distance;
  const maxVal = Math.max(...data, 1);
  const selectedLabel = CHART_OPTIONS.find((o) => o.value === chartType)?.label ?? "Overview";

  return (
    <div className="p-6 grid gap-6" style={{ background: "#f3f4f6", minHeight: "100%" }}>

      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#1A7A75" }}>Dashboard</p>
        <h1 className="mt-1 text-2xl font-extrabold" style={{ color: "#0D4A47" }}>Analytics Overview</h1>
        <p className="mt-1 text-sm" style={{ color: "#6b7280" }}>Fleet performance at a glance — updated in real time.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {STAT_CARDS.map((c) => (
          <div key={c.label} className="rounded-2xl border p-4 flex flex-col gap-2" style={{ background: "#fff", borderColor: "#e5e7eb" }}>
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: c.bg }}>
                <c.icon size={17} style={{ color: c.color }} />
              </div>
            </div>
            <div className="text-2xl font-extrabold leading-none" style={{ color: "#111827" }}>{c.value}</div>
            <div className="text-xs font-semibold" style={{ color: "#374151" }}>{c.label}</div>
            <div className="text-[11px]" style={{ color: "#9ca3af" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Chart section */}
      <div className="rounded-2xl border p-6" style={{ background: "#fff", borderColor: "#e5e7eb" }}>
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
          <div>
            <div className="text-sm font-extrabold" style={{ color: "#111827" }}>{selectedLabel}</div>
            <div className="text-xs" style={{ color: "#9ca3af" }}>Last 7 days</div>
          </div>

          {/* Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 h-9 px-4 rounded-xl border text-sm font-semibold transition-colors"
              style={{ borderColor: "#e5e7eb", color: "#374151", background: "#f9fafb" }}
            >
              {selectedLabel}
              <FiChevronDown size={14} style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
            </button>
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-1 w-52 rounded-xl border shadow-lg z-20 py-1 overflow-hidden"
                style={{ background: "#fff", borderColor: "#e5e7eb" }}
              >
                {CHART_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { setChartType(opt.value); setDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors"
                    style={{
                      background: chartType === opt.value ? "#E8F4F3" : "transparent",
                      color: chartType === opt.value ? "#0D4A47" : "#374151",
                      fontWeight: chartType === opt.value ? 700 : 400,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-3 h-40">
          {data.map((val, i) => (
            <div key={WEEK_DAYS[i]} className="flex flex-col items-center gap-1 flex-1">
              <div className="text-[10px] font-semibold" style={{ color: "#9ca3af" }}>
                {val}
              </div>
              <div
                className="w-full rounded-t-lg transition-all duration-300"
                style={{
                  height: `${(val / maxVal) * 120}px`,
                  background: i === 6 ? "#0D4A47" : "#C5E0DE",
                  minHeight: 4,
                }}
              />
              <div className="text-[10px] font-semibold" style={{ color: i === 6 ? "#0D4A47" : "#9ca3af" }}>
                {WEEK_DAYS[i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row: fleet status + recent events */}
      <div className="grid gap-4 md:grid-cols-2">

        {/* Fleet status donut-style */}
        <div className="rounded-2xl border p-6" style={{ background: "#fff", borderColor: "#e5e7eb" }}>
          <div className="text-sm font-extrabold mb-4" style={{ color: "#111827" }}>Fleet Status</div>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3.2" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22C55E" strokeWidth="3.2"
                  strokeDasharray="33 67" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F59E0B" strokeWidth="3.2"
                  strokeDasharray="17 83" strokeDashoffset="-33" strokeLinecap="round" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EF4444" strokeWidth="3.2"
                  strokeDasharray="50 50" strokeDashoffset="-50" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-extrabold" style={{ color: "#111827" }}>3</span>
                <span className="text-[9px]" style={{ color: "#9ca3af" }}>vehicles</span>
              </div>
            </div>
            <div className="grid gap-2 flex-1">
              {[
                { label: "Moving", count: 1, color: "#22C55E" },
                { label: "Idle", count: 1, color: "#F59E0B" },
                { label: "Stopped", count: 1, color: "#EF4444" },
                { label: "Offline", count: 0, color: "#9CA3AF" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-xs" style={{ color: "#374151" }}>{s.label}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: "#111827" }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent events */}
        <div className="rounded-2xl border p-6" style={{ background: "#fff", borderColor: "#e5e7eb" }}>
          <div className="text-sm font-extrabold mb-4" style={{ color: "#111827" }}>Recent Events</div>
          <div className="grid gap-3">
            {RECENT_EVENTS.map((e, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: EVENT_COLOR[e.type] }} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate" style={{ color: "#111827" }}>{e.vehicle}</div>
                  <div className="text-[11px] truncate" style={{ color: "#6b7280" }}>{e.event}</div>
                </div>
                <span className="text-[11px] flex-shrink-0" style={{ color: "#9ca3af" }}>{e.time}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

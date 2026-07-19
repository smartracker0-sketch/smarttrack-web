"use client";

import { ReactNode } from "react";
import { FiMaximize2, FiNavigation, FiClock, FiBell } from "react-icons/fi";

type MapFilter = "all" | "moving" | "alerts";

interface Props {
  filter: MapFilter;
  onFilterChange: (filter: MapFilter) => void;
  interval: number;
  onIntervalChange: (ms: number) => void;
  selectedId: string | null;
  followId: string | null;
  onFollowToggle: () => void;
}

const INTERVALS = [
  { label: "10s", ms: 10000 },
  { label: "30s", ms: 30000 },
  { label: "60s", ms: 60000 },
];

export default function MapControls({
  filter,
  onFilterChange,
  interval,
  onIntervalChange,
  selectedId,
  followId,
  onFollowToggle,
}: Props) {
  const isFollowing = Boolean(selectedId && followId === selectedId);

  const filterOptions: { key: MapFilter; label: string; icon: ReactNode }[] = [
    { key: "all", label: "All Vehicles", icon: null },
    { key: "moving", label: "Moving Only", icon: null },
    { key: "alerts", label: "Alerts Only", icon: <FiBell size={12} /> },
  ];

  return (
    <div
      className="absolute top-4 right-4 z-[1000] rounded-xl shadow-xl p-3 flex flex-col gap-3 min-w-[180px]"
      style={{ background: '#0A3835', border: '1px solid rgba(26,122,117,0.35)' }}
    >
      {/* View filter */}
      <div>
        <p className="text-xs font-semibold mb-1.5" style={{ color: '#B2D4D2' }}>Show</p>
        <div className="flex flex-col gap-1">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onFilterChange(opt.key)}
              className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg text-left font-medium transition-colors ${
                filter === opt.key ? "text-white" : "hover:text-white"
              }`}
              style={filter === opt.key ? { background: '#00bcd4', color: '#0A3835' } : { color: '#B2D4D2', background: 'rgba(10,56,53,0.5)' }}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Follow selected vehicle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#B2D4D2' }}>
          <FiNavigation size={13} />
          Follow
        </div>
        <button
          onClick={onFollowToggle}
          disabled={!selectedId}
          className="w-9 h-5 rounded-full transition-colors relative disabled:opacity-40"
          style={{ background: isFollowing ? '#00bcd4' : 'rgba(178,212,210,0.3)' }}
          title={selectedId ? "Keep map centered on selected vehicle" : "Select a vehicle first"}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              isFollowing ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {/* Refresh interval */}
      <div>
        <div className="flex items-center gap-1.5 text-xs mb-1.5" style={{ color: '#B2D4D2' }}>
          <FiClock size={12} />
          Refresh
        </div>
        <div className="flex gap-1">
          {INTERVALS.map((i) => (
            <button
              key={i.ms}
              onClick={() => onIntervalChange(i.ms)}
              className={`flex-1 text-xs py-1 rounded-lg font-medium transition-colors ${
                interval === i.ms ? "text-white" : "hover:text-white"
              }`}
              style={interval === i.ms ? { background: '#3949ab' } : { background: 'rgba(10,56,53,0.5)', color: '#B2D4D2' }}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen */}
      <button
        onClick={() => document.documentElement.requestFullscreen?.()}
        className="flex items-center justify-center gap-2 text-xs py-1.5 rounded-lg transition-colors hover:bg-[#e8eaf6] hover:text-[#3949ab]"
        style={{ border: '1px solid rgba(26,122,117,0.35)', color: '#B2D4D2' }}
      >
        <FiMaximize2 size={13} />
        Fullscreen
      </button>
    </div>
  );
}

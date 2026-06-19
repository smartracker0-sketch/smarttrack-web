"use client";

import { useState } from "react";
import { FiMaximize2, FiLayers, FiClock } from "react-icons/fi";

interface Props {
  interval: number;
  onIntervalChange: (ms: number) => void;
}

const INTERVALS = [
  { label: "10s", ms: 10000 },
  { label: "30s", ms: 30000 },
  { label: "60s", ms: 60000 },
];

export default function MapControls({ interval, onIntervalChange }: Props) {
  const [filter, setFilter] = useState<"all" | "moving" | "alerts">("all");
  const [clustered, setClustered] = useState(false);

  return (
    <div
      className="absolute top-4 right-4 z-[1000] rounded-xl shadow-xl p-3 flex flex-col gap-3 min-w-[180px]"
      style={{ background: '#0D4A47', border: '1px solid rgba(26,122,117,0.35)' }}
    >
      {/* View filter */}
      <div>
        <p className="text-xs font-semibold mb-1.5" style={{ color: '#B2D4D2' }}>Show</p>
        <div className="flex flex-col gap-1">
          {[
            { key: "all", label: "All Vehicles" },
            { key: "moving", label: "Moving Only" },
            { key: "alerts", label: "Alerts Only" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key as typeof filter)}
              className={`text-xs px-3 py-1.5 rounded-lg text-left font-medium transition-colors ${
                filter === opt.key ? "text-white" : "hover:text-white"
              }`}
              style={filter === opt.key ? { background: '#1A7A75' } : { color: '#B2D4D2', background: 'rgba(10,56,53,0.5)' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cluster toggle */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#B2D4D2' }}>
          <FiLayers size={13} />
          Cluster
        </div>
        <button
          onClick={() => setClustered((c) => !c)}
          className="w-9 h-5 rounded-full transition-colors relative"
          style={{ background: clustered ? '#F97316' : 'rgba(178,212,210,0.3)' }}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              clustered ? "translate-x-4" : "translate-x-0.5"
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
              style={interval === i.ms ? { background: '#1A7A75' } : { background: 'rgba(10,56,53,0.5)', color: '#B2D4D2' }}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen */}
      <button
        onClick={() => document.documentElement.requestFullscreen?.()}
        className="flex items-center justify-center gap-2 text-xs py-1.5 rounded-lg transition-colors hover:text-white"
        style={{ border: '1px solid rgba(26,122,117,0.35)', color: '#B2D4D2' }}
      >
        <FiMaximize2 size={13} />
        Fullscreen
      </button>
    </div>
  );
}

"use client";

import { FiRefreshCw, FiSettings } from "react-icons/fi";
import { Vehicle, VehicleStatus } from "../data/mockVehicles";

interface Props {
  vehicles: Vehicle[];
  lastRefresh: string;
  onRefresh: () => void;
}

function count(vehicles: Vehicle[], status: VehicleStatus) {
  return vehicles.filter((v) => v.status === status).length;
}

const statusStyles: Record<VehicleStatus, string> = {
  moving: "text-green-400",
  stopped: "text-red-400",
  idle: "text-yellow-400",
  offline: "text-gray-400",
};

export default function TrackingTopBar({ vehicles, lastRefresh, onRefresh }: Props) {
  return (
    <div
      className="flex items-center justify-between gap-4 px-4 py-3 border-b"
      style={{ background: "#0D4A47", borderColor: "rgba(26,122,117,0.35)" }}
    >
      {/* Left: title + live indicator */}
      <div className="flex items-center gap-3">
        <span className="text-white font-bold text-base">Live Tracking</span>
        <span className="flex items-center gap-1.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-green-400 tracking-widest">LIVE</span>
        </span>
      </div>

      {/* Centre: quick stats */}
      <div className="hidden md:flex items-center gap-2">
        {(["moving", "stopped", "idle", "offline"] as VehicleStatus[]).map((s) => (
          <span
            key={s}
            className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${statusStyles[s]}`}
            style={{ background: 'rgba(10,56,53,0.7)', border: '1px solid rgba(26,122,117,0.3)' }}
          >
            {count(vehicles, s)} {s}
          </span>
        ))}
      </div>

      {/* Right: refresh + settings */}
      <div className="flex items-center gap-3 text-sm" style={{ color: '#B2D4D2' }}>
        <span className="hidden sm:block text-xs">Updated: {lastRefresh}</span>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg transition-colors hover:bg-[#e8eaf6] hover:text-[#3949ab]"
          title="Refresh"
        >
          <FiRefreshCw size={16} />
        </button>
        <button className="p-1.5 rounded-lg transition-colors hover:bg-[#e8eaf6] hover:text-[#3949ab]" title="Settings">
          <FiSettings size={16} />
        </button>
      </div>
    </div>
  );
}

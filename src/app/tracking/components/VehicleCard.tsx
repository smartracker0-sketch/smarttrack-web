"use client";

import { Vehicle, VehicleStatus } from "../data/mockVehicles";

interface Props {
  vehicle: Vehicle;
  selected: boolean;
  onClick: () => void;
}

const dotColor: Record<VehicleStatus, string> = {
  moving: "bg-green-500",
  stopped: "bg-red-500",
  idle: "bg-yellow-400",
  offline: "bg-gray-500",
};

const speedLabel = (v: Vehicle) => {
  if (v.status === "offline") return "Offline";
  if (v.status === "stopped") return "Stopped";
  if (v.status === "idle") return "Idling";
  return `${Math.round(v.speed)} km/h`;
};

export default function VehicleCard({ vehicle, selected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 transition-colors border-b group"
      style={selected
        ? { borderBottomColor: 'rgba(26,122,117,0.3)', borderLeft: '4px solid #00bcd4', background: '#0A3835' }
        : { borderBottomColor: 'rgba(26,122,117,0.2)' }
      }
      onMouseEnter={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'rgba(0,188,212,0.08)'; }}
      onMouseLeave={e => { if (!selected) (e.currentTarget as HTMLElement).style.background = ''; }}
    >
      <div className="flex items-start gap-3">
        {/* Status dot */}
        <div className="mt-1.5 flex-shrink-0">
          <span className={`block w-2.5 h-2.5 rounded-full ${dotColor[vehicle.status]}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white font-bold text-sm truncate group-hover:text-[#00bcd4] transition-colors">{vehicle.plate}</span>
            <span className={`text-xs font-semibold flex-shrink-0 ${
              vehicle.status === "moving" ? "text-green-400" :
              vehicle.status === "idle" ? "text-yellow-400" :
              vehicle.status === "stopped" ? "text-red-400" : "text-gray-500"
            }`}>
              {speedLabel(vehicle)}
            </span>
          </div>
          <div className="text-[#B2D4D2] text-xs mt-0.5 truncate">{vehicle.driver}</div>
          <div className="text-gray-500 text-xs mt-1">{vehicle.lastUpdate}</div>
        </div>
      </div>
    </button>
  );
}

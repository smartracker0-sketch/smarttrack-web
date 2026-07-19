"use client";

import { ReactNode } from "react";
import { Vehicle, VehicleStatus } from "../data/mockVehicles";
import {
  FiX,
  FiNavigation,
  FiMap,
  FiPhone,
  FiActivity,
  FiClock,
  FiTruck,
} from "react-icons/fi";

interface Props {
  vehicle: Vehicle | null;
  followId: string | null;
  onClose: () => void;
  onFollowToggle: () => void;
}

const statusLabel: Record<VehicleStatus, string> = {
  moving: "Moving",
  stopped: "Stopped",
  idle: "Idling",
  offline: "Offline",
};

const statusDot: Record<VehicleStatus, string> = {
  moving: "bg-green-500",
  stopped: "bg-red-500",
  idle: "bg-yellow-400",
  offline: "bg-gray-500",
};

export default function VehicleDetailPanel({
  vehicle,
  followId,
  onClose,
  onFollowToggle,
}: Props) {
  if (!vehicle) return null;

  const isFollowing = followId === vehicle.id;

  return (
    <div className="absolute right-0 top-0 z-[1000] h-full w-80 flex flex-col shadow-2xl"
      style={{ background: "#0A3835", borderLeft: "1px solid rgba(26,122,117,0.35)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "rgba(26,122,117,0.35)", background: "#0D4A47" }}
      >
        <div className="flex items-center gap-2">
          <FiTruck className="text-[#00bcd4]" size={18} />
          <span className="text-white font-bold text-sm truncate">{vehicle.plate}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors hover:bg-[#e8eaf6] hover:text-[#3949ab]"
          style={{ color: "#B2D4D2" }}
          title="Close"
        >
          <FiX size={18} />
        </button>
      </div>

      {/* Status hero */}
      <div className="px-4 py-5 border-b" style={{ borderColor: "rgba(26,122,117,0.35)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className={`block w-2.5 h-2.5 rounded-full ${statusDot[vehicle.status]}`} />
          <span className="text-white font-semibold text-sm">{statusLabel[vehicle.status]}</span>
        </div>
        <div className="text-3xl font-bold text-white mb-1">
          {Math.round(vehicle.speed)}
          <span className="text-sm font-normal text-[#B2D4D2] ml-1">km/h</span>
        </div>
        <div className="text-xs text-[#B2D4D2]">
          Heading {Math.round(vehicle.heading)}° · Ignition {vehicle.ignition ? "ON" : "OFF"}
        </div>
      </div>

      {/* Info list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <InfoRow icon={<FiTruck size={14} />} label="Make / Model" value={`${vehicle.make} ${vehicle.model}`} />
        <InfoRow icon={<FiActivity size={14} />} label="Driver" value={vehicle.driver} />
        <InfoRow icon={<FiPhone size={14} />} label="Phone" value={vehicle.phone} />
        <InfoRow icon={<FiMap size={14} />} label="Address" value={vehicle.address} />
        <InfoRow icon={<FiClock size={14} />} label="Last Update" value={vehicle.lastUpdate} />
        <InfoRow
          icon={<FiNavigation size={14} />}
          label="Coordinates"
          value={`${vehicle.lat.toFixed(5)}, ${vehicle.lng.toFixed(5)}`}
        />
      </div>

      {/* Actions */}
      <div className="p-4 border-t grid grid-cols-2 gap-3"
        style={{ borderColor: "rgba(26,122,117,0.35)", background: "#072E2C" }}
      >
        <button
          onClick={onFollowToggle}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
            isFollowing
              ? "bg-[#00bcd4] text-[#0A3835]"
              : "bg-[#3949ab] text-white hover:bg-[#303f9f]"
          }`}
        >
          <FiNavigation size={14} />
          {isFollowing ? "Following" : "Track Live"}
        </button>
        <button
          onClick={() => alert(`Trip history for ${vehicle.plate} will open here.`)}
          className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold transition-colors"
          style={{ background: "rgba(0,188,212,0.12)", color: "#00bcd4" }}
        >
          <FiMap size={14} />
          Trip History
        </button>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span style={{ color: "#00bcd4" }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-[#B2D4D2] mb-0.5">{label}</div>
        <div className="text-sm text-white truncate">{value}</div>
      </div>
    </div>
  );
}

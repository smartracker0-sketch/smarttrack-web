"use client";

import { useMemo } from "react";
import { Vehicle, VehicleStatus } from "../data/mockVehicles";
import MapControls from "./MapControls";
import MapboxMap, { MarkerData } from "@/components/MapboxMap";

interface Props {
  vehicles: Vehicle[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  interval: number;
  onIntervalChange: (ms: number) => void;
}

const STATUS_COLORS: Record<VehicleStatus, string> = {
  moving: "#22c55e",
  stopped: "#ef4444",
  idle: "#eab308",
  offline: "#6b7280",
};

function buildPopupHtml(v: Vehicle): string {
  const color = STATUS_COLORS[v.status];
  const speedText =
    v.status === "moving" ? `${Math.round(v.speed)} km/h` :
    v.status === "idle"    ? "Idling" :
    v.status === "stopped" ? "Stopped" : "Offline";

  return `
    <div style="font-family:Inter,sans-serif;min-width:220px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block;flex-shrink:0"></span>
        <strong style="font-size:15px;color:#f3f4f6">${v.plate}</strong>
        <span style="font-size:11px;color:#9ca3af;margin-left:auto">${v.make} ${v.model}</span>
      </div>
      <div style="font-size:12px;color:#d1d5db;line-height:1.8">
        <div>👤 <strong>${v.driver}</strong></div>
        <div>📞 ${v.phone}</div>
        <div>🚀 Speed: <strong>${speedText}</strong></div>
        <div>🔑 Ignition: <strong>${v.ignition ? "ON" : "OFF"}</strong></div>
        <div>📍 ${v.address}</div>
        <div>🕒 ${v.lastUpdate}</div>
      </div>
      <div style="display:flex;gap:6px;margin-top:10px">
        <button style="flex:1;padding:5px 0;background:#0D4A47;color:white;border:none;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600">Trip History</button>
        <button style="flex:1;padding:5px 0;background:#f97316;color:white;border:none;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600">Track Live</button>
      </div>
    </div>
  `;
}

export default function LiveMap({ vehicles, selectedId, onSelect, interval, onIntervalChange }: Props) {
  const markers: MarkerData[] = useMemo(() =>
    vehicles.map((v) => ({
      id: v.id,
      lat: v.lat,
      lng: v.lng,
      color: STATUS_COLORS[v.status],
      pulsing: v.status === "moving",
      heading: v.heading,
      popupHtml: buildPopupHtml(v),
    })),
    [vehicles]
  );

  return (
    <div className="relative flex-1 h-full">
      <MapboxMap
        markers={markers}
        flyToId={selectedId}
        center={[6.5244, 3.3792]}
        zoom={12}
        style="mapbox://styles/mapbox/dark-v11"
        className="w-full h-full"
        onMarkerClick={onSelect}
      />
      <MapControls interval={interval} onIntervalChange={onIntervalChange} />
    </div>
  );
}

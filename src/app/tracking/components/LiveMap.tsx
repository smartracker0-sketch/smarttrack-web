"use client";

import { useMemo, useState } from "react";
import { Vehicle, VehicleStatus } from "../data/mockVehicles";
import MapControls from "./MapControls";
import VehicleDetailPanel from "./VehicleDetailPanel";
import MapboxMap, { MarkerData } from "@/components/MapboxMap";

interface Props {
  vehicles: Vehicle[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  followId: string | null;
  onFollowToggle: (id: string | null) => void;
  interval: number;
  onIntervalChange: (ms: number) => void;
}

type MapFilter = "all" | "moving" | "alerts";

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
  const statusDot = `<span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block"></span>`;

  return `
    <div style="font-family:Inter,sans-serif;min-width:220px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        ${statusDot}
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
    </div>
  `;
}

export default function LiveMap({
  vehicles,
  selectedId,
  onSelect,
  followId,
  onFollowToggle,
  interval,
  onIntervalChange,
}: Props) {
  const [filter, setFilter] = useState<MapFilter>("all");

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => v.id === selectedId) ?? null,
    [vehicles, selectedId]
  );

  const visibleVehicles = useMemo(() => {
    if (filter === "all") return vehicles;
    if (filter === "moving") return vehicles.filter((v) => v.status === "moving");
    return vehicles.filter((v) => v.alert);
  }, [vehicles, filter]);

  const markers: MarkerData[] = useMemo(
    () =>
      visibleVehicles.map((v) => ({
        id: v.id,
        lat: v.lat,
        lng: v.lng,
        color: STATUS_COLORS[v.status],
        pulsing: v.status === "moving",
        heading: v.heading,
        popupHtml: buildPopupHtml(v),
      })),
    [visibleVehicles]
  );

  const handleMarkerClick = (id: string) => {
    if (selectedId === id) return;
    onSelect(id);
  };

  const handleClosePanel = () => {
    onSelect(null);
    if (selectedId && followId === selectedId) onFollowToggle(null);
  };

  const handleFollowToggle = () => {
    if (!selectedId) return;
    onFollowToggle(followId === selectedId ? null : selectedId);
  };

  return (
    <div className="relative flex-1 h-full overflow-hidden">
      <MapboxMap
        markers={markers}
        flyToId={selectedId}
        followId={followId}
        center={[6.5244, 3.3792]}
        zoom={12}
        style="mapbox://styles/mapbox/dark-v11"
        className="w-full h-full"
        onMarkerClick={handleMarkerClick}
      />
      <MapControls
        filter={filter}
        onFilterChange={setFilter}
        interval={interval}
        onIntervalChange={onIntervalChange}
        selectedId={selectedId}
        followId={followId}
        onFollowToggle={() => selectedId && onFollowToggle(followId === selectedId ? null : selectedId)}
      />
      {selectedVehicle && (
        <VehicleDetailPanel
          vehicle={selectedVehicle}
          followId={followId}
          onClose={handleClosePanel}
          onFollowToggle={handleFollowToggle}
        />
      )}
    </div>
  );
}

"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { Vehicle, VehicleStatus } from "../data/mockVehicles";
import MapControls from "./MapControls";

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

function makeSvgIcon(color: string, isMoving: boolean) {
  const pulse = isMoving
    ? `<circle cx="16" cy="16" r="14" fill="${color}" opacity="0.15"><animate attributeName="r" from="10" to="16" dur="1.4s" repeatCount="indefinite"/><animate attributeName="opacity" from="0.4" to="0" dur="1.4s" repeatCount="indefinite"/></circle>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    ${pulse}
    <circle cx="16" cy="16" r="10" fill="${color}" stroke="white" stroke-width="2.5"/>
    <path d="M10 16 L15 12 L22 16 L15 20 Z" fill="white" opacity="0.9"/>
  </svg>`;
}

export default function LiveMap({ vehicles, selectedId, onSelect, interval, onIntervalChange }: Props) {
  const mapRef = useRef<ReturnType<typeof import("leaflet")["map"]> | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // initialise map once
  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    initializedRef.current = true;

    import("leaflet").then((L) => {
      // fix default icon path issue in Next.js
      // @ts-expect-error leaflet internal
      delete L.Icon.Default.prototype._getIconUrl;

      const map = L.map(containerRef.current!, {
        center: [6.5244, 3.3792],
        zoom: 12,
        zoomControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapRef.current = map;

      // add initial markers
      vehicles.forEach((v) => {
        const svgStr = makeSvgIcon(STATUS_COLORS[v.status], v.status === "moving");
        const icon = L.divIcon({
          html: svgStr,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([v.lat, v.lng], { icon })
          .addTo(map)
          .bindPopup(buildPopupHtml(v), { maxWidth: 280 });

        marker.on("click", () => onSelect(v.id));
        markersRef.current.set(v.id, marker);
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
      initializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update markers when vehicles change
  useEffect(() => {
    if (!mapRef.current) return;
    import("leaflet").then((L) => {
      vehicles.forEach((v) => {
        const marker = markersRef.current.get(v.id);
        if (!marker) return;

        marker.setLatLng([v.lat, v.lng]);

        const svgStr = makeSvgIcon(STATUS_COLORS[v.status], v.status === "moving");
        const icon = L.divIcon({
          html: svgStr,
          className: "",
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        marker.setIcon(icon);
        marker.setPopupContent(buildPopupHtml(v));
      });
    });
  }, [vehicles]);

  // fly to selected vehicle
  useEffect(() => {
    if (!selectedId || !mapRef.current) return;
    const vehicle = vehicles.find((v) => v.id === selectedId);
    if (!vehicle) return;
    mapRef.current.flyTo([vehicle.lat, vehicle.lng], 15, { duration: 1 });
    const marker = markersRef.current.get(selectedId);
    marker?.openPopup();
  }, [selectedId, vehicles]);

  return (
    <div className="relative flex-1 h-full">
      <div ref={containerRef} className="w-full h-full" />
      <MapControls interval={interval} onIntervalChange={onIntervalChange} />
    </div>
  );
}

function buildPopupHtml(v: Vehicle) {
  const statusColor = STATUS_COLORS[v.status];
  const speedText =
    v.status === "moving" ? `${Math.round(v.speed)} km/h` :
    v.status === "idle" ? "Idling" :
    v.status === "stopped" ? "Stopped" : "Offline";

  return `
    <div style="font-family:Inter,sans-serif;min-width:220px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="width:10px;height:10px;border-radius:50%;background:${statusColor};display:inline-block;flex-shrink:0"></span>
        <strong style="font-size:15px">${v.plate}</strong>
        <span style="font-size:11px;color:#888;margin-left:auto">${v.make} ${v.model}</span>
      </div>
      <div style="font-size:12px;color:#555;line-height:1.7">
        <div>👤 <strong>${v.driver}</strong></div>
        <div>📞 ${v.phone}</div>
        <div>🚀 Speed: <strong>${speedText}</strong></div>
        <div>🔑 Ignition: <strong>${v.ignition ? "ON" : "OFF"}</strong></div>
        <div>📍 ${v.address}</div>
        <div>🕒 ${v.lastUpdate}</div>
      </div>
      <div style="display:flex;gap:6px;margin-top:10px">
        <button onclick="void 0" style="flex:1;padding:5px 0;background:#0D4A47;color:white;border:none;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600">Trip History</button>
        <button onclick="void 0" style="flex:1;padding:5px 0;background:#f97316;color:white;border:none;border-radius:6px;font-size:11px;cursor:pointer;font-weight:600">Track Live</button>
      </div>
    </div>
  `;
}

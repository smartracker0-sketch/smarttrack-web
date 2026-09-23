"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiCrosshair, FiMapPin, FiRefreshCw, FiSearch, FiTruck } from "react-icons/fi";
import type { MarkerData } from "@/components/MapboxMap";

const MapboxMap = dynamic(() => import("@/components/MapboxMap"), { ssr: false });

type MapObject = {
  id: string; name: string; imei: string; vehiclePlate?: string | null; deviceType: string;
  objectIcon?: string | null; deviceStatus: string; liveStatus: string;
  organisationId?: string | null; organisationName?: string | null;
  ownerId?: string | null; ownerName?: string | null;
  latitude?: number | null; longitude?: number | null; speedKph?: number | null;
  headingDeg?: number | null; ignition?: boolean | null; voltageMv?: number | null;
  satellites?: number | null; positionTime?: string | null; lastReportedAt?: string | null;
};

const STATUS_COLOR: Record<string, string> = {
  MOVING: "#10B981", IDLING: "#F59E0B", STOPPED: "#F43F5E",
  DELAYED: "#38BDF8", OFFLINE: "#64748B", NO_DATA: "#94A3B8",
};

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character] ?? character);
}

function relativeTime(value?: string | null) {
  if (!value) return "Never";
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function voltage(value?: number | null) {
  if (value == null) return "Not reported";
  return `${(value / 1000).toFixed(2)} V`;
}

function popupHtml(object: MapObject) {
  const coords = object.latitude != null && object.longitude != null
    ? `${object.latitude.toFixed(6)}, ${object.longitude.toFixed(6)}` : "Unavailable";
  return `<div class="tp-popup-inner">
    <div class="tp-popup-title">${escapeHtml(object.name)} <span>→</span></div>
    <div class="tp-popup-status"><strong>${escapeHtml(object.liveStatus.replace("_", " "))}</strong> · ${Math.round(object.speedKph ?? 0)} km/h</div>
    <div class="tp-popup-muted">Last report ${escapeHtml(relativeTime(object.lastReportedAt))}</div>
    <div class="tp-popup-location">${escapeHtml(object.organisationName || "No organisation")} · ${escapeHtml(object.vehiclePlate || object.deviceType)}</div>
    <div class="tp-popup-coords">${escapeHtml(coords)}</div>
    <div class="tp-popup-row">IMEI: <strong>${escapeHtml(object.imei)}</strong></div>
    <div class="tp-popup-row">Owner: <strong>${escapeHtml(object.ownerName || "Unassigned")}</strong></div>
    <div class="tp-popup-row">Ignition: <strong>${object.ignition ? "ON" : "OFF"}</strong> · Battery: <strong>${escapeHtml(voltage(object.voltageMv))}</strong></div>
  </div>`;
}

export default function AdminSystemMapPage() {
  const [objects, setObjects] = useState<MapObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [organisation, setOrganisation] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch("/api/admin/devices/map", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load system objects");
      setObjects(await response.json() as MapObject[]);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load system objects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(true), 15_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const organisations = useMemo(() => Array.from(new Set(objects.map(item => item.organisationName).filter(Boolean) as string[])).sort(), [objects]);
  const types = useMemo(() => Array.from(new Set(objects.map(item => item.deviceType).filter(Boolean))).sort(), [objects]);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return objects.filter(item => {
      const matchesQuery = !term || [item.name, item.imei, item.vehiclePlate, item.ownerName, item.organisationName]
        .some(value => String(value ?? "").toLowerCase().includes(term));
      const matchesStatus = status === "ALL" || item.liveStatus === status
        || (status === "OFFLINE_ALL" && ["OFFLINE", "NO_DATA"].includes(item.liveStatus));
      return matchesQuery && matchesStatus
        && (organisation === "ALL" || item.organisationName === organisation)
        && (type === "ALL" || item.deviceType === type);
    });
  }, [objects, organisation, query, status, type]);

  const markers = useMemo<MarkerData[]>(() => filtered
    .filter(item => item.latitude != null && item.longitude != null)
    .map(item => ({
      id: item.id, lat: item.latitude!, lng: item.longitude!,
      color: STATUS_COLOR[item.liveStatus] ?? STATUS_COLOR.NO_DATA,
      pulsing: item.liveStatus === "MOVING", heading: item.headingDeg ?? 0,
      ignition: Boolean(item.ignition), moving: item.liveStatus === "MOVING",
      motionLabel: item.liveStatus.replace("_", " "), objectIcon: item.objectIcon ?? "car",
      label: item.vehiclePlate || item.name, popupHtml: popupHtml(item),
    })), [filtered]);

  const counts = useMemo(() => ({
    all: objects.length,
    moving: objects.filter(item => item.liveStatus === "MOVING").length,
    idling: objects.filter(item => item.liveStatus === "IDLING").length,
    stopped: objects.filter(item => item.liveStatus === "STOPPED").length,
    offline: objects.filter(item => ["OFFLINE", "NO_DATA"].includes(item.liveStatus)).length,
  }), [objects]);

  return <div className="flex h-full min-h-[680px] flex-col gap-4">
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {[
        ["All objects", counts.all, "#7BBBB8"], ["Moving", counts.moving, "#10B981"],
        ["Idling", counts.idling, "#F59E0B"], ["Stopped", counts.stopped, "#F43F5E"],
        ["Offline", counts.offline, "#94A3B8"],
      ].map(([label, value, color]) => <button key={String(label)} type="button" onClick={() => setStatus(label === "All objects" ? "ALL" : label === "Offline" ? "OFFLINE_ALL" : String(label).toUpperCase())} className="rounded-md border border-white/10 bg-[#0a2a28] p-3 text-left">
        <p className="text-xs font-semibold text-[#669995]">{label}</p><p className="mt-1 text-xl font-extrabold" style={{ color: String(color) }}>{value}</p>
      </button>)}
    </section>

    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-white/10 bg-[#071e1c] sm:flex-row">
      <aside className="flex h-[46%] w-full shrink-0 flex-col border-b border-white/10 sm:h-auto sm:w-[340px] sm:border-b-0 sm:border-r lg:w-[380px]">
        <div className="space-y-3 border-b border-white/10 p-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#669995]" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, IMEI, plate or owner" className="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#4a7774] focus:border-[#f97316]" /></div>
            <button type="button" onClick={() => void load()} title="Refresh objects" className="grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-white/5 text-[#7bbbb8]"><FiRefreshCw className={loading ? "animate-spin" : ""} /></button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select value={status} onChange={event => setStatus(event.target.value)} className="h-9 min-w-0 rounded-md border border-white/10 bg-[#0a2a28] px-2 text-xs text-white"><option value="ALL">All status</option><option value="OFFLINE_ALL">Offline / No data</option>{["MOVING", "IDLING", "STOPPED", "DELAYED", "OFFLINE", "NO_DATA"].map(value => <option key={value}>{value}</option>)}</select>
            <select value={organisation} onChange={event => setOrganisation(event.target.value)} className="h-9 min-w-0 rounded-md border border-white/10 bg-[#0a2a28] px-2 text-xs text-white"><option value="ALL">All organisations</option>{organisations.map(value => <option key={value}>{value}</option>)}</select>
            <select value={type} onChange={event => setType(event.target.value)} className="h-9 min-w-0 rounded-md border border-white/10 bg-[#0a2a28] px-2 text-xs text-white"><option value="ALL">All types</option>{types.map(value => <option key={value}>{value}</option>)}</select>
          </div>
          <p className="text-xs text-[#669995]">Showing {filtered.length} objects · {markers.length} with map positions</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {error && <div className="m-2 flex gap-2 rounded-md border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-200"><FiAlertCircle className="shrink-0" />{error}</div>}
          {!loading && filtered.length === 0 && <div className="p-8 text-center text-sm text-[#669995]">No objects match these filters.</div>}
          <div className="space-y-2">{filtered.map(item => {
            const hasPosition = item.latitude != null && item.longitude != null;
            return <button key={item.id} type="button" onClick={() => hasPosition && setSelectedId(item.id)} className={`w-full rounded-md border p-3 text-left transition ${selectedId === item.id ? "border-[#f97316] bg-[#f97316]/10" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.06]"}`}>
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{item.name}</p><p className="mt-0.5 truncate text-[11px] text-[#669995]">{item.vehiclePlate || item.imei}</p></div><span className="rounded px-2 py-1 text-[10px] font-bold" style={{ color: STATUS_COLOR[item.liveStatus], background: `${STATUS_COLOR[item.liveStatus]}18` }}>{item.liveStatus.replace("_", " ")}</span></div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs"><div><p className="text-[#4a7774]">Speed</p><p className="mt-0.5 font-bold text-white">{Math.round(item.speedKph ?? 0)} km/h</p></div><div><p className="text-[#4a7774]">Ignition</p><p className="mt-0.5 font-bold text-white">{item.ignition ? "ON" : "OFF"}</p></div><div><p className="text-[#4a7774]">Last report</p><p className="mt-0.5 font-bold text-white">{relativeTime(item.lastReportedAt)}</p></div></div>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-[#7bbbb8]">{hasPosition ? <FiMapPin /> : <FiAlertCircle />}<span className="truncate">{hasPosition ? `${item.latitude!.toFixed(5)}, ${item.longitude!.toFixed(5)}` : "No location reported"}</span>{hasPosition && <FiCrosshair className="ml-auto shrink-0 text-[#f97316]" />}</div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-[#4a7774]"><FiTruck /><span className="truncate">{item.organisationName || "No organisation"} · {item.ownerName || "Unassigned"}</span></div>
            </button>;
          })}</div>
        </div>
      </aside>

      <div className="relative min-h-[320px] min-w-0 flex-1">
        <MapboxMap markers={markers} flyToId={selectedId} zoom={5} center={[8.6753, 9.082]} onMarkerClick={setSelectedId} />
        <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-white/10 bg-[#071e1c]/90 px-3 py-2 text-xs text-[#7bbbb8] shadow-lg backdrop-blur">Objects refresh automatically every 15 seconds</div>
      </div>
    </section>
  </div>;
}

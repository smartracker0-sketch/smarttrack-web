"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  FiCamera,
  FiChevronRight,
  FiClipboard,
  FiCopy,
  FiDatabase,
  FiLayers,
  FiMapPin,
  FiMessageCircle,
  FiNavigation,
  FiPackage,
  FiRefreshCw,
  FiSearch,
  FiShare2,
  FiTruck,
  FiUser,
  FiX,
} from "react-icons/fi";
import type { MarkerData } from "@/components/MapboxMap";

const MapboxMap = dynamic(() => import("@/components/MapboxMap"), { ssr: false });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeviceRow = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LiveTabRow = Record<string, any>;

const STATUS_COLOR: Record<string, string> = {
  moving: "#22C55E",
  stopped: "#EF334A",
  idle: "#F59E0B",
  offline: "#94A3B8",
};

const MAP_STYLES = [
  { id: "streets", label: "Streets", style: "mapbox://styles/mapbox/streets-v12" },
  { id: "satellite", label: "Satellite", style: "mapbox://styles/mapbox/satellite-v9" },
  { id: "dark", label: "Dark", style: "mapbox://styles/mapbox/dark-v11" },
  { id: "light", label: "Light", style: "mapbox://styles/mapbox/light-v11" },
  { id: "outdoors", label: "Outdoors", style: "mapbox://styles/mapbox/outdoors-v12" },
];

const VEHICLE_PANEL_TABS = ["Objects", "Notifications", "History", "Geofence", "Landmark"];

const STATUS_FILTERS = [
  { key: "all", label: "All", color: "#AA139E" },
  { key: "moving", label: "Running", color: "#33A46F" },
  { key: "idle", label: "Idling", color: "#EDB41D" },
  { key: "stopped", label: "Stopped", color: "#F24464" },
  { key: "offline", label: "Inactive", color: "#39AEC4" },
] as const;

function statKey(telem: DeviceRow | null): "moving" | "stopped" | "idle" | "offline" {
  if (!telem) return "offline";
  const spd = Number(telem.speedKph ?? 0);
  if (spd > 5) return "moving";
  if (isIgnitionOn(telem)) return "idle";
  if (isRecentlyReporting(telem)) return "idle";
  return "stopped";
}

function isMoving(telem: DeviceRow | null) {
  return Number(telem?.speedKph ?? 0) > 5;
}

function isMotionActive(telem: DeviceRow | null) {
  return isMoving(telem) || isRecentlyReporting(telem);
}

function isIgnitionOn(telem: DeviceRow | null) {
  if (!telem) return false;
  return Boolean(telem.ignition) || isMoving(telem) || isRecentlyReporting(telem);
}

function latestTime(telem: DeviceRow | null) {
  const value = telem?.receivedAt ?? telem?.eventTime ?? telem?.timestamp ?? telem?.updatedAt ?? telem?.lastSeenAt;
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

function isRecentlyReporting(telem: DeviceRow | null) {
  const time = latestTime(telem);
  if (!time) return false;
  return Date.now() - time < 15 * 60 * 1000;
}

function shortName(d: DeviceRow) {
  return String(d.name ?? d.vehiclePlate ?? d.imei ?? "Vehicle");
}

function markerLabel(d: DeviceRow) {
  return shortName(d).replace(/\s+/g, "_");
}

function timeAgo(value?: string | null) {
  if (!value) return "No data yet";
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "No data yet";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours < 24) return mins ? `${hours} hours and ${mins} minutes` : `${hours} hours`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusText(telem: DeviceRow | null) {
  const key = statKey(telem);
  if (key === "moving") return `Moving: ${Math.round(Number(telem?.speedKph ?? 0))} km/h`;
  if (key === "idle") return isRecentlyReporting(telem) ? `Online: ${timeAgo(telem?.receivedAt ?? telem?.eventTime)}` : `Idle: ${timeAgo(telem?.receivedAt ?? telem?.eventTime)}`;
  if (key === "stopped") return `Stopped: ${timeAgo(telem?.receivedAt ?? telem?.eventTime)}`;
  return "Offline";
}

function numberFrom(...values: unknown[]) {
  for (const value of values) {
    if (value == null || value === "") continue;
    const number = Number(String(value).replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(number) && number >= 0) return number;
  }
  return null;
}

function todayDistanceKm(telem: DeviceRow | null, device?: DeviceRow | null) {
  const odometerM = numberFrom(telem?.odometerM, telem?.odometerMeters, telem?.odometer_m);
  if (odometerM && odometerM > 0) return odometerM / 1000;

  const km = numberFrom(telem?.distanceKm, telem?.todayKm, telem?.tripKm, telem?.mileageKm, device?.odometerKm, device?.mileageKm, device?.odometer, device?.mileage);
  if (km && km > 0) return km;

  const meters = numberFrom(telem?.distanceM, telem?.todayDistanceM, telem?.tripDistanceM);
  if (meters && meters > 0) return meters / 1000;

  return isRecentlyReporting(telem) || isMoving(telem) ? 0.5 : 0;
}

function todayDistance(telem: DeviceRow | null, device?: DeviceRow | null) {
  return `${todayDistanceKm(telem, device).toFixed(1)} km`;
}

function batteryVoltage(telem: DeviceRow | null, device?: DeviceRow | null) {
  const voltageMv = numberFrom(telem?.voltageMv, telem?.batteryVoltageMv, telem?.vehicleVoltageMv, telem?.externalVoltageMv, device?.voltageMv, device?.batteryVoltageMv);
  if (voltageMv && voltageMv > 0) return `${(voltageMv / 1000).toFixed(2)} V`;

  const voltage = numberFrom(telem?.voltage, telem?.batteryVoltage, telem?.vehicleVoltage, telem?.externalVoltage, device?.voltage, device?.batteryVoltage);
  if (voltage && voltage > 0) return `${voltage > 100 ? (voltage / 1000).toFixed(2) : voltage.toFixed(2)} V`;

  const batteryPercent = numberFrom(telem?.batteryPercent, telem?.batteryPct, telem?.battery, device?.batteryPercent, device?.batteryPct);
  if (batteryPercent != null) return `${Math.round(batteryPercent)}%`;

  return "Not reported";
}

function ignitionText(telem: DeviceRow | null) {
  return isIgnitionOn(telem) ? "ON" : "OFF";
}

function motionText(telem: DeviceRow | null) {
  if (isMoving(telem)) return "MOVING";
  if (isRecentlyReporting(telem)) return "UPDATING";
  return "STOPPED";
}

function coords(telem: DeviceRow | null) {
  if (telem?.latitude == null || telem?.longitude == null) return "Coordinates unavailable";
  return `(${Number(telem.latitude).toFixed(6)}, ${Number(telem.longitude).toFixed(6)})`;
}

function addressKey(telem: DeviceRow | null) {
  if (telem?.latitude == null || telem?.longitude == null) return null;
  return `${Number(telem.latitude).toFixed(5)},${Number(telem.longitude).toFixed(5)}`;
}

function locationLine(d: DeviceRow, telem: DeviceRow | null, resolvedAddress?: string) {
  return resolvedAddress ?? telem?.address ?? telem?.lastAddress ?? d.currentAddress ?? d.lastAddress ?? coords(telem);
}

function fieldText(...values: unknown[]) {
  for (const value of values) {
    if (value == null || value === "") continue;
    return String(value);
  }
  return "NA";
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function telemetrySocketUrl() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const wsBase = apiBase
    ? apiBase.replace(/^http/, "ws")
    : `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
  return `${wsBase}/ws/websocket`;
}

function parseStompBodies(frame: string) {
  return frame
    .split("\0")
    .map((part) => part.trim())
    .filter((part) => part.startsWith("MESSAGE"))
    .map((part) => {
      const bodyStart = part.indexOf("\n\n");
      if (bodyStart < 0) return null;
      try {
        return JSON.parse(part.slice(bodyStart + 2)) as DeviceRow;
      } catch {
        return null;
      }
    })
    .filter((body): body is DeviceRow => Boolean(body));
}

function mergeTelemetry(previous: DeviceRow | undefined, next: DeviceRow | null) {
  if (!next) return previous;
  if (!previous) return next;
  return {
    ...previous,
    ...next,
    latitude: next.latitude ?? previous.latitude,
    longitude: next.longitude ?? previous.longitude,
    altitudeM: next.altitudeM ?? previous.altitudeM,
    speedKph: next.speedKph ?? previous.speedKph,
    headingDeg: next.headingDeg ?? previous.headingDeg,
    accuracyM: next.accuracyM ?? previous.accuracyM,
    satellites: next.satellites ?? previous.satellites,
    voltageMv: next.voltageMv ?? previous.voltageMv,
    batteryVoltageMv: next.batteryVoltageMv ?? previous.batteryVoltageMv,
    vehicleVoltageMv: next.vehicleVoltageMv ?? previous.vehicleVoltageMv,
    externalVoltageMv: next.externalVoltageMv ?? previous.externalVoltageMv,
    voltage: next.voltage ?? previous.voltage,
    batteryVoltage: next.batteryVoltage ?? previous.batteryVoltage,
    vehicleVoltage: next.vehicleVoltage ?? previous.vehicleVoltage,
    externalVoltage: next.externalVoltage ?? previous.externalVoltage,
    batteryPercent: next.batteryPercent ?? previous.batteryPercent,
    batteryPct: next.batteryPct ?? previous.batteryPct,
    battery: next.battery ?? previous.battery,
    gsmSignal: next.gsmSignal ?? previous.gsmSignal,
  };
}

function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg px-5 py-3 text-sm font-medium text-white shadow-xl" style={{ background: "#061337" }}>
      {msg}
      <button onClick={onDone} aria-label="Close notification">
        <FiX size={14} />
      </button>
    </div>
  );
}

function ActionIcon({ children, label, onClick }: { children: React.ReactNode; label: string; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-5 w-5 place-items-center rounded-md text-[#536987] transition hover:bg-[#eef4f8]"
    >
      {children}
    </button>
  );
}

function MetricBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex h-[76px] min-w-0 flex-1 flex-col items-center justify-center rounded-lg border border-[#d5e2ec] bg-white px-1.5 text-center text-[#061337]">
      <div className="text-[11px] font-extrabold leading-tight">{value}</div>
      <div className="mt-1 text-[10px] font-medium leading-tight">{label}</div>
    </div>
  );
}

function VehicleStatusSummary({
  counts,
  active,
  onChange,
}: {
  counts: Record<(typeof STATUS_FILTERS)[number]["key"], number>;
  active: (typeof STATUS_FILTERS)[number]["key"];
  onChange: (key: (typeof STATUS_FILTERS)[number]["key"]) => void;
}) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STATUS_FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={`min-w-[82px] rounded-lg px-3 py-2 text-center text-white shadow-sm transition ${
              active === item.key ? "ring-2 ring-[#061337]/15" : "hover:brightness-105"
            }`}
            style={{ background: item.color }}
          >
            <div className="text-2xl font-extrabold leading-none">{counts[item.key]}</div>
            <div className="mt-1 text-[11px] font-bold leading-none">{item.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function LiveTabPanel({
  tab,
  rows,
  loading,
}: {
  tab: string;
  rows: LiveTabRow[];
  loading: boolean;
}) {
  if (loading) {
    return <div className="rounded-xl bg-white p-3.5 text-[11px] text-[#536987] shadow-[0_14px_32px_rgba(15,23,42,0.07)]">Loading {tab.toLowerCase()}...</div>;
  }

  if (rows.length === 0) {
    return <div className="rounded-xl bg-white p-3.5 text-[11px] text-[#536987] shadow-[0_14px_32px_rgba(15,23,42,0.07)]">No live {tab.toLowerCase()} records yet.</div>;
  }

  if (tab === "Notifications") {
    return (
      <div className="space-y-2">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.07)]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-[13px] font-extrabold text-[#061337]">{fieldText(row.alertType, "Alert")}</div>
                <div className="mt-1 text-[11px] leading-snug text-[#536987]">{fieldText(row.message, row.relatedGeofenceName, "Vehicle notification")}</div>
              </div>
              <span className="rounded-full bg-[#fff1f3] px-2 py-1 text-[10px] font-bold text-[#f24464]">{fieldText(row.severity, "INFO")}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-[#94a3b8]">
              <span>{formatDateTime(row.alertTime ?? row.receivedAt)}</span>
              <span>{row.acknowledged ? "Acknowledged" : "New"}</span>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (tab === "History") {
    return (
      <div className="space-y-2">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.07)]">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 text-[13px] font-extrabold text-[#061337]">{fieldText(row.imei, row.deviceId)}</div>
              <span className="rounded-full bg-[#ecfdf3] px-2 py-1 text-[10px] font-bold text-[#16a34a]">{Math.round(Number(row.speedKph ?? 0))} km/h</span>
            </div>
            <div className="mt-1 text-[11px] text-[#536987]">{coords(row)}</div>
            <div className="mt-2 text-[10px] font-semibold text-[#94a3b8]">{formatDateTime(row.eventTime ?? row.receivedAt)}</div>
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <article key={row.id} className="rounded-xl bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.07)]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-extrabold text-[#061337]">{fieldText(row.name, tab)}</div>
              <div className="mt-1 text-[11px] leading-snug text-[#536987]">{fieldText(row.location, row.category, row.geofenceType)}</div>
            </div>
            <span className="rounded-full bg-[#eef7ff] px-2 py-1 text-[10px] font-bold text-[#2563eb]">{fieldText(row.geofenceType, "Zone")}</span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-semibold text-[#536987]">
            <span>Lat: {row.centerLat ?? "--"}</span>
            <span>Lng: {row.centerLng ?? "--"}</span>
            <span>Radius: {row.radiusM != null ? `${Math.round(Number(row.radiusM))} m` : "--"}</span>
            <span>{row.active ? "Active" : "Inactive"}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function AllVehiclesPage() {
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [telemetry, setTelemetry] = useState<Record<string, DeviceRow>>({});
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState("streets");
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [vehiclePanelOpen, setVehiclePanelOpen] = useState(true);
  const [activeStatus, setActiveStatus] = useState<(typeof STATUS_FILTERS)[number]["key"]>("all");
  const [activePanelTab, setActivePanelTab] = useState("Objects");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [tabRows, setTabRows] = useState<LiveTabRow[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  const notify = (msg: string) => setToast(msg);

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch("/api/devices");
      if (res.ok) {
        const data = await res.json();
        const list: DeviceRow[] = Array.isArray(data) ? data : data?.content ?? [];
        setDevices(list);
        setSelected((prev) => {
          if (prev && list.some((d) => d.id === prev)) return prev;
          return null;
        });

        const telemResults = await Promise.allSettled(
          list.map((d) => fetch(`/api/telemetry?type=latest&deviceId=${d.id}`).then((r) => (r.ok && r.status !== 204 ? r.json() : null)))
        );
        const telemMap: Record<string, DeviceRow | null> = {};
        telemResults.forEach((r, i) => {
          if (r.status === "fulfilled" && r.value) telemMap[list[i].id] = r.value;
        });
        setTelemetry((prev) => {
          const next: Record<string, DeviceRow> = {};
          Object.entries(telemMap).forEach(([deviceId, value]) => {
            const merged = mergeTelemetry(prev[deviceId], value);
            if (merged) next[deviceId] = merged;
          });
          return next;
        });
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  useEffect(() => {
    const interval = setInterval(() => {
      load(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (devices.length === 0) return;
      const telemResults = await Promise.allSettled(
        devices.map((d) => fetch(`/api/telemetry?type=latest&deviceId=${d.id}`).then((r) => (r.ok && r.status !== 204 ? r.json() : null)))
      );
      const telemMap: Record<string, DeviceRow> = {};
      telemResults.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value) telemMap[devices[i].id] = mergeTelemetry(telemetry[devices[i].id], r.value) ?? r.value;
      });
      setTelemetry((prev) => ({ ...prev, ...telemMap }));
    }, 5000);
    return () => clearInterval(interval);
  }, [devices, telemetry]);

  useEffect(() => {
    if (devices.length === 0) return;
    let closed = false;
    let reconnectId: number | null = null;
    let socket: WebSocket | null = null;
    const deviceIds = new Set(devices.map((d) => String(d.id)));

    function connect() {
      if (closed) return;
      let stompBuffer = "";
      try {
        socket = new WebSocket(telemetrySocketUrl());
      } catch {
        reconnectId = window.setTimeout(connect, 5000);
        return;
      }

      socket.onopen = () => {
        socket?.send("CONNECT\naccept-version:1.2\nheart-beat:0,0\n\n\0");
      };
      socket.onmessage = (event) => {
        stompBuffer += String(event.data);
        if (stompBuffer.includes("CONNECTED")) {
          socket?.send("SUBSCRIBE\nid:sub-live-telemetry\ndestination:/topic/telemetry\n\n\0");
        }
        parseStompBodies(stompBuffer).forEach((payload) => {
          const deviceId = String(payload.deviceId ?? "");
          if (!deviceIds.has(deviceId)) return;
          setTelemetry((prev) => ({ ...prev, [deviceId]: mergeTelemetry(prev[deviceId], payload) ?? payload }));
        });
        if (stompBuffer.includes("\0")) stompBuffer = "";
      };
      socket.onclose = () => {
        if (!closed) reconnectId = window.setTimeout(connect, 5000);
      };
      socket.onerror = () => {
        socket?.close();
      };
    }

    connect();
    return () => {
      closed = true;
      if (reconnectId !== null) window.clearTimeout(reconnectId);
      socket?.close();
    };
  }, [devices]);

  useEffect(() => {
    if (activePanelTab === "Objects") {
      setTabRows([]);
      setTabLoading(false);
      return;
    }

    let cancelled = false;
    const loadTab = async (showSpinner = false) => {
      if (showSpinner) setTabLoading(true);
      try {
        const params = new URLSearchParams({
          tab: activePanelTab.toLowerCase(),
          limit: activePanelTab === "History" ? "80" : "50",
        });
        if (selected) params.set("deviceId", selected);
        const res = await fetch(`/api/live-tracking?${params}`, { cache: "no-store" });
        const data = res.ok ? await res.json() : [];
        if (!cancelled) setTabRows(Array.isArray(data) ? data : []);
      } finally {
        if (!cancelled && showSpinner) setTabLoading(false);
      }
    };

    loadTab(true);
    const interval = setInterval(() => loadTab(false), 10000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [activePanelTab, selected]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    const pending = devices
      .map((d) => {
        const t = telemetry[d.id] ?? null;
        const key = addressKey(t);
        return key && !addresses[key] ? { key, lat: Number(t?.latitude), lng: Number(t?.longitude) } : null;
      })
      .filter((item): item is { key: string; lat: number; lng: number } => Boolean(item));

    if (pending.length === 0) return;

    let cancelled = false;
    pending.slice(0, 6).forEach(async ({ key, lat, lng }) => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address,poi,place,locality,neighborhood&limit=1`,
          { cache: "force-cache" }
        );
        const data = await res.json();
        const place = data?.features?.[0]?.place_name;
        if (!cancelled && place) {
          setAddresses((prev) => (prev[key] ? prev : { ...prev, [key]: place }));
        }
      } catch {
        // Keep coordinate fallback when reverse geocoding is unavailable.
      }
    });

    return () => {
      cancelled = true;
    };
  }, [addresses, devices, telemetry]);

  const handleRefresh = async (e: React.MouseEvent, deviceId: string, name: string) => {
    e.stopPropagation();
    setRefreshing(deviceId);
    try {
      const res = await fetch(`/api/telemetry?type=latest&deviceId=${deviceId}`);
      if (res.ok && res.status !== 204) {
        const t = await res.json();
        setTelemetry((prev) => ({ ...prev, [deviceId]: mergeTelemetry(prev[deviceId], t) ?? t }));
        notify(`Location refreshed for ${name}`);
      }
    } finally {
      setRefreshing(null);
    }
  };

  const handleShare = (e: React.MouseEvent, d: DeviceRow) => {
    e.stopPropagation();
    const t = telemetry[d.id];
    const text = `${shortName(d)}\n${coords(t ?? null)}\nSpeed: ${Math.round(Number(t?.speedKph ?? 0))} km/h`;
    if (navigator.share) navigator.share({ title: shortName(d), text }).catch(() => {});
    else navigator.clipboard.writeText(text).then(() => notify(`Info copied for ${shortName(d)}`));
  };

  const copyCoordinates = (e: React.MouseEvent, telem: DeviceRow | null) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coords(telem)).then(() => notify("Coordinates copied"));
  };

  const selectedDevice = selected ? devices.find((d) => d.id === selected) ?? null : null;

  const statusCounts = useMemo(() => {
    const counts = { all: devices.length, moving: 0, idle: 0, stopped: 0, offline: 0 };
    devices.forEach((d) => {
      counts[statKey(telemetry[d.id] ?? null)] += 1;
    });
    return counts;
  }, [devices, telemetry]);

  const visibleDevices = useMemo(() => {
    const query = vehicleSearch.trim().toLowerCase();
    return devices.filter((d) => {
      const telem = telemetry[d.id] ?? null;
      const statusMatches = activeStatus === "all" || statKey(telem) === activeStatus;
      if (!statusMatches) return false;
      if (!query) return true;
      const haystack = [
        d.name,
        d.vehiclePlate,
        d.plateNumber,
        d.imei,
        d.driverName,
        d.ownerName,
        d.simNumber,
        telem?.address,
        telem?.lastAddress,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [activeStatus, devices, telemetry, vehicleSearch]);

  const markers: MarkerData[] = useMemo(
    () =>
      devices
        .filter((d) => {
          const t = telemetry[d.id];
          return t?.latitude != null && t?.longitude != null;
        })
        .map((d) => {
          const t = telemetry[d.id];
          const key = statKey(t ?? null);
          const motionActive = isMotionActive(t ?? null);
          const ignitionOn = isIgnitionOn(t ?? null);
          const title = shortName(d);
          const location = locationLine(d, t ?? null, addresses[addressKey(t ?? null) ?? ""]);
          const coordinateText = coords(t ?? null);
          return {
            id: d.id,
            lat: t.latitude,
            lng: t.longitude,
            color: STATUS_COLOR[key],
            pulsing: motionActive,
            heading: Number(t.headingDeg ?? 35),
            ignition: ignitionOn,
            moving: motionActive,
            motionLabel: motionText(t ?? null),
            objectIcon: d.objectIcon ?? d.icon ?? d.assetIcon ?? d.vehicleType,
            label: markerLabel(d),
            popupHtml: `
              <div class="tp-popup-inner">
                <div class="tp-popup-title">${escapeHtml(title)} <span>-></span></div>
                <div class="tp-popup-status">
                  <strong>${escapeHtml(statusText(t ?? null))}</strong>
                  <span>| Today: ${escapeHtml(todayDistance(t ?? null, d))}</span>
                </div>
                <div class="tp-popup-muted">Last data received ${escapeHtml(timeAgo(t.receivedAt ?? t.eventTime))}</div>
                <div class="tp-popup-location">${escapeHtml(location)}</div>
                <div class="tp-popup-coords">${escapeHtml(coordinateText)} <span>□</span></div>
                <div class="tp-popup-row">Trip: <strong>${escapeHtml(d.tripName ?? "Not Assigned")}</strong></div>
                <div class="tp-popup-row">Consigner: <strong>${escapeHtml(d.consignerName ?? "Not Assigned")}</strong></div>
                <div class="tp-popup-row">Driver: <strong>${escapeHtml(fieldText(d.driverName, d.ownerName, d.driverPhone, d.mobileNumber, "Not Assigned"))}</strong></div>
                <div class="tp-popup-actions">
                  <span>⌯</span><span>◉</span><span>⇄</span><span>▱</span><span>▣</span><span>▤</span><span>◯</span><span>☷</span>
                </div>
              </div>
            `,
          };
        }),
    [addresses, devices, telemetry]
  );

  return (
    <div className="flex h-full min-h-[720px] overflow-hidden bg-[#eef3f7] text-[#061337]">
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <aside className={`flex max-w-[100vw] flex-shrink-0 overflow-hidden border-r border-[#cfdae5] bg-[#f2f7fa] transition-all duration-200 md:max-w-[390px] ${vehiclePanelOpen ? "w-[min(390px,100vw)] md:w-[390px]" : "w-0 border-r-0"}`}>
        <div className="flex w-[min(390px,100vw)] min-w-[min(390px,100vw)] flex-none flex-col md:w-[390px] md:min-w-[390px]">
          <div className="border-b border-[#dbe5ee] bg-[#f5f8fb] px-2.5 py-2.5">
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#061337]">All Vehicles</div>
                <div className="text-[11px] font-medium text-[#536987]">
                  {loading ? "Loading..." : `${devices.length} Vehicle${devices.length === 1 ? "" : "s"}`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVehiclePanelOpen(false)}
                className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-white text-[#536987] shadow-sm transition hover:bg-[#eef4f8]"
                aria-label="Collapse vehicle list"
                title="Collapse vehicle list"
              >
                <FiChevronRight size={18} className="rotate-180" />
              </button>
            </div>

            <VehicleStatusSummary counts={statusCounts} active={activeStatus} onChange={setActiveStatus} />

            <div className="mt-1.5 flex overflow-x-auto bg-[#f8fafc] text-[12px] font-semibold text-[#2b2f36] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {VEHICLE_PANEL_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActivePanelTab(tab)}
                  className={`min-w-max px-3 py-2 transition ${
                    activePanelTab === tab ? "bg-white text-[#061337] shadow-sm" : "text-[#2b2f36] hover:bg-white/70"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-[88px_1fr] gap-2">
              <select
                value={activeStatus}
                onChange={(e) => setActiveStatus(e.target.value as (typeof STATUS_FILTERS)[number]["key"])}
                className="h-10 rounded-lg border border-[#d5e2ec] bg-white px-2 text-[13px] font-extrabold text-[#111827] outline-none focus:border-[#33a46f]"
                aria-label="Vehicle status filter"
              >
                {STATUS_FILTERS.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label === "All" ? "Device" : item.label}
                  </option>
                ))}
              </select>

              <div className="relative">
                <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                <input
                  value={vehicleSearch}
                  onChange={(e) => setVehicleSearch(e.target.value)}
                  placeholder="Search Vehicle"
                  className="h-10 w-full rounded-lg border border-[#d5e2ec] bg-white pl-9 pr-3 text-[13px] font-medium text-[#061337] outline-none focus:border-[#33a46f]"
                />
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="text-[12px] font-medium text-[#536987]">
                {loading ? "Loading vehicles..." : `Showing ${visibleDevices.length} of ${devices.length} vehicles`}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => load(true)}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[#f24464] shadow-sm transition hover:bg-[#fff1f3]"
                  aria-label="Refresh vehicles"
                  title="Refresh vehicles"
                >
                  <FiRefreshCw size={17} />
                </button>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[#f24464] shadow-sm transition hover:bg-[#fff1f3]"
                  aria-label="Vehicle list"
                  title="Vehicle list"
                >
                  <FiClipboard size={17} />
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3.5 pt-2 sm:px-3.5">
            {activePanelTab !== "Objects" ? (
              <LiveTabPanel tab={activePanelTab} rows={tabRows} loading={tabLoading} />
            ) : loading ? (
              <div className="rounded-xl bg-white p-3.5 text-[11px] text-[#536987] shadow-[0_14px_32px_rgba(15,23,42,0.07)]">Loading vehicles...</div>
            ) : devices.length === 0 ? (
              <div className="rounded-xl bg-white p-3.5 text-[11px] text-[#536987] shadow-[0_14px_32px_rgba(15,23,42,0.07)]">No vehicles registered yet.</div>
            ) : visibleDevices.length === 0 ? (
              <div className="rounded-xl bg-white p-3.5 text-[11px] text-[#536987] shadow-[0_14px_32px_rgba(15,23,42,0.07)]">No vehicles match this filter.</div>
            ) : (
              visibleDevices.map((d) => {
                const t = telemetry[d.id] ?? null;
                const key = statKey(t);
                const location = locationLine(d, t, addresses[addressKey(t) ?? ""]);
                const isSelected = d.id === selected;
                const isRef = refreshing === d.id;
                const statusLabel =
                  key === "moving"
                    ? `Moving: ${timeAgo(t?.receivedAt ?? t?.eventTime)}`
                    : key === "idle"
                      ? `Online: ${timeAgo(t?.receivedAt ?? t?.eventTime)}`
                      : key === "stopped"
                        ? `Stopped: ${timeAgo(t?.receivedAt ?? t?.eventTime)}`
                        : "Offline";
                return (
                  <article
                    key={d.id}
                    onClick={() => {
                      setSelected(d.id);
                    }}
                    className={`mb-3 rounded-xl bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.07)] transition ${
                      isSelected ? "ring-2 ring-[#d7e4ee]" : "hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <FiCamera size={17} className="flex-shrink-0 text-[#536987]" />
                        <h2 className="min-w-0 truncate text-[15px] font-extrabold leading-tight tracking-tight text-[#061337]">{shortName(d)}</h2>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1.5">
                        <ActionIcon label="Share" onClick={(e) => handleShare(e, d)}>
                          <FiShare2 size={14} />
                        </ActionIcon>
                        <ActionIcon label="Driver">
                          <FiUser size={14} />
                        </ActionIcon>
                        <ActionIcon label="Route">
                          <FiNavigation size={14} />
                        </ActionIcon>
                        <ActionIcon label="Vehicle">
                          <FiTruck size={15} />
                        </ActionIcon>
                        <ActionIcon label="Camera">
                          <FiCamera size={15} />
                        </ActionIcon>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-semibold">
                      <span style={{ color: STATUS_COLOR[key] }}>{statusLabel}</span>
                      <span className="text-[#536987]">| Today: <strong>{todayDistance(t, d)}</strong></span>
                    </div>

                    <div className="mt-1.5 text-[11px] font-medium text-[#536987]">Last data received {timeAgo(t?.receivedAt ?? t?.eventTime)}</div>

                    <div className="mt-3 flex items-center gap-2">
                      <FiMapPin size={20} className="flex-shrink-0 text-[#061337]" />
                      <div className="min-w-0 truncate text-[13px] font-medium leading-snug text-[#061337]" title={location}>{location}</div>
                    </div>

                    <div className="mt-3 flex items-stretch gap-2">
                      <MetricBox value={ignitionText(t)} label="Ignition" />
                      <MetricBox value={`${Math.round(Number(t?.speedKph ?? 0))} km/h`} label="Speed" />
                      <MetricBox value={batteryVoltage(t, d)} label="Vehicle Battery Voltage" />
                      <button
                        type="button"
                        onClick={(e) => handleRefresh(e, d.id, shortName(d))}
                        className="grid h-[76px] w-8 flex-shrink-0 place-items-center rounded-lg text-[#061337] transition hover:bg-[#eef4f8]"
                        aria-label="Refresh vehicle"
                      >
                        <FiChevronRight size={20} className={isRef ? "animate-spin" : ""} />
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </aside>

      <main className="relative min-w-0 flex-1 overflow-hidden">
        {!vehiclePanelOpen && (
          <button
            type="button"
            onClick={() => setVehiclePanelOpen(true)}
            className="absolute left-3 top-4 z-20 flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#061337] shadow-lg transition hover:bg-[#eef4f8]"
            aria-label="Open vehicle list"
            title="Open vehicle list"
          >
            <FiTruck size={16} />
            <span>Vehicles</span>
            <span className="rounded-full bg-[#eef4f8] px-1.5 py-0.5 text-[10px]">{loading ? "..." : devices.length}</span>
          </button>
        )}

        <MapboxMap
          markers={markers}
          flyToId={selected ?? ""}
          center={[9.082, 8.675]}
          zoom={markers.length > 0 ? 10 : 5}
          style={MAP_STYLES.find((s) => s.id === mapStyle)?.style || "mapbox://styles/mapbox/streets-v12"}
          className="h-full w-full"
          onMarkerClick={setSelected}
        />

        <div className="absolute bottom-20 right-5 z-10">
          <div className="relative">
            <button
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="flex items-center gap-2 rounded-lg bg-[#061337] px-3 py-2 text-sm font-semibold text-white shadow-xl transition-all hover:brightness-110"
            >
              <FiLayers size={16} />
              <span>{MAP_STYLES.find((s) => s.id === mapStyle)?.label || "Streets"}</span>
            </button>
            {showStyleMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-40 overflow-hidden rounded-lg border border-[#d5e2ec] bg-white shadow-xl">
                {MAP_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setMapStyle(style.id);
                      setShowStyleMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[#eef4f8]"
                    style={{ color: mapStyle === style.id ? "#061337" : "#536987", fontWeight: mapStyle === style.id ? 700 : 500 }}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-4 rounded-lg bg-white px-4 py-2 text-[#536987] shadow-xl">
          <FiShare2 size={17} />
          <FiUser size={17} />
          <FiNavigation size={17} />
          <FiTruck size={17} />
          <FiPackage size={17} />
          <FiDatabase size={17} />
          <FiMessageCircle size={17} />
          <FiClipboard size={17} />
        </div>

        <button
          type="button"
          onClick={(e) => copyCoordinates(e, selectedDevice ? telemetry[selectedDevice.id] ?? null : null)}
          className="absolute bottom-5 right-5 z-10 grid h-11 w-11 place-items-center rounded-lg bg-white text-[#536987] shadow-xl"
          aria-label="Copy coordinates"
        >
          <FiCopy size={22} />
        </button>
      </main>
    </div>
  );
}

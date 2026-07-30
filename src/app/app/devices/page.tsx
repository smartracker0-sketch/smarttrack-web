"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  FiChevronRight,
  FiClipboard,
  FiCopy,
  FiDatabase,
  FiLayers,
  FiMapPin,
  FiMessageCircle,
  FiNavigation,
  FiPackage,
  FiShare2,
  FiTruck,
  FiUser,
  FiX,
} from "react-icons/fi";
import type { MarkerData } from "@/components/MapboxMap";

const MapboxMap = dynamic(() => import("@/components/MapboxMap"), { ssr: false });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DeviceRow = Record<string, any>;

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

function todayDistance(telem: DeviceRow | null, device?: DeviceRow | null) {
  const odometerM = numberFrom(telem?.odometerM, telem?.odometerMeters, telem?.odometer_m);
  if (odometerM && odometerM > 0) return `${(odometerM / 1000).toFixed(1)} km`;

  const km = numberFrom(telem?.distanceKm, telem?.todayKm, telem?.tripKm, telem?.mileageKm, device?.odometerKm, device?.mileageKm, device?.odometer, device?.mileage);
  if (km && km > 0) return `${km.toFixed(1)} km`;

  const meters = numberFrom(telem?.distanceM, telem?.todayDistanceM, telem?.tripDistanceM);
  if (meters && meters > 0) return `${(meters / 1000).toFixed(1)} km`;

  return "0.0 km";
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
  return isMoving(telem) ? "MOVING" : "STOPPED";
}

function IndicatorPill({ active, label, value }: { active: boolean; label: string; value: string }) {
  return (
    <div className="flex min-h-[28px] items-center gap-1.5 rounded-full border border-[#d5e2ec] bg-white px-2.5 text-[#061337]">
      <span className="h-2 w-2 rounded-full" style={{ background: active ? "#22C55E" : "#94A3B8" }} />
      <span className="text-[9px] font-semibold text-[#536987]">{label}</span>
      <strong className="text-[10px]">{value}</strong>
    </div>
  );
}

function coords(telem: DeviceRow | null) {
  if (telem?.latitude == null || telem?.longitude == null) return "Coordinates unavailable";
  return `(${Number(telem.latitude).toFixed(6)}, ${Number(telem.longitude).toFixed(6)})`;
}

function locationLine(d: DeviceRow, telem: DeviceRow | null) {
  return d.address ?? d.lastAddress ?? d.vehiclePlate ?? coords(telem);
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
    <div className="flex min-h-[43px] min-w-[53px] flex-col items-center justify-center rounded-lg border border-[#d5e2ec] bg-white px-1.5 text-center text-[#061337]">
      <div className="text-[11px] font-extrabold">{value}</div>
      <div className="mt-0.5 text-[9px] font-medium leading-tight">{label}</div>
    </div>
  );
}

export default function AllVehiclesPage() {
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [telemetry, setTelemetry] = useState<Record<string, DeviceRow>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState("streets");
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [vehiclePanelOpen, setVehiclePanelOpen] = useState(false);

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
          return list[0]?.id ?? null;
        });

        const telemResults = await Promise.allSettled(
          list.map((d) => fetch(`/api/telemetry?type=latest&deviceId=${d.id}`).then((r) => (r.ok && r.status !== 204 ? r.json() : null)))
        );
        const telemMap: Record<string, DeviceRow> = {};
        telemResults.forEach((r, i) => {
          if (r.status === "fulfilled" && r.value) telemMap[list[i].id] = r.value;
        });
        setTelemetry(telemMap);
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
        if (r.status === "fulfilled" && r.value) telemMap[devices[i].id] = r.value;
      });
      setTelemetry(telemMap);
    }, 5000);
    return () => clearInterval(interval);
  }, [devices]);

  const handleRefresh = async (e: React.MouseEvent, deviceId: string, name: string) => {
    e.stopPropagation();
    setRefreshing(deviceId);
    try {
      const res = await fetch(`/api/telemetry?type=latest&deviceId=${deviceId}`);
      if (res.ok && res.status !== 204) {
        const t = await res.json();
        setTelemetry((prev) => ({ ...prev, [deviceId]: t }));
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

  const selectedDevice = devices.find((d) => d.id === selected) ?? devices[0] ?? null;

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
          const moving = isMoving(t ?? null);
          const ignitionOn = isIgnitionOn(t ?? null);
          const title = shortName(d);
          const location = locationLine(d, t ?? null);
          const coordinateText = coords(t ?? null);
          return {
            id: d.id,
            lat: t.latitude,
            lng: t.longitude,
            color: STATUS_COLOR[key],
            pulsing: moving,
            heading: Number(t.headingDeg ?? 35),
            ignition: ignitionOn,
            moving,
            label: markerLabel(d),
            popupHtml: `
              <div class="tp-popup-inner">
                <div class="tp-popup-title">${escapeHtml(title)} <span>-></span></div>
                <div class="tp-popup-status">
                  <strong>${escapeHtml(statusText(t ?? null))}</strong>
                  <span>| Today: ${escapeHtml(todayDistance(t ?? null, d))}</span>
                </div>
                <div class="tp-popup-indicators">
                  <span class="${ignitionOn ? "is-on" : ""}">Ignition: ${escapeHtml(ignitionText(t ?? null))}</span>
                  <span class="${moving ? "is-on" : ""}">Motion: ${escapeHtml(motionText(t ?? null))}</span>
                </div>
                <div class="tp-popup-muted">Last data received ${escapeHtml(timeAgo(t.receivedAt ?? t.eventTime))}</div>
                <div class="tp-popup-location">${escapeHtml(location)}</div>
                <div class="tp-popup-coords">${escapeHtml(coordinateText)} <span>□</span></div>
                <div class="tp-popup-row">Trip: <strong>${escapeHtml(d.tripName ?? "Not Assigned")}</strong></div>
                <div class="tp-popup-row">Consigner: <strong>${escapeHtml(d.consignerName ?? "Not Assigned")}</strong></div>
                <div class="tp-popup-row">Driver: <strong>${escapeHtml(d.driverName ?? d.ownerName ?? "Not Assigned")}</strong></div>
                <div class="tp-popup-actions">
                  <span>⌯</span><span>♙</span><span>⇄</span><span>▱</span><span>▣</span><span>▤</span><span>◯</span><span>☷</span>
                </div>
              </div>
            `,
          };
        }),
    [devices, telemetry]
  );

  return (
    <div className="flex h-full min-h-[720px] overflow-hidden bg-[#eef3f7] text-[#061337]">
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}

      <aside className={`group flex max-w-[100vw] flex-shrink-0 overflow-hidden border-r border-[#cfdae5] bg-[#f2f7fa] transition-all duration-200 md:max-w-[390px] md:hover:w-[390px] ${vehiclePanelOpen ? "w-[min(390px,100vw)]" : "w-14"}`}>
        <button
          type="button"
          onClick={() => setVehiclePanelOpen((open) => !open)}
          className="flex w-14 flex-shrink-0 flex-col items-center border-r border-[#dbe5ee] py-3.5"
          aria-expanded={vehiclePanelOpen}
          aria-label={vehiclePanelOpen ? "Close all vehicles" : "Open all vehicles"}
        >
          <FiTruck size={20} className="text-[#536987]" />
          <div className="mt-2.5 grid h-5 min-w-5 place-items-center rounded-full bg-white px-1.5 text-[10px] font-bold text-[#061337] shadow-sm">
            {loading ? "..." : devices.length}
          </div>
        </button>

        <div className={`flex w-[calc(min(390px,100vw)-56px)] min-w-[calc(min(390px,100vw)-56px)] flex-none flex-col transition-opacity duration-150 md:w-[334px] md:min-w-[334px] md:group-hover:opacity-100 ${vehiclePanelOpen ? "opacity-100" : "opacity-0"}`}>
          <div className="px-3.5 py-3">
            <div className="text-[13px] font-medium text-[#536987]">
              All Vehicles : {loading ? "..." : `${devices.length} Vehicle${devices.length === 1 ? "" : "s"}`}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3.5 sm:px-3.5">
            {loading ? (
              <div className="rounded-xl bg-white p-3.5 text-[11px] text-[#536987] shadow-[0_14px_32px_rgba(15,23,42,0.07)]">Loading vehicles...</div>
            ) : devices.length === 0 ? (
              <div className="rounded-xl bg-white p-3.5 text-[11px] text-[#536987] shadow-[0_14px_32px_rgba(15,23,42,0.07)]">No vehicles registered yet.</div>
            ) : (
              devices.map((d) => {
                const t = telemetry[d.id] ?? null;
                const key = statKey(t);
                const moving = isMoving(t);
                const ignitionOn = isIgnitionOn(t);
                const isSelected = d.id === selected;
                const isRef = refreshing === d.id;
                return (
                  <article
                    key={d.id}
                    onClick={() => {
                      setSelected(d.id);
                      if (typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches) {
                        setVehiclePanelOpen(false);
                      }
                    }}
                    className={`mb-2 rounded-xl bg-white p-2.5 shadow-[0_12px_28px_rgba(15,23,42,0.07)] transition ${
                      isSelected ? "ring-2 ring-[#d7e4ee]" : "hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="min-w-0 truncate text-base font-extrabold leading-tight tracking-tight text-[#061337]">{shortName(d)}</h2>
                      <div className="flex flex-shrink-0 items-center gap-1">
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
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-semibold">
                      <span style={{ color: STATUS_COLOR[key] }}>{statusText(t)}</span>
                      <span className="text-[#536987]">| Today: <strong>{todayDistance(t, d)}</strong></span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <IndicatorPill active={ignitionOn} label="Ignition" value={ignitionText(t)} />
                      <IndicatorPill active={moving} label="Motion" value={motionText(t)} />
                    </div>

                    <div className="mt-1 text-xs font-medium text-[#536987]">Last data received {timeAgo(t?.receivedAt ?? t?.eventTime)}</div>

                    <div className="mt-2.5 flex items-start gap-1.5">
                      <FiMapPin size={18} className="mt-0.5 flex-shrink-0 text-[#061337]" />
                      <div className="min-w-0 truncate text-[13px] font-medium text-[#061337]">{locationLine(d, t)}</div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-stretch gap-1.5">
                      <MetricBox value={`${Math.round(Number(t?.speedKph ?? 0))} km/h`} label="Speed" />
                      <MetricBox value={batteryVoltage(t, d)} label="Vehicle Battery" />
                      <button
                        type="button"
                        onClick={(e) => handleRefresh(e, d.id, shortName(d))}
                        className="grid min-h-[43px] w-6 place-items-center rounded-lg text-[#061337] transition hover:bg-[#eef4f8]"
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
        <MapboxMap
          markers={markers}
          flyToId={selected ?? ""}
          center={[9.082, 8.675]}
          zoom={markers.length > 0 ? 10 : 5}
          style={MAP_STYLES.find((s) => s.id === mapStyle)?.style || "mapbox://styles/mapbox/streets-v12"}
          className="h-full w-full"
          onMarkerClick={setSelected}
        />

        {selectedDevice && (
          <div className="pointer-events-none absolute left-6 top-6 z-10 rounded-lg bg-white/95 px-4 py-3 text-sm font-bold text-[#061337] shadow-lg">
            {shortName(selectedDevice)}
          </div>
        )}

        <div className="absolute right-4 top-4 z-10">
          <div className="relative">
            <button
              onClick={() => setShowStyleMenu(!showStyleMenu)}
              className="flex items-center gap-2 rounded-lg bg-[#061337] px-3 py-2 text-sm font-semibold text-white shadow transition-all hover:brightness-110"
            >
              <FiLayers size={16} />
              <span>{MAP_STYLES.find((s) => s.id === mapStyle)?.label || "Streets"}</span>
            </button>
            {showStyleMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 overflow-hidden rounded-lg border border-[#d5e2ec] bg-white shadow-xl">
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

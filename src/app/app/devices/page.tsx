"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  FiBattery,
  FiChevronRight,
  FiClipboard,
  FiCopy,
  FiDatabase,
  FiFlag,
  FiInfo,
  FiLayers,
  FiLock,
  FiMapPin,
  FiMessageCircle,
  FiNavigation,
  FiPackage,
  FiPower,
  FiRefreshCw,
  FiSearch,
  FiShare2,
  FiTruck,
  FiUser,
  FiX,
} from "react-icons/fi";
import type { MarkerData } from "@/components/MapboxMap";
import { objectIconSvg } from "@/lib/objectIcons";

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

function durationText(...values: unknown[]) {
  const direct = values.find((value) => typeof value === "string" && value.trim());
  if (direct) return String(direct);
  const minutes = numberFrom(...values);
  if (minutes == null) return "--";
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")} hrs`;
}

function minutesSinceLatest(telem: DeviceRow | null) {
  const time = latestTime(telem);
  if (!time) return null;
  return Math.max(0, Math.floor((Date.now() - time) / 60000));
}

function activityDuration(
  kind: "running" | "idle" | "stop" | "inactive",
  telem: DeviceRow | null,
  device: DeviceRow
) {
  const direct =
    kind === "running"
      ? durationText(telem?.runningDuration, telem?.runningTime, device.runningDuration, device.runningTime)
      : kind === "idle"
        ? durationText(telem?.idleDuration, telem?.idleTime, device.idleDuration, device.idleTime)
        : kind === "stop"
          ? durationText(telem?.stoppedDuration, telem?.stopDuration, telem?.stoppedTime, device.stoppedDuration, device.stopDuration, device.stoppedTime)
          : durationText(telem?.inactiveDuration, telem?.inactiveTime, device.inactiveDuration, device.inactiveTime);
  if (direct !== "--") return direct;

  const explicitMinutes =
    kind === "running"
      ? numberFrom(telem?.runningMinutes, device.runningMinutes)
      : kind === "idle"
        ? numberFrom(telem?.idleMinutes, device.idleMinutes)
        : kind === "stop"
          ? numberFrom(telem?.stoppedMinutes, telem?.stopMinutes, device.stoppedMinutes, device.stopMinutes)
          : numberFrom(telem?.inactiveMinutes, device.inactiveMinutes);
  if (explicitMinutes != null) return durationText(explicitMinutes);

  const status = statKey(telem);
  const liveMinutes = minutesSinceLatest(telem);
  if (liveMinutes == null) return "--";
  if (kind === "running" && status === "moving") return durationText(Math.max(1, liveMinutes));
  if (kind === "idle" && status === "idle") return durationText(Math.max(1, liveMinutes));
  if (kind === "stop" && status === "stopped") return durationText(Math.max(1, liveMinutes));
  if (kind === "inactive" && status === "offline") return durationText(Math.max(1, liveMinutes));
  return durationText(0);
}

function odometerDigits(telem: DeviceRow | null, device: DeviceRow) {
  const meters = numberFrom(telem?.odometerM, device?.odometerM, device?.odometerMeters);
  const km = meters != null ? Math.round(meters / 1000) : numberFrom(telem?.odometerKm, device?.odometerKm, device?.mileageKm);
  if (km == null) return ["-", "-", "-", "-", "-", "-", "-", "-"];
  return String(Math.max(0, Math.round(km))).padStart(8, "0").slice(-8).split("");
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

function StatusBadge({ telem }: { telem: DeviceRow | null }) {
  const key = statKey(telem);
  const label = key === "moving" ? "Moving" : key === "idle" ? "Online" : key === "stopped" ? "Stopped" : "Offline";
  return (
    <span className="inline-flex min-w-[76px] items-center justify-center rounded-md px-2.5 py-1.5 text-xs font-bold text-white" style={{ background: STATUS_COLOR[key] }}>
      {label}
    </span>
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

function AssetDetailDrawer({
  device,
  telem,
  location,
  onClose,
}: {
  device: DeviceRow;
  telem: DeviceRow | null;
  location: string;
  onClose: () => void;
}) {
  const key = statKey(telem);
  const digits = odometerDigits(telem, device);
  const iconKey = device.objectIcon ?? device.icon ?? device.assetIcon ?? device.vehicleType;
  const todayKm = todayDistance(telem, device);
  const speed = Math.round(Number(telem?.speedKph ?? 0));
  const avgSpeed = numberFrom(telem?.avgSpeedKph, telem?.averageSpeedKph, device?.avgSpeedKph);
  const maxSpeed = numberFrom(telem?.maxSpeedKph, telem?.topSpeedKph, device?.maxSpeedKph);
  const fuel = numberFrom(telem?.fuelConsumedLiters, telem?.fuelConsumptionLiters, device?.fuelConsumptionLiters);

  return (
    <aside className="absolute right-3 top-3 z-20 max-h-[calc(100%-1.5rem)] w-[min(318px,calc(100%-1.5rem))] translate-x-0 overflow-y-auto rounded-xl border border-[#e2ebf2] bg-white shadow-xl transition-transform">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e8eef4] bg-white px-3.5 py-2.5">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-[#2b2f36]">{shortName(device)}</h2>
          <p className="text-[11px] font-medium text-[#64748b]">{fieldText(device.vehiclePlate, device.imei)}</p>
        </div>
        <button type="button" onClick={onClose} className="grid h-7 w-7 place-items-center rounded-lg text-[#536987] hover:bg-[#eef4f8]" aria-label="Close asset details">
          <FiX size={16} />
        </button>
      </div>

      <div className="space-y-2.5 p-2.5">
        <section className="rounded-lg bg-white shadow-[0_6px_16px_rgba(15,23,42,0.08)]">
          <div className="px-3 pt-2.5 text-base font-bold text-[#2b2f36]">{fieldText(device.vehiclePlate, device.name, device.imei)}</div>
          <div className="mx-auto grid h-[118px] place-items-center" dangerouslySetInnerHTML={{ __html: objectIconSvg(iconKey, STATUS_COLOR[key]) }} />
          <div className="mx-3 mt-6 flex items-center justify-between bg-[#f8fafc]">
            <StatusBadge telem={telem} />
            <span className="px-2.5 text-xs font-bold text-[#2b2f36]">{timeAgo(telem?.receivedAt ?? telem?.eventTime)}</span>
          </div>
          <div className="mx-3 mt-2.5 flex justify-center overflow-hidden rounded-md border border-[#e5edf4]">
            {digits.map((digit, index) => (
              <span key={`${digit}-${index}`} className="grid h-8 w-7 place-items-center border-r border-[#e5edf4] bg-[#f8fafc] text-base font-medium text-[#2b2f36] last:border-r-0">
                {digit}
              </span>
            ))}
          </div>
          <div className="space-y-1.5 px-3 py-2.5 text-xs text-[#2b2f36]">
            <div className="flex items-center justify-between gap-3">
              <span>Driver</span>
              <span className="truncate font-semibold text-[#2563eb]">{fieldText(device.driverName, device.ownerName, "Assign Driver")}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>Mobile</span>
              <span className="truncate font-semibold">{fieldText(device.driverPhone, device.mobileNumber, device.simNumber)}</span>
            </div>
            <div className="grid grid-cols-5 border-t border-[#eef2f6] pt-2.5 text-center">
              <FiTruck className="mx-auto text-[#64748b]" size={16} />
              <FiNavigation className="mx-auto" color={STATUS_COLOR[key]} size={16} />
              <FiBattery className="mx-auto text-[#16a34a]" size={16} />
              <FiPower className="mx-auto text-[#16a34a]" size={16} />
              <FiLock className="mx-auto text-[#ef334a]" size={16} />
            </div>
          </div>
        </section>

        <section className="rounded-lg bg-white p-2.5 shadow-[0_6px_16px_rgba(15,23,42,0.08)]">
          <div className="mb-2 flex items-center gap-2 text-sm font-bold text-[#2b2f36]">
            Location <FiInfo size={13} />
          </div>
          <div className="text-xs leading-relaxed text-[#2b2f36]">{location}</div>
          <div className="mt-2 text-xs font-semibold text-[#2563eb]">{coords(telem)}</div>
        </section>

        <section className="rounded-lg bg-white p-2.5 shadow-[0_6px_16px_rgba(15,23,42,0.08)]">
          <div className="mb-2.5 text-sm font-bold text-[#2b2f36]">Today Activity</div>
          <div className="flex items-center gap-1.5">
            <FiFlag className="text-[#7ac943]" size={19} />
            <div className="h-0 flex-1 border-t-2 border-dashed border-[#111827]" />
            <span className="text-xs font-semibold text-[#2b2f36]">{todayKm}</span>
            <FiTruck className="text-[#39aaf5]" size={19} />
          </div>
          <div className="mt-2.5 space-y-1.5 text-xs">
            <div className="flex justify-between"><span>Running</span><strong className="text-[#16a34a]">{activityDuration("running", telem, device)}</strong></div>
            <div className="flex justify-between"><span>Idle</span><strong className="text-[#d99a13]">{activityDuration("idle", telem, device)}</strong></div>
            <div className="flex justify-between"><span>Stop</span><strong className="text-[#ef334a]">{activityDuration("stop", telem, device)}</strong></div>
            <div className="flex justify-between"><span>Inactive</span><strong className="text-[#2563eb]">{activityDuration("inactive", telem, device)}</strong></div>
            <div className="flex justify-between"><span>Fuel Consumption</span><strong>{fuel != null ? `${fuel.toFixed(2)} Ltr` : "--"}</strong></div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-[#dff2ff] p-2.5 text-center text-[#07152f] shadow-sm">
            <div className="text-xs font-medium">Avg Speed</div>
            <div className="mt-0.5 text-base font-bold">{avgSpeed != null ? `${avgSpeed.toFixed(1)} kmh` : "--"}</div>
          </div>
          <div className="rounded-lg bg-[#ffe1e4] p-2.5 text-center text-[#1f0b11] shadow-sm">
            <div className="text-xs font-medium">Max Speed</div>
            <div className="mt-0.5 text-base font-bold">{maxSpeed != null ? `${Math.round(maxSpeed)} kmh` : "--"}</div>
          </div>
          <div className="rounded-lg bg-[#daf8ee] p-2.5 text-center text-[#04170f] shadow-sm">
            <div className="text-xs font-medium">Speed</div>
            <div className="mt-0.5 text-base font-bold">{speed} kmh</div>
          </div>
          <div className="rounded-lg bg-[#fff0cf] p-2.5 text-center text-[#231505] shadow-sm">
            <div className="text-xs font-medium">Battery</div>
            <div className="mt-0.5 text-base font-bold">{batteryVoltage(telem, device)}</div>
          </div>
        </div>
      </div>
    </aside>
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
  const [vehiclePanelOpen, setVehiclePanelOpen] = useState(false);
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
                <div class="tp-popup-indicators">
                  <span class="${ignitionOn ? "is-on" : ""}">Ignition: ${escapeHtml(ignitionText(t ?? null))}</span>
                  <span class="${motionActive ? "is-on" : ""}">Motion: ${escapeHtml(motionText(t ?? null))}</span>
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
    [addresses, devices, telemetry]
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
          <div className="border-b border-[#dbe5ee] bg-[#f5f8fb] px-2.5 py-2.5">
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
                const motionActive = isMotionActive(t);
                const ignitionOn = isIgnitionOn(t);
                const location = locationLine(d, t, addresses[addressKey(t) ?? ""]);
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
                      <IndicatorPill active={motionActive} label="Motion" value={motionText(t)} />
                    </div>

                    <div className="mt-1 text-xs font-medium text-[#536987]">Last data received {timeAgo(t?.receivedAt ?? t?.eventTime)}</div>

                    <div className="mt-2.5 flex items-start gap-1.5">
                      <FiMapPin size={18} className="mt-0.5 flex-shrink-0 text-[#061337]" />
                      <div className="min-w-0 text-[13px] font-medium leading-snug text-[#061337]" title={location}>{location}</div>
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
          <AssetDetailDrawer
            device={selectedDevice}
            telem={telemetry[selectedDevice.id] ?? null}
            location={locationLine(selectedDevice, telemetry[selectedDevice.id] ?? null, addresses[addressKey(telemetry[selectedDevice.id] ?? null) ?? ""])}
            onClose={() => setSelected(null)}
          />
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

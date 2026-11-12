"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  FiActivity,
  FiSliders,
  FiMaximize,
  FiAlertTriangle,
  FiBattery,
  FiCamera,
  FiCopy,
  FiDroplet,
  FiInfo,
  FiLayers,
  FiLock,
  FiMapPin,
  FiNavigation,
  FiPlay,
  FiRefreshCw,
  FiSearch,
  FiShare2,
  FiUnlock,
  FiUser,
  FiX,
} from "react-icons/fi";
import HistorySearch from "@/components/signature/HistorySearch";
import MapFuelPanel from "@/components/signature/MapFuelPanel";
import MapTripsPanel from "@/components/signature/MapTripsPanel";
import { useSearchParams } from "next/navigation";
import { useWorkspace } from "@/components/signature/WorkspaceContext";
import { canReadModule } from "@/components/signature/access";
import LiveStreamModal from "@/components/LiveStreamModal";
import type { MarkerData } from "@/components/MapboxMap";
import { redirectIfUnauthorized } from "@/lib/clientSession";
import { realtimeTicket } from "@/lib/realtimeTicket";
import { objectIconImage } from "@/lib/objectIcons";

const MapboxMap = dynamic(() => import("@/components/MapboxMap"), {
  ssr: false,
});

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
  {
    id: "streets",
    label: "Streets",
    style: "mapbox://styles/mapbox/streets-v12",
  },
  {
    id: "satellite",
    label: "Satellite",
    style: "mapbox://styles/mapbox/satellite-v9",
  },
  { id: "dark", label: "Dark", style: "mapbox://styles/mapbox/dark-v11" },
  { id: "light", label: "Light", style: "mapbox://styles/mapbox/light-v11" },
  {
    id: "outdoors",
    label: "Outdoors",
    style: "mapbox://styles/mapbox/outdoors-v12",
  },
];

const STATUS_FILTERS = [
  { key: "all", label: "All", color: "#AA139E" },
  { key: "moving", label: "Moving", color: "#147638" },
  { key: "idle", label: "Idle", color: "#9a5405" },
  { key: "stopped", label: "Stopped", color: "#F24464" },
  { key: "offline", label: "Inactive", color: "#6d28d9" },
] as const;

function statKey(
  telem: DeviceRow | null,
): "moving" | "stopped" | "idle" | "offline" {
  if (!telem || !isRecentlyReporting(telem)) return "offline";
  const spd = Number(telem.speedKph ?? 0);
  if (spd > 5) return "moving";
  if (isIgnitionOn(telem)) return "idle";
  return "stopped";
}

function isMoving(telem: DeviceRow | null) {
  return isRecentlyReporting(telem) && Number(telem?.speedKph ?? 0) > 5;
}

function isMotionActive(telem: DeviceRow | null) {
  if (!isRecentlyReporting(telem)) return false;
  const motion = String(
    telem?.motion ?? telem?.motionStatus ?? "",
  ).toLowerCase();
  return isMoving(telem) || motion === "moving" || motion === "updating";
}

function isIgnitionOn(telem: DeviceRow | null) {
  if (!telem || !isRecentlyReporting(telem)) return false;
  return Boolean(telem.ignition) || isMoving(telem);
}

function latestTime(telem: DeviceRow | null) {
  const value =
    telem?.receivedAt ??
    telem?.eventTime ??
    telem?.timestamp ??
    telem?.updatedAt ??
    telem?.lastSeenAt;
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

function cardObjectIcon(d: DeviceRow) {
  if (String(d.deviceType ?? "").toLowerCase() === "dashcam")
    return "/dashcam-object-icon.png";
  return objectIconImage(
    d.objectIcon ?? d.icon ?? d.assetIcon ?? d.vehicleType ?? "car",
  );
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
  if (hours < 24)
    return mins ? `${hours} hours and ${mins} minutes` : `${hours} hours`;
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

function formatNotificationTime(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function compactAlertType(value: unknown) {
  const raw = fieldText(value, "event");
  return raw
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((part, index) =>
      index === 0 ? part : `${part.charAt(0).toUpperCase()}${part.slice(1)}`,
    )
    .join("");
}

function statusText(telem: DeviceRow | null) {
  const key = statKey(telem);
  if (key === "moving")
    return `Moving: ${Math.round(Number(telem?.speedKph ?? 0))} km/h`;
  if (key === "idle")
    return isRecentlyReporting(telem)
      ? `Online: ${timeAgo(telem?.receivedAt ?? telem?.eventTime)}`
      : `Idle: ${timeAgo(telem?.receivedAt ?? telem?.eventTime)}`;
  if (key === "stopped")
    return `Stopped: ${timeAgo(telem?.receivedAt ?? telem?.eventTime)}`;
  return `Disconnected: ${timeAgo(telem?.receivedAt ?? telem?.eventTime)}`;
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
  const odometerM = numberFrom(
    telem?.odometerM,
    telem?.odometerMeters,
    telem?.odometer_m,
  );
  if (odometerM && odometerM > 0) return odometerM / 1000;

  const km = numberFrom(
    telem?.distanceKm,
    telem?.todayKm,
    telem?.tripKm,
    telem?.mileageKm,
    device?.odometerKm,
    device?.mileageKm,
    device?.odometer,
    device?.mileage,
  );
  if (km && km > 0) return km;

  const meters = numberFrom(
    telem?.distanceM,
    telem?.todayDistanceM,
    telem?.tripDistanceM,
  );
  if (meters && meters > 0) return meters / 1000;

  return 0;
}

function todayDistance(telem: DeviceRow | null, device?: DeviceRow | null) {
  const km = todayDistanceKm(telem, device);
  return km > 0 ? `${km.toFixed(1)} km` : null;
}

function batteryVoltage(telem: DeviceRow | null, device?: DeviceRow | null) {
  const voltageMv = numberFrom(
    telem?.voltageMv,
    telem?.batteryVoltageMv,
    telem?.vehicleVoltageMv,
    telem?.externalVoltageMv,
    device?.voltageMv,
    device?.batteryVoltageMv,
  );
  if (voltageMv && voltageMv > 0) return `${(voltageMv / 1000).toFixed(2)} V`;

  const voltage = numberFrom(
    telem?.voltage,
    telem?.batteryVoltage,
    telem?.vehicleVoltage,
    telem?.externalVoltage,
    device?.voltage,
    device?.batteryVoltage,
  );
  if (voltage && voltage > 0)
    return `${voltage > 100 ? (voltage / 1000).toFixed(2) : voltage.toFixed(2)} V`;

  const batteryPercent = numberFrom(
    telem?.batteryPercent,
    telem?.batteryPct,
    telem?.battery,
    device?.batteryPercent,
    device?.batteryPct,
  );
  if (batteryPercent != null) return `${Math.round(batteryPercent)}%`;

  return "Not reported";
}

function ignitionText(telem: DeviceRow | null) {
  if (!isRecentlyReporting(telem)) return "--";
  return isIgnitionOn(telem) ? "ON" : "OFF";
}

function motionText(telem: DeviceRow | null) {
  if (!isRecentlyReporting(telem)) return "DISCONNECTED";
  if (isMoving(telem)) return "MOVING";
  if (isRecentlyReporting(telem)) return "UPDATING";
  return "STOPPED";
}

function coords(telem: DeviceRow | null) {
  if (telem?.latitude == null || telem?.longitude == null)
    return "Coordinates unavailable";
  return `(${Number(telem.latitude).toFixed(6)}, ${Number(telem.longitude).toFixed(6)})`;
}

function addressKey(telem: DeviceRow | null) {
  if (telem?.latitude == null || telem?.longitude == null) return null;
  return `${Number(telem.latitude).toFixed(5)},${Number(telem.longitude).toFixed(5)}`;
}

function locationLine(
  d: DeviceRow,
  telem: DeviceRow | null,
  resolvedAddress?: string,
) {
  return (
    resolvedAddress ??
    telem?.address ??
    telem?.lastAddress ??
    d.currentAddress ??
    d.lastAddress ??
    coords(telem)
  );
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

function mergeTelemetry(
  previous: DeviceRow | undefined,
  next: DeviceRow | null,
) {
  if (!next) return previous;
  if (!previous) return next;
  const previousTime = latestTime(previous) ?? 0;
  const nextTime = latestTime(next) ?? 0;
  if (previousTime > 0 && nextTime > 0 && nextTime < previousTime)
    return previous;
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
    <div
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg px-5 py-3 text-sm font-medium text-white shadow-xl"
      style={{ background: "#061337" }}
    >
      {msg}
      <button onClick={onDone} aria-label="Close notification">
        <FiX size={14} />
      </button>
    </div>
  );
}

function VehicleDetailsModal({
  device,
  telem,
  address,
  onClose,
  onControl,
}: {
  device: DeviceRow;
  telem: DeviceRow | null;
  address: string;
  onClose: () => void;
  onControl: (device: DeviceRow, action: "immobilise" | "mobilise") => void;
}) {
  const [fuel, setFuel] = useState<DeviceRow | null>(null);
  const [alerts, setAlerts] = useState<DeviceRow[]>([]);
  const [driver, setDriver] = useState<DeviceRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadDetails = async () => {
      setLoading(true);
      const [fuelResponse, alertsResponse, driversResponse] = await Promise.all(
        [
          fetch(
            `/api/telemetry?type=fuel-latest&deviceId=${encodeURIComponent(device.id)}`,
            { cache: "no-store" },
          ).catch(() => null),
          fetch(
            `/api/telemetry?type=alerts&deviceId=${encodeURIComponent(device.id)}&unacknowledgedOnly=false`,
            { cache: "no-store" },
          ).catch(() => null),
          fetch("/api/drivers", { cache: "no-store" }).catch(() => null),
        ],
      );
      if (cancelled) return;
      if (fuelResponse?.ok)
        setFuel(await fuelResponse.json().catch(() => null));
      if (alertsResponse?.ok) {
        const data = await alertsResponse.json().catch(() => []);
        setAlerts(Array.isArray(data) ? data : (data?.content ?? []));
      }
      if (driversResponse?.ok) {
        const data = await driversResponse.json().catch(() => []);
        const rows: DeviceRow[] = Array.isArray(data)
          ? data
          : (data?.content ?? []);
        const driverId = String(
          device.driverId ?? device.assignedDriverId ?? "",
        );
        const driverName = String(device.driverName ?? "").toLowerCase();
        setDriver(
          rows.find((row) => driverId && String(row.id) === driverId) ??
            rows.find(
              (row) =>
                driverName &&
                String(row.displayName ?? row.name ?? "").toLowerCase() ===
                  driverName,
            ) ??
            null,
        );
      }
      setLoading(false);
    };
    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [device]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const fuelPercent = numberFrom(
    fuel?.fuelLevelPct,
    fuel?.fuelPercent,
    fuel?.levelPercent,
  );
  const fuelLitres = numberFrom(
    fuel?.fuelLiters,
    fuel?.fuelLitres,
    fuel?.volumeLiters,
  );
  const driverScore = numberFrom(
    driver?.scoreTotal,
    driver?.score,
    device.driverScore,
  );
  const latestAlerts = [...alerts]
    .sort(
      (a, b) =>
        new Date(b.alertTime ?? b.receivedAt ?? 0).getTime() -
        new Date(a.alertTime ?? a.receivedAt ?? 0).getTime(),
    )
    .slice(0, 5);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[#061337]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${shortName(device)} vehicle details`}
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white shadow-2xl sm:max-w-3xl sm:rounded-lg"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#dce6ee] bg-white px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={cardObjectIcon(device)}
              alt=""
              className="h-11 w-11 flex-shrink-0 object-contain"
            />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold text-[#061337]">
                {shortName(device)}
              </h2>
              <p
                className="mt-0.5 text-xs font-medium"
                style={{ color: STATUS_COLOR[statKey(telem)] }}
              >
                {statusText(telem)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-md text-[#536987] hover:bg-[#eef4f8]"
            aria-label="Close vehicle details"
          >
            <FiX size={21} />
          </button>
        </header>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#dce6ee] bg-[#dce6ee] sm:grid-cols-4">
            <DetailMetric
              icon={<FiActivity />}
              label="Speed"
              value={
                isRecentlyReporting(telem)
                  ? `${Math.round(Number(telem?.speedKph ?? 0))} km/h`
                  : "--"
              }
            />
            <DetailMetric
              icon={<FiNavigation />}
              label="Kilometres covered"
              value={todayDistance(telem, device) ?? "No trip distance"}
            />
            <DetailMetric
              icon={<FiBattery />}
              label="Vehicle battery"
              value={batteryVoltage(telem, device)}
            />
            <DetailMetric
              icon={<FiInfo />}
              label="Ignition"
              value={ignitionText(telem)}
            />
          </div>

          <section>
            <h3 className="text-xs font-extrabold uppercase text-[#536987]">
              Remote vehicle control
            </h3>
            <p className="mt-2 text-xs leading-5 text-[#536987]">
              Immobilisation is only sent while the asset is online and
              stationary. Always confirm the vehicle is safely parked.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onControl(device, "immobilise")}
                disabled={isMoving(telem)}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#f24464] px-4 text-xs font-bold text-white transition hover:bg-[#d93653] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiLock /> Immobilise asset
              </button>
              <button
                type="button"
                onClick={() => onControl(device, "mobilise")}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-[#b9ccd8] bg-white px-4 text-xs font-bold text-[#0d5c58] transition hover:bg-[#eef7f6]"
              >
                <FiUnlock /> Restore engine
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-extrabold uppercase text-[#536987]">
              Live position
            </h3>
            <div className="mt-3 flex items-start gap-3 border-b border-[#e7edf2] pb-4">
              <FiMapPin
                className="mt-0.5 flex-shrink-0 text-[#33a46f]"
                size={19}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5 text-[#061337]">
                  {address}
                </p>
                <p className="mt-1 text-xs text-[#536987]">
                  {coords(telem)} · Last report{" "}
                  {timeAgo(telem?.receivedAt ?? telem?.eventTime)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 text-xs sm:grid-cols-4">
              <DetailLine label="Motion" value={motionText(telem)} />
              <DetailLine
                label="Satellites"
                value={fieldText(telem?.satellites, "Not reported")}
              />
              <DetailLine
                label="GPS accuracy"
                value={
                  telem?.accuracyM != null
                    ? `${telem.accuracyM} m`
                    : "Not reported"
                }
              />
              <DetailLine
                label="GSM signal"
                value={fieldText(telem?.gsmSignal, "Not reported")}
              />
            </div>
          </section>

          {fuel && (fuelPercent != null || fuelLitres != null) && (
            <section>
              <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#536987]">
                <FiDroplet /> Fuel
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-4 border-b border-[#e7edf2] pb-4 sm:grid-cols-4">
                <DetailLine
                  label="Fuel level"
                  value={
                    fuelPercent == null
                      ? "Not reported"
                      : `${fuelPercent.toFixed(1)}%`
                  }
                />
                <DetailLine
                  label="Volume"
                  value={
                    fuelLitres == null
                      ? "Not reported"
                      : `${fuelLitres.toFixed(1)} L`
                  }
                />
                <DetailLine
                  label="Temperature"
                  value={
                    fuel.temperatureC == null
                      ? "Not reported"
                      : `${Number(fuel.temperatureC).toFixed(1)} °C`
                  }
                />
                <DetailLine
                  label="Sensor report"
                  value={timeAgo(fuel.receivedAt)}
                />
              </div>
            </section>
          )}

          <section className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-extrabold uppercase text-[#536987]">
                Driver scorecard
              </h3>
              <div className="mt-3 flex items-center justify-between border-b border-[#e7edf2] pb-4">
                <div>
                  <p className="text-sm font-bold text-[#061337]">
                    {fieldText(
                      driver?.displayName,
                      driver?.name,
                      device.driverName,
                      "Not assigned",
                    )}
                  </p>
                  <p className="mt-1 text-xs text-[#536987]">
                    {fieldText(
                      driver?.phoneNumber,
                      driver?.mobileNumber,
                      device.driverPhone,
                      "No mobile number",
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-[#33a46f]">
                    {driverScore == null ? "--" : Math.round(driverScore)}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-[#536987]">
                    Safety score
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase text-[#536987]">
                Vehicle & device
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-4 border-b border-[#e7edf2] pb-4">
                <DetailLine
                  label="Registration"
                  value={fieldText(
                    device.vehiclePlate,
                    device.plateNumber,
                    "Not set",
                  )}
                />
                <DetailLine label="IMEI" value={fieldText(device.imei)} />
                <DetailLine
                  label="Type"
                  value={fieldText(device.vehicleType, device.deviceType)}
                />
                <DetailLine
                  label="Trip"
                  value={fieldText(device.tripName, "Not assigned")}
                />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#536987]">
                <FiAlertTriangle /> Recent GPS alerts
              </h3>
              <span className="text-xs font-bold text-[#f24464]">
                {alerts.length} total
              </span>
            </div>
            <div className="mt-3 divide-y divide-[#e7edf2] border-y border-[#e7edf2]">
              {loading ? (
                <p className="py-4 text-xs text-[#536987]">
                  Loading vehicle details...
                </p>
              ) : latestAlerts.length === 0 ? (
                <p className="py-4 text-xs text-[#536987]">
                  No alerts recorded for this vehicle.
                </p>
              ) : (
                latestAlerts.map((alert, index) => (
                  <div
                    key={alert.id ?? `${alert.alertTime}-${index}`}
                    className="flex items-start justify-between gap-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#061337]">
                        {fieldText(alert.alertType, "GPS alert")}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-[#536987]">
                        {fieldText(
                          alert.message,
                          alert.address,
                          "Vehicle alert",
                        )}
                      </p>
                    </div>
                    <time className="flex-shrink-0 text-[10px] text-[#536987]">
                      {formatDateTime(alert.alertTime ?? alert.receivedAt)}
                    </time>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

function DetailMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white p-4">
      <div className="flex items-center gap-2 text-[#33a46f]">
        {icon}
        <span className="text-[10px] font-bold uppercase text-[#536987]">
          {label}
        </span>
      </div>
      <div className="mt-2 text-sm font-extrabold text-[#061337]">{value}</div>
    </div>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-bold uppercase text-[#8a9aae]">
        {label}
      </div>
      <div
        className="mt-1 truncate text-xs font-semibold text-[#061337]"
        title={value}
      >
        {value}
      </div>
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
    <div className="st-live-status">
      {STATUS_FILTERS.filter((item) => item.key !== "all").map((item) => (
        <button
          key={item.key}
          type="button"
          aria-pressed={active === item.key}
          onClick={() => onChange(active === item.key ? "all" : item.key)}
          style={{ "--status-color": item.color } as React.CSSProperties}
        >
          <span>
            <i />
            {item.label}
          </span>
          <strong>{counts[item.key]}</strong>
        </button>
      ))}
    </div>
  );
}

function LiveTabPanel({
  tab,
  rows,
  loading,
  devices,
  selectedDeviceId,
  notificationPreset = { filter: "all", revision: 0 },
}: {
  tab: string;
  rows: LiveTabRow[];
  loading: boolean;
  devices: DeviceRow[];
  selectedDeviceId?: string | null;
  notificationPreset?: { filter: string; revision: number };
}) {
  if (tab === "History") {
    return (
      <HistoryPanel devices={devices} selectedDeviceId={selectedDeviceId} />
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-white p-3.5 text-[11px] text-[#536987] shadow-[0_14px_32px_rgba(15,23,42,0.07)]">
        Loading {tab.toLowerCase()}...
      </div>
    );
  }

  if (tab === "Notifications") {
    return (
      <NotificationsTable
        key={notificationPreset.revision}
        rows={rows}
        devices={devices}
        initialFilter={notificationPreset.filter}
      />
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-xl bg-white p-3.5 text-[11px] text-[#536987] shadow-[0_14px_32px_rgba(15,23,42,0.07)]">
        No live {tab.toLowerCase()} records yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <article
          key={row.id}
          className="rounded-xl bg-white p-3 shadow-[0_12px_28px_rgba(15,23,42,0.07)]"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-[13px] font-extrabold text-[#061337]">
                {fieldText(row.name, tab)}
              </div>
              <div className="mt-1 text-[11px] leading-snug text-[#536987]">
                {fieldText(row.location, row.category, row.geofenceType)}
              </div>
            </div>
            <span className="rounded-full bg-[#eef7ff] px-2 py-1 text-[10px] font-bold text-[#2563eb]">
              {fieldText(row.geofenceType, "Zone")}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-semibold text-[#536987]">
            <span>Lat: {row.centerLat ?? "--"}</span>
            <span>Lng: {row.centerLng ?? "--"}</span>
            <span>
              Radius:{" "}
              {row.radiusM != null
                ? `${Math.round(Number(row.radiusM))} m`
                : "--"}
            </span>
            <span>{row.active ? "Active" : "Inactive"}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

type PlaybackHistory = {
  deviceName?: string;
  distanceM?: number;
  durationSeconds?: number;
  points?: LiveTabRow[];
};

function HistoryPanel({
  devices,
  selectedDeviceId,
}: {
  devices: DeviceRow[];
  selectedDeviceId?: string | null;
}) {
  const todayStart = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return localDateTime(date);
  }, []);
  const todayEnd = useMemo(() => localDateTime(new Date()), []);
  const [deviceId, setDeviceId] = useState(
    selectedDeviceId ?? String(devices[0]?.id ?? ""),
  );
  const [period, setPeriod] = useState("today");
  const [from, setFrom] = useState(todayStart);
  const [to, setTo] = useState(todayEnd);
  const [stopFilter, setStopFilter] = useState("all");
  const [history, setHistory] = useState<PlaybackHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedDeviceId) setDeviceId(selectedDeviceId);
    else if (!deviceId && devices[0]?.id) setDeviceId(String(devices[0].id));
  }, [deviceId, devices, selectedDeviceId]);

  function changePeriod(value: string) {
    setPeriod(value);
    const end = new Date();
    const start = new Date();
    if (value === "today") start.setHours(0, 0, 0, 0);
    if (value === "yesterday") {
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    }
    if (value === "six-hours")
      start.setTime(end.getTime() - 6 * 60 * 60 * 1000);
    if (value !== "custom") {
      setFrom(localDateTime(start));
      setTo(localDateTime(end));
    }
  }

  async function showHistory() {
    if (!deviceId || !from || !to) return;
    setLoading(true);
    setError("");
    try {
      const params = playbackParams(deviceId, from, to);
      const response = await fetch(`/api/playback?${params}`, {
        cache: "no-store",
      });
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(data?.message || "History could not be loaded.");
      setHistory(data);
    } catch (cause) {
      setHistory(null);
      setError(
        cause instanceof Error ? cause.message : "History could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }

  function playHistory() {
    if (!deviceId || !from || !to) return;
    const params = playbackParams(deviceId, from, to);
    params.set("autoplay", "1");
    window.location.assign(`/app/history?${params}`);
  }

  function exportHistory() {
    const points = history?.points ?? [];
    if (!points.length) return;
    const csv = [
      "time,latitude,longitude,speed_kph,ignition,voltage_mv",
      ...points.map((point) =>
        [
          point.eventTime,
          point.latitude,
          point.longitude,
          point.speedKph ?? 0,
          point.ignition ?? false,
          point.voltageMv ?? "",
        ].join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `vehicle-history-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const points = (history?.points ?? []).filter(
    (point) => stopFilter === "all" || Number(point.speedKph ?? 0) <= 1,
  );

  return (
    <div className="space-y-3">
      <HistorySearch
        devices={devices.map((device) => ({
          id: String(device.id),
          name: shortName(device),
          vehiclePlate: device.vehiclePlate,
          imei: device.imei,
        }))}
        deviceId={deviceId}
        onDevice={setDeviceId}
        period={period}
        onPeriod={changePeriod}
        from={from}
        to={to}
        onFrom={(value) => {
          setFrom(value);
          setPeriod("custom");
        }}
        onTo={(value) => {
          setTo(value);
          setPeriod("custom");
        }}
        movement={stopFilter}
        onMovement={setStopFilter}
        loading={loading}
        hasResults={Boolean(history?.points?.length)}
        onSearch={() => void showHistory()}
        onExport={exportHistory}
        onClear={() => setHistory(null)}
      />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-[11px] font-semibold text-red-700">
          {error}
        </div>
      )}
      {history && (
        <div className="rounded-lg border border-[#dbe5ee] bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[13px] font-extrabold text-[#061337]">
                {history.deviceName || "Playback history"}
              </div>
              <div className="mt-1 text-[10px] font-semibold text-[#64748b]">
                {points.length} points ·{" "}
                {formatPlaybackDistance(history.distanceM)} ·{" "}
                {formatPlaybackDuration(history.durationSeconds)}
              </div>
            </div>
            <button
              type="button"
              onClick={playHistory}
              disabled={!history.points?.length}
              className="flex h-9 items-center gap-2 rounded-md bg-[#f24464] px-3 text-[11px] font-bold text-white disabled:opacity-40"
            >
              <FiPlay /> Play
            </button>
          </div>
          <div className="mt-3 max-h-64 overflow-y-auto">
            {points
              .slice()
              .reverse()
              .slice(0, 100)
              .map((point, index) => (
                <div
                  key={point.id ?? index}
                  className="flex items-center justify-between border-t border-[#eef2f6] py-2 text-[10px]"
                >
                  <span className="font-medium text-[#536987]">
                    {formatDateTime(point.eventTime ?? point.receivedAt)}
                  </span>
                  <span className="font-bold text-[#0D8A80]">
                    {Math.round(Number(point.speedKph ?? 0))} km/h
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function localDateTime(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function playbackParams(deviceId: string, from: string, to: string) {
  return new URLSearchParams({
    deviceId,
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
  });
}

function formatPlaybackDistance(meters?: number) {
  return `${((meters ?? 0) / 1000).toFixed(2)} km`;
}

function formatPlaybackDuration(seconds?: number) {
  const value = Number(seconds ?? 0);
  const hours = Math.floor(value / 3600);
  const minutes = Math.floor((value % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes} min`;
}

function NotificationsTable({
  rows,
  devices,
  initialFilter = "all",
}: {
  rows: LiveTabRow[];
  devices: DeviceRow[];
  initialFilter?: string;
}) {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState(initialFilter);

  const deviceNames = useMemo(() => {
    const names: Record<string, string> = {};
    devices.forEach((device) => {
      names[String(device.id)] = shortName(device);
    });
    return names;
  }, [devices]);

  const eventTypes = useMemo(
    () =>
      Array.from(
        new Set(
          rows.map((row) => compactAlertType(row.alertType)).filter(Boolean),
        ),
      ).sort(),
    [rows],
  );

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      const objectName = fieldText(
        row.deviceName,
        row.vehicleName,
        row.objectName,
        deviceNames[String(row.deviceId)],
        row.imei,
        row.deviceId,
      );
      const event = compactAlertType(row.alertType);
      const matchesEvent =
        eventFilter === "all" ||
        event === eventFilter ||
        (eventFilter === "emergency" &&
          ["sos", "panic"].includes(event.toLowerCase()));
      if (!matchesEvent) return false;
      if (!query) return true;
      return [objectName, event, row.message, row.severity]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [deviceNames, eventFilter, rows, search]);

  return (
    <div className="overflow-hidden rounded-lg border border-[#e2e8f0] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-[1fr_132px] border-b border-[#eef2f6] bg-white">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Vehicle"
          className="h-10 min-w-0 border-r border-[#eef2f6] bg-white px-3 text-[11px] font-medium text-[#061337] outline-none placeholder:text-[#94a3b8]"
        />
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="h-10 min-w-0 bg-white px-2 text-[11px] font-medium text-[#536987] outline-none"
          aria-label="Event filter"
        >
          <option value="all">Event Filter</option>
          <option value="emergency">SOS / Panic</option>
          {eventTypes.map((event) => (
            <option key={event} value={event}>
              {event}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-[1fr_1.28fr_1fr_22px] border-b border-[#dbe5ee] bg-[#f8fafc] text-[10px] font-semibold text-[#475569]">
        <div className="border-r border-[#e2e8f0] px-2 py-2">Object</div>
        <div className="border-r border-[#e2e8f0] px-2 py-2">Time</div>
        <div className="px-2 py-2">Event</div>
        <div />
      </div>

      {filteredRows.length === 0 ? (
        <div className="px-3 py-6 text-center text-[11px] font-medium text-[#94a3b8]">
          No notifications match this filter.
        </div>
      ) : (
        <div className="max-h-[calc(100vh-330px)] overflow-y-auto">
          {filteredRows.map((row, index) => {
            const objectName = fieldText(
              row.deviceName,
              row.vehicleName,
              row.objectName,
              deviceNames[String(row.deviceId)],
              row.imei,
              row.deviceId,
            );
            return (
              <div
                key={row.id ?? `${row.deviceId}-${row.alertTime}-${index}`}
                className={`grid grid-cols-[1fr_1.28fr_1fr_22px] items-center text-[10px] font-medium text-[#26364a] ${
                  index % 2 === 0 ? "bg-white" : "bg-[#f7f9fb]"
                }`}
              >
                <div className="min-w-0 px-2 py-3">
                  <div className="truncate font-semibold uppercase">
                    {objectName}
                  </div>
                </div>
                <div className="min-w-0 px-2 py-3">
                  <div className="truncate">
                    {formatNotificationTime(row.alertTime ?? row.receivedAt)}
                  </div>
                </div>
                <div className="min-w-0 px-2 py-3">
                  <div className="truncate">
                    {compactAlertType(row.alertType)}
                  </div>
                </div>
                <button
                  type="button"
                  className="flex h-full min-h-10 flex-col items-center justify-center gap-0.5"
                  aria-label={`Notification actions for ${objectName}`}
                  title={fieldText(row.message, "Notification actions")}
                >
                  <span className="h-1 w-1 rounded-full bg-[#111827]" />
                  <span className="h-1 w-1 rounded-full bg-[#111827]" />
                  <span className="h-1 w-1 rounded-full bg-[#111827]" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AllVehiclesPage() {
  const [allDevices, setDevices] = useState<DeviceRow[]>([]);
  const { scope, account } = useWorkspace();
  const params = useSearchParams();
  const devices = useMemo(
    () =>
      allDevices.filter(
        (device) =>
          scope === null || scope.includes(String(device.organisationId)),
      ),
    [allDevices, scope],
  );
  const [telemetry, setTelemetry] = useState<Record<string, DeviceRow>>({});
  const [fuelByVehicle, setFuelByVehicle] = useState<Record<string, DeviceRow>>(
    {},
  );
  const [dashcamByVehicle, setDashcamByVehicle] = useState<
    Record<string, DeviceRow>
  >({});
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [streamDevice, setStreamDevice] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [detailsDeviceId, setDetailsDeviceId] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState("outdoors");
  const [vehiclePanelOpen, setVehiclePanelOpen] = useState(true);
  const [pins, setPins] = useState<string[]>([]);
  const [fuelOpen, setFuelOpen] = useState(false);
  useEffect(() => {
    const id = params.get("vehicle"),
      status = params.get("status");
    const timer = setTimeout(() => {
      if (id) setSelected(id);
      if (status && ["moving", "idle", "stopped", "inactive"].includes(status))
        setActiveStatus(
          status === "inactive"
            ? "offline"
            : (status as "moving" | "idle" | "stopped"),
        );
    }, 0);
    return () => clearTimeout(timer);
  }, [params]);
  const [activeStatus, setActiveStatus] =
    useState<(typeof STATUS_FILTERS)[number]["key"]>("all");
  const [activePanelTab, setActivePanelTab] = useState("Objects");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [tabRows, setTabRows] = useState<LiveTabRow[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [notificationPreset] = useState({
    filter: "all",
    revision: 0,
  });
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        detailsDeviceId ||
        streamDevice
      )
        return;
      if (fuelOpen || activePanelTab !== "Objects") {
        event.preventDefault();
        setFuelOpen(false);
        setActivePanelTab("Objects");
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [fuelOpen, activePanelTab, detailsDeviceId, streamDevice]);

  const notify = (msg: string) => setToast(msg);

  const handleAssetControl = useCallback(
    async (device: DeviceRow, action: "immobilise" | "mobilise") => {
      const verb = action === "immobilise" ? "immobilise" : "restore";
      const warning =
        action === "immobilise"
          ? `Immobilise ${shortName(device)}? Only continue after confirming the asset is safely parked.`
          : `Send the engine restore command to ${shortName(device)}?`;
      if (!window.confirm(warning)) return;
      const response = await fetch(
        `/api/devices/${encodeURIComponent(device.id)}/control`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action }),
        },
      );
      if (await redirectIfUnauthorized(response)) return;
      const result = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      notify(
        response.ok
          ? (result?.message ?? `${verb} command sent`)
          : (result?.message ?? `Could not ${verb} this asset`),
      );
    },
    [],
  );

  const load = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch("/api/live-tracking?tab=objects");
      if (await redirectIfUnauthorized(res)) return;
      if (res.ok) {
        const data = await res.json();
        const allDevices: DeviceRow[] = Array.isArray(data)
          ? data
          : (data?.content ?? []);
        const list = allDevices.filter(
          (device) =>
            String(device.deviceType ?? "").toLowerCase() !== "fuel sensor",
        );
        setDevices(list);
        setSelected((prev) => {
          if (prev && list.some((d) => d.id === prev)) return prev;
          return null;
        });

        const liveRows = allDevices;
        const telemMap: Record<string, DeviceRow | null> = {};
        const fuelMap: Record<string, DeviceRow> = {};
        const dashcamMap: Record<string, DeviceRow> = {};
        liveRows.forEach((row) => {
          if (row.latestTelemetry)
            telemMap[String(row.id)] = row.latestTelemetry;
          if (row.latestFuel) fuelMap[String(row.id)] = row.latestFuel;
          if (row.dashcam) dashcamMap[String(row.id)] = row.dashcam;
        });
        setFuelByVehicle(fuelMap);
        setDashcamByVehicle(dashcamMap);
        setMapError("");
        setTelemetry((prev) => {
          const next: Record<string, DeviceRow> = {};
          Object.entries(telemMap).forEach(([deviceId, value]) => {
            const merged = mergeTelemetry(prev[deviceId], value);
            if (merged) next[deviceId] = merged;
          });
          return next;
        });
      } else throw Error("The live fleet could not be refreshed.");
    } catch (cause) {
      setMapError(cause instanceof Error ? cause.message : "The live fleet could not be refreshed.");
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
    }, 5000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    if (
      devices.length === 0 ||
      process.env.NEXT_PUBLIC_LIVE_WEBSOCKET_ENABLED === "false"
    )
      return;
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

      socket.onopen = async () => {
        try {
          const ticket = await realtimeTicket();
          if (!closed && socket?.readyState === WebSocket.OPEN)
            socket.send(`CONNECT\naccept-version:1.2\nheart-beat:0,0\nauthorization:Bearer ${ticket}\n\n\0`);
        } catch { socket?.close(); }
      };
      socket.onmessage = (event) => {
        stompBuffer += String(event.data);
        if (stompBuffer.includes("CONNECTED")) {
          socket?.send(
            "SUBSCRIBE\nid:sub-live-telemetry\ndestination:/topic/telemetry\n\n\0",
          );
        }
        parseStompBodies(stompBuffer).forEach((payload) => {
          const deviceId = String(payload.deviceId ?? "");
          if (!deviceIds.has(deviceId)) return;
          setTelemetry((prev) => ({
            ...prev,
            [deviceId]: mergeTelemetry(prev[deviceId], payload) ?? payload,
          }));
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
    if (["Objects", "History", "Trips"].includes(activePanelTab)) {
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
        const res = await fetch(`/api/live-tracking?${params}`, {
          cache: "no-store",
        });
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
        return key && !addresses[key]
          ? { key, lat: Number(t?.latitude), lng: Number(t?.longitude) }
          : null;
      })
      .filter((item): item is { key: string; lat: number; lng: number } =>
        Boolean(item),
      );

    if (pending.length === 0) return;

    let cancelled = false;
    pending.slice(0, 6).forEach(async ({ key, lat, lng }) => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&types=address,poi,place,locality,neighborhood&limit=1`,
          { cache: "force-cache" },
        );
        const data = await res.json();
        const place = data?.features?.[0]?.place_name;
        if (!cancelled && place) {
          setAddresses((prev) =>
            prev[key] ? prev : { ...prev, [key]: place },
          );
        }
      } catch {
        // Keep coordinate fallback when reverse geocoding is unavailable.
      }
    });

    return () => {
      cancelled = true;
    };
  }, [addresses, devices, telemetry]);

  const handleShare = (e: React.MouseEvent, d: DeviceRow) => {
    e.stopPropagation();
    const t = telemetry[d.id];
    const text = `${shortName(d)}\n${coords(t ?? null)}\nSpeed: ${Math.round(Number(t?.speedKph ?? 0))} km/h`;
    if (navigator.share)
      navigator.share({ title: shortName(d), text }).catch(() => {});
    else
      navigator.clipboard
        .writeText(text)
        .then(() => notify(`Info copied for ${shortName(d)}`));
  };

  const copyCoordinates = (e: React.MouseEvent, telem: DeviceRow | null) => {
    e.stopPropagation();
    navigator.clipboard
      .writeText(coords(telem))
      .then(() => notify("Coordinates copied"));
  };

  const selectedDevice = selected
    ? (devices.find((d) => d.id === selected) ?? null)
    : null;
  const detailsDevice = detailsDeviceId
    ? (devices.find((d) => d.id === detailsDeviceId) ?? null)
    : null;

  const statusCounts = useMemo(() => {
    const counts = {
      all: devices.length,
      moving: 0,
      idle: 0,
      stopped: 0,
      offline: 0,
    };
    devices.forEach((d) => {
      counts[statKey(telemetry[d.id] ?? null)] += 1;
    });
    return counts;
  }, [devices, telemetry]);

  const visibleDevices = useMemo(() => {
    const query = vehicleSearch.trim().toLowerCase();
    return devices
      .filter((d) => {
        const telem = telemetry[d.id] ?? null;
        const statusMatches =
          activeStatus === "all" || statKey(telem) === activeStatus;
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
      })
      .sort(
        (a, b) =>
          Number(pins.includes(String(b.id))) -
            Number(pins.includes(String(a.id))) ||
          (latestTime(telemetry[b.id] ?? null) ?? 0) -
            (latestTime(telemetry[a.id] ?? null) ?? 0),
      );
  }, [activeStatus, devices, telemetry, vehicleSearch, pins]);
  const focusedMarkerId =
    selected ??
    (vehicleSearch.trim() && visibleDevices.length === 1
      ? String(visibleDevices[0].id)
      : "");

  const markers: MarkerData[] = useMemo(
    () =>
      visibleDevices
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
          const location = locationLine(
            d,
            t ?? null,
            addresses[addressKey(t ?? null) ?? ""],
          );
          const coordinateText = coords(t ?? null);
          const today = todayDistance(t ?? null, d);
          const voltage = batteryVoltage(t ?? null, d);
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
                <div class="tp-popup-title">${escapeHtml(title)}</div>
                <div class="tp-popup-status">
                  <strong>${escapeHtml(statusText(t ?? null))}</strong>
                  ${today ? `<span>| Today: ${escapeHtml(today)}</span>` : ""}
                </div>
                <div class="tp-popup-muted">Last data received ${escapeHtml(timeAgo(t.receivedAt ?? t.eventTime))}</div>
                <div class="tp-popup-location">${escapeHtml(location)}</div>
                <div class="tp-popup-coords">${escapeHtml(coordinateText)}</div>
                ${d.driverName ? `<div class="tp-popup-row">Driver: <strong>${escapeHtml(d.driverName)}</strong></div>` : ""}
                <div class="tp-popup-row">Battery: <strong>${escapeHtml(voltage)}</strong></div>
                <div class="tp-popup-actions">
                  <a href="/app/history?deviceId=${encodeURIComponent(d.id)}">History</a>
                  <a href="/app/devices/${encodeURIComponent(d.id)}">Device details</a>
                </div>
              </div>
            `,
          };
        }),
    [addresses, visibleDevices, telemetry],
  );

  function downloadVehicles() {
    const cell = (value: unknown) => {
      const text = String(value ?? "");
      const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
      return `"${safe.replace(/"/g, '""')}"`;
    };
    const rows = visibleDevices.map((device) => {
      const point = telemetry[device.id] ?? null;
      return [
        shortName(device),
        device.vehiclePlate ?? device.plateNumber,
        device.imei,
        statKey(point),
        point?.speedKph,
        point?.latitude,
        point?.longitude,
        point?.receivedAt ?? point?.eventTime,
      ];
    });
    const csv = [
      [
        "Vehicle",
        "Plate",
        "IMEI",
        "Status",
        "Speed (km/h)",
        "Latitude",
        "Longitude",
        "Last received",
      ],
      ...rows,
    ]
      .map((row) => row.map(cell).join(","))
      .join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `live-vehicles-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="st-live-layout">
      {streamDevice && (
        <LiveStreamModal
          deviceId={streamDevice.id}
          name={streamDevice.name}
          onClose={() => setStreamDevice(null)}
        />
      )}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
      {mapError && <div className="st-map-error" role="alert">{mapError}<button className="st-button" onClick={() => void load(true)}>Retry</button></div>}
      {detailsDevice && (
        <VehicleDetailsModal
          device={detailsDevice}
          telem={telemetry[detailsDevice.id] ?? null}
          address={locationLine(
            detailsDevice,
            telemetry[detailsDevice.id] ?? null,
            addresses[addressKey(telemetry[detailsDevice.id] ?? null) ?? ""],
          )}
          onClose={() => setDetailsDeviceId(null)}
          onControl={handleAssetControl}
        />
      )}
      <div className="st-live-canvas">
        <MapboxMap
          markers={markers}
          flyToId={focusedMarkerId}
          center={[3.3792, 6.5244]}
          zoom={12}
          style={MAP_STYLES.find((item) => item.id === mapStyle)?.style}
          className="h-full w-full"
          onMarkerClick={setSelected}
        />
      </div>
      {vehiclePanelOpen && (
        <aside id="st-vehicle-panel" className={`st-live-list${visibleDevices.length ? "" : " is-empty"}`} aria-label="Fleet">
          <div className="st-live-list-head">
            <div className="st-live-list-title">
              <button className="st-icon-button st-fleet-collapse" aria-label="Collapse fleet panel" title="Collapse fleet panel" aria-expanded="true" aria-controls="st-vehicle-panel" onClick={()=>setVehiclePanelOpen(false)}><FiNavigation /></button>
              <button type="button" onClick={() => setActiveStatus("all")}>
                <strong>Fleet</strong>
                <span>{devices.length}</span>
              </button>
              <div>
                <button
                  className="st-icon-button"
                  aria-label="Refresh vehicles"
                  onClick={() => void load(true)}
                >
                  <FiRefreshCw size={16} />
                </button>
                <details className="st-live-filter">
                  <summary
                    className="st-icon-button"
                    aria-label="Filter vehicles"
                  >
                    <FiSliders size={16} />
                  </summary>
                  <div className="st-popover">
                    <label className="st-field">
                      <span>Vehicle status</span>
                      <select
                        className="st-input"
                        value={activeStatus}
                        onChange={(event) =>
                          setActiveStatus(
                            event.target.value as typeof activeStatus,
                          )
                        }
                      >
                        {STATUS_FILTERS.map((item) => (
                          <option key={item.key} value={item.key}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      className="st-button st-small"
                      onClick={downloadVehicles}
                    >
                      Export visible vehicles
                    </button>
                  </div>
                </details>
              </div>
            </div>
            <label className="st-search">
              <FiSearch size={15} />
              <input
                value={vehicleSearch}
                onChange={(event) => setVehicleSearch(event.target.value)}
                aria-label="Search live fleet"
                placeholder="Search fleet"
              />
            </label>
            <VehicleStatusSummary
              counts={statusCounts}
              active={activeStatus}
              onChange={setActiveStatus}
            />
          </div>
          <div className="st-live-rows">
            {loading ? (
              <div className="st-empty" role="status">
                Loading vehicles…
              </div>
            ) : !visibleDevices.length ? (
              <div className="st-empty">
                {devices.length
                  ? "No vehicles match your filters."
                  : "No vehicles registered yet."}
              </div>
            ) : (
              visibleDevices.map((device) => {
                const point = telemetry[device.id] ?? null,
                  key = statKey(point),
                  status = key === "offline" ? "inactive" : key,
                  location = locationLine(
                    device,
                    point,
                    addresses[addressKey(point) ?? ""],
                  ),
                  trackerCount = device.vehiclePlate
                    ? devices.filter(
                        (row) => row.vehiclePlate === device.vehiclePlate,
                      ).length
                    : 1,
                  isPinned = pins.includes(String(device.id));
                return (
                  <article
                    key={device.id}
                    className={`st-vehicle-row${selected === device.id ? " is-selected" : ""}`}
                    tabIndex={0}
                    role="button"
                    aria-label={`Select ${shortName(device)}`}
                    onClick={() => setSelected(device.id)}
                    onKeyDown={(event) => {
                      if (
                        event.target === event.currentTarget &&
                        ["Enter", " "].includes(event.key)
                      ) {
                        event.preventDefault();
                        setSelected(device.id);
                      }
                    }}
                  >
                    <div className="st-vehicle-row-top">
                      <span className="st-vehicle-plate">
                        <strong title={shortName(device)}>
                          {shortName(device)}
                        </strong>
                        {trackerCount > 1 && (
                          <span
                            className="st-tracker-count"
                            title={`${trackerCount} trackers`}
                          >
                            {trackerCount}
                          </span>
                        )}
                        <button
                          className={`st-pin${isPinned ? " is-pinned" : ""}`}
                          aria-label={`${isPinned ? "Unpin" : "Pin"} ${shortName(device)}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            setPins((current) =>
                              isPinned
                                ? current.filter(
                                    (id) => id !== String(device.id),
                                  )
                                : [...current, String(device.id)],
                            );
                          }}
                        >
                          <FiMapPin size={12} />
                        </button>
                      </span>
                      <span className={`st-status st-status-${status}`}>
                        {status[0].toUpperCase() + status.slice(1)}
                      </span>
                      <span className="st-vehicle-age">
                        {timeAgo(point?.receivedAt ?? point?.eventTime)}
                      </span>
                    </div>
                    <div className="st-vehicle-row-bottom">
                      <span title={location}>{location}</span>
                      <strong>
                        {isRecentlyReporting(point) && point?.speedKph != null
                          ? Math.round(Number(point.speedKph)) + " km/h"
                          : "—"}
                      </strong>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </aside>
      )}
      {!vehiclePanelOpen&&<button
        className="st-live-reopen"
        aria-label="Show fleet panel"
        title="Show fleet panel"
        aria-expanded="false"
        aria-controls="st-vehicle-panel"
        onClick={() => setVehiclePanelOpen(open => !open)}
      >
        <FiNavigation />
      </button>}
      <div
        className={`st-map-tools${!vehiclePanelOpen ? " is-list-closed" : ""}`}
      >
        <div className="st-map-tool-group">
          <button
            aria-label="Recenter map"
            onClick={() => window.dispatchEvent(new CustomEvent("st-map:fit"))}
          >
            <FiNavigation />
          </button>
          <details>
            <summary aria-label="Map style">
              <FiLayers />
            </summary>
            <div className="st-popover st-map-style-menu">
              {MAP_STYLES.map((item) => (
                <button
                  key={item.id}
                  className={mapStyle === item.id ? "is-active" : ""}
                  onClick={() => setMapStyle(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </details>
          <button
            aria-label="Full screen map"
            onClick={() => {
              const node = document.querySelector(".st-live-layout");
              if (document.fullscreenElement) void document.exitFullscreen();
              else if (node)
                void node
                  .requestFullscreen()
                  .catch(() => notify("Full screen is not available."));
            }}
          >
            <FiMaximize />
          </button>
        </div>
        {selectedDevice && (
          <div className="st-map-tool-group">
            <button
              aria-label="Share selected vehicle"
              onClick={(event) => handleShare(event, selectedDevice)}
            >
              <FiShare2 />
            </button>
            <button
              aria-label="Driver details"
              onClick={() => setDetailsDeviceId(selectedDevice.id)}
            >
              <FiUser />
            </button>
            <button
              aria-label="Copy vehicle coordinates"
              onClick={(event) =>
                copyCoordinates(event, telemetry[selectedDevice.id] ?? null)
              }
            >
              <FiCopy />
            </button>
          </div>
        )}
      </div>
      {selectedDevice && (
        <button
          className="st-exit-focus"
          onClick={() => {
            setSelected(null);
            setFuelOpen(false);
            setActivePanelTab("Objects");
          }}
        >
          <FiX size={14} />
          Exit focus
        </button>
      )}
      <nav className="st-map-dock" aria-label="Map tools">
        <button disabled={!canReadModule(account,"history")} title={!canReadModule(account,"history") ? "History is not enabled for your role or account" : "Recorded trips"} onClick={() => { setActivePanelTab(activePanelTab === "Trips" ? "Objects" : "Trips"); setFuelOpen(false); }} aria-pressed={activePanelTab === "Trips"}><FiActivity /><span>Trips</span></button>
        <button
          onClick={() => {
            setActivePanelTab(
              activePanelTab === "Geofence" ? "Objects" : "Geofence",
            );
            setFuelOpen(false);
          }}
          aria-pressed={activePanelTab === "Geofence"}
        >
          <FiMapPin />
          <span>Geofences</span>
        </button>
        <button
          onClick={() => {
            setActivePanelTab(
              activePanelTab === "Landmark" ? "Objects" : "Landmark",
            );
            setFuelOpen(false);
          }}
          aria-pressed={activePanelTab === "Landmark"}
        >
          <FiNavigation />
          <span>POIs</span>
        </button>
        <button
          onClick={() => {
            setActivePanelTab(
              activePanelTab === "Notifications" ? "Objects" : "Notifications",
            );
            setFuelOpen(false);
          }}
          aria-pressed={activePanelTab === "Notifications"}
        >
          <FiAlertTriangle />
          <span>Alerts</span>
        </button>
        <hr />
        <button
          disabled={!selectedDevice}
          title={!selectedDevice ? "Select a vehicle first" : "Vehicle details"}
          onClick={() =>
            selectedDevice && setDetailsDeviceId(selectedDevice.id)
          }
        >
          <FiInfo />
          <span>Details</span>
        </button>
        <button
          disabled={!selectedDevice}
          title={
            !selectedDevice ? "Select a vehicle first" : "History and replay"
          }
          onClick={() => {
            setActivePanelTab(
              activePanelTab === "History" ? "Objects" : "History",
            );
            setFuelOpen(false);
          }}
          aria-pressed={activePanelTab === "History"}
        >
          <FiPlay />
          <span>Replay</span>
        </button>
        <button
          disabled={!selectedDevice}
          title={!selectedDevice ? "Select a vehicle first" : "Remote control"}
          onClick={() =>
            selectedDevice && setDetailsDeviceId(selectedDevice.id)
          }
        >
          <FiLock />
          <span>Control</span>
        </button>
        <button
          disabled={!selectedDevice}
          title={!selectedDevice ? "Select a vehicle first" : "Fuel history"}
          onClick={() => {
            setFuelOpen((value) => !value);
            setActivePanelTab("Objects");
          }}
          aria-pressed={fuelOpen}
        >
          <FiDroplet />
          <span>Fuel</span>
        </button>
        <button
          disabled={!selectedDevice || !dashcamByVehicle[selectedDevice.id]}
          title={
            !selectedDevice
              ? "Select a vehicle first"
              : !dashcamByVehicle[selectedDevice.id]
                ? "No camera assigned"
                : "Live video"
          }
          onClick={() => {
            const camera =
              selectedDevice && dashcamByVehicle[selectedDevice.id];
            if (camera)
              setStreamDevice({
                id: String(camera.id),
                name: fieldText(camera.name, shortName(selectedDevice!)),
              });
          }}
        >
          <FiCamera />
          <span>Video</span>
        </button>
      </nav>
      {(activePanelTab !== "Objects" || fuelOpen) && (
        <aside
          className="st-live-drawer"
          aria-label={
            fuelOpen
              ? "Fuel"
              : activePanelTab === "History"
                ? "History and replay"
                : activePanelTab
          }
        >
          <header>
            <strong>
              {fuelOpen
                ? "Fuel"
                : activePanelTab === "History"
                  ? "History & replay"
                  : activePanelTab === "Geofence"
                    ? "Geofences"
                    : activePanelTab === "Landmark"
                      ? "POIs"
                      : activePanelTab === "Trips" ? "Trips" : "Alerts"}
            </strong>
            <button
              className="st-icon-button"
              aria-label="Close map drawer"
              onClick={() => {
                setActivePanelTab("Objects");
                setFuelOpen(false);
              }}
            >
              <FiX />
            </button>
          </header>
          <div className="st-live-drawer-body">
            {activePanelTab === "Trips" ? <MapTripsPanel key={selected ?? "fleet"} devices={devices.map((device) => ({ id: String(device.id), vehiclePlate: device.vehiclePlate, name: device.name }))} selectedId={selected} /> : fuelOpen && selectedDevice ? (
              <MapFuelPanel
                key={selectedDevice.id}
                deviceId={selectedDevice.id}
                latest={fuelByVehicle[selectedDevice.id] ?? null}
              />
            ) : (
              <LiveTabPanel
                tab={activePanelTab}
                rows={tabRows}
                loading={tabLoading}
                devices={devices}
                selectedDeviceId={selected}
                notificationPreset={notificationPreset}
              />
            )}
          </div>
        </aside>
      )}
    </div>
  );
}

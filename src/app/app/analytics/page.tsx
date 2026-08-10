"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiActivity,
  FiBatteryCharging,
  FiClock,
  FiMapPin,
  FiNavigation,
  FiRefreshCw,
  FiTruck,
  FiWifi,
  FiZap,
} from "react-icons/fi";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

const STATUS_COLORS = {
  moving: "#22C55E",
  idle: "#F59E0B",
  stopped: "#EF334A",
  offline: "#94A3B8",
};

function listFrom(data: unknown): Row[] {
  if (Array.isArray(data)) return data as Row[];
  if (data && typeof data === "object" && Array.isArray((data as Row).content)) return (data as Row).content;
  return [];
}

function numberFrom(...values: unknown[]) {
  for (const value of values) {
    if (value == null || value === "") continue;
    const parsed = Number(String(value).replace(/[^0-9.-]/g, ""));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function latestTime(row: Row | null) {
  const value = row?.receivedAt ?? row?.eventTime ?? row?.timestamp ?? row?.updatedAt ?? row?.lastSeenAt;
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
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
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function isRecent(row: Row | null) {
  const time = latestTime(row);
  return Boolean(time && Date.now() - time < 15 * 60 * 1000);
}

function isIgnitionOn(row: Row | null) {
  return Boolean(row?.ignition) || Number(row?.speedKph ?? 0) > 5 || isRecent(row);
}

function statusKey(row: Row | null): keyof typeof STATUS_COLORS {
  if (!row) return "offline";
  const speed = Number(row.speedKph ?? 0);
  if (speed > 5) return "moving";
  if (isIgnitionOn(row)) return "idle";
  if (isRecent(row)) return "idle";
  return "stopped";
}

function vehicleName(device: Row) {
  return String(device.name ?? device.vehiclePlate ?? device.plateNumber ?? device.imei ?? "Vehicle");
}

function formatKm(value: number) {
  return `${value.toFixed(value >= 100 ? 0 : 1)} km`;
}

function distanceKm(telem: Row | null) {
  const odometerM = numberFrom(telem?.odometerM, telem?.odometerMeters, telem?.odometer_m);
  if (odometerM && odometerM > 0) return odometerM / 1000;
  const km = numberFrom(telem?.distanceKm, telem?.todayKm, telem?.tripKm, telem?.mileageKm);
  if (km && km > 0) return km;
  const meters = numberFrom(telem?.distanceM, telem?.todayDistanceM, telem?.tripDistanceM);
  if (meters && meters > 0) return meters / 1000;
  return 0;
}

function batteryVoltage(telem: Row | null) {
  const mv = numberFrom(telem?.voltageMv, telem?.batteryVoltageMv, telem?.vehicleVoltageMv, telem?.externalVoltageMv);
  if (mv && mv > 0) return mv / 1000;
  const volts = numberFrom(telem?.voltage, telem?.batteryVoltage, telem?.vehicleVoltage, telem?.externalVoltage);
  if (volts && volts > 0) return volts > 100 ? volts / 1000 : volts;
  return null;
}

function alertTime(alert: Row) {
  return alert.alertTime ?? alert.eventTime ?? alert.receivedAt ?? alert.createdAt ?? null;
}

function compactAlertType(value: unknown) {
  return String(value ?? "Alert")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((part, index) => (index === 0 ? part : `${part.charAt(0).toUpperCase()}${part.slice(1)}`))
    .join("");
}

function MetricCard({
  href,
  icon,
  label,
  value,
  helper,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-[#dbe5ee] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.1)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg text-white" style={{ background: color }}>
          {icon}
        </div>
        <FiArrowRight className="mt-1 text-[#94a3b8] transition group-hover:translate-x-0.5 group-hover:text-[#0D4A47]" size={16} />
      </div>
      <div className="mt-5 text-2xl font-extrabold leading-none text-[#061337]">{value}</div>
      <div className="mt-2 text-sm font-bold text-[#0D4A47]">{label}</div>
      <div className="mt-1 text-xs font-medium text-[#64748b]">{helper}</div>
    </Link>
  );
}

export default function AnalyticsPage() {
  const [devices, setDevices] = useState<Row[]>([]);
  const [telemetry, setTelemetry] = useState<Record<string, Row>>({});
  const [alerts, setAlerts] = useState<Row[]>([]);
  const [geofences, setGeofences] = useState<Row[]>([]);
  const [history, setHistory] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [deviceRes, alertRes, geofenceRes, historyRes] = await Promise.all([
        fetch("/api/devices", { cache: "no-store" }),
        fetch("/api/telemetry?type=alerts&unacknowledgedOnly=false", { cache: "no-store" }),
        fetch("/api/geofences", { cache: "no-store" }),
        fetch("/api/live-tracking?tab=history&limit=80", { cache: "no-store" }),
      ]);

      if (deviceRes.status === 401) {
        setError("Your session expired. Please log in again.");
        return;
      }

      const deviceList = deviceRes.ok ? listFrom(await deviceRes.json().catch(() => [])) : [];
      setDevices(deviceList);
      setAlerts(alertRes.ok ? listFrom(await alertRes.json().catch(() => [])) : []);
      setGeofences(geofenceRes.ok ? listFrom(await geofenceRes.json().catch(() => [])) : []);
      setHistory(historyRes.ok ? listFrom(await historyRes.json().catch(() => [])) : []);

      const latestResults = await Promise.allSettled(
        deviceList.map((device) =>
          fetch(`/api/telemetry?type=latest&deviceId=${encodeURIComponent(String(device.id))}`, { cache: "no-store" })
            .then((res) => (res.ok && res.status !== 204 ? res.json() : null))
        )
      );
      const nextTelemetry: Record<string, Row> = {};
      latestResults.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          nextTelemetry[String(deviceList[index].id)] = result.value;
        }
      });
      setTelemetry(nextTelemetry);
    } catch {
      setError("Analytics data is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const id = window.setInterval(load, 30000);
    return () => window.clearInterval(id);
  }, []);

  const analytics = useMemo(() => {
    const status = { moving: 0, idle: 0, stopped: 0, offline: 0 };
    let totalDistance = 0;
    let speedTotal = 0;
    let speedCount = 0;
    let voltageTotal = 0;
    let voltageCount = 0;

    devices.forEach((device) => {
      const t = telemetry[String(device.id)] ?? null;
      status[statusKey(t)] += 1;
      totalDistance += distanceKm(t);
      const speed = numberFrom(t?.speedKph);
      if (speed != null) {
        speedTotal += speed;
        speedCount += 1;
      }
      const volts = batteryVoltage(t);
      if (volts != null) {
        voltageTotal += volts;
        voltageCount += 1;
      }
    });

    const dayStart = Date.now() - 24 * 60 * 60 * 1000;
    const recentAlerts = alerts.filter((alert) => {
      const time = alertTime(alert);
      if (!time) return false;
      const ms = new Date(time).getTime();
      return Number.isFinite(ms) && ms >= dayStart;
    });

    return {
      status,
      totalDistance,
      avgSpeed: speedCount ? speedTotal / speedCount : 0,
      avgVoltage: voltageCount ? voltageTotal / voltageCount : null,
      recentAlerts,
      criticalAlerts: recentAlerts.filter((alert) => String(alert.severity ?? "").toUpperCase() === "CRITICAL").length,
      online: status.moving + status.idle,
    };
  }, [alerts, devices, telemetry]);

  const activeVehicles = useMemo(
    () =>
      devices
        .map((device) => ({ device, telemetry: telemetry[String(device.id)] ?? null }))
        .sort((a, b) => (latestTime(b.telemetry) ?? 0) - (latestTime(a.telemetry) ?? 0))
        .slice(0, 6),
    [devices, telemetry]
  );

  const latestAlerts = useMemo(
    () =>
      [...alerts]
        .sort((a, b) => new Date(alertTime(b) ?? 0).getTime() - new Date(alertTime(a) ?? 0).getTime())
        .slice(0, 6),
    [alerts]
  );

  return (
    <div className="min-h-full bg-[#f3f7fa] p-4 text-[#061337] md:p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-widest text-[#1A7A75]">Analytics</div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-[#061337]">Fleet performance dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#64748b]">
            Live operational metrics from your devices, telemetry, alerts, geofences, and route history.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#dbe5ee] bg-white px-4 text-sm font-bold text-[#0D4A47] shadow-sm"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} size={15} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#b91c1c]">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard href="/app/devices" icon={<FiTruck size={19} />} label="Total assets" value={loading ? "..." : String(devices.length)} helper={`${analytics.online} reporting now`} color="#0D4A47" />
        <MetricCard href="/app/devices" icon={<FiActivity size={19} />} label="Running" value={loading ? "..." : String(analytics.status.moving)} helper={`${analytics.status.idle} idling, ${analytics.status.stopped} stopped`} color="#22C55E" />
        <MetricCard href="/app/alerts" icon={<FiAlertTriangle size={19} />} label="Alerts last 24h" value={loading ? "..." : String(analytics.recentAlerts.length)} helper={`${analytics.criticalAlerts} critical alerts`} color="#EF334A" />
        <MetricCard href="/app/geofences" icon={<FiMapPin size={19} />} label="Geofences" value={loading ? "..." : String(geofences.length)} helper="Open zone management" color="#2563EB" />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        <Link href="/app/history" className="rounded-xl border border-[#dbe5ee] bg-white p-4 shadow-sm transition hover:border-[#0D4A47]/30">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0D4A47]"><FiNavigation size={16} /> Distance</div>
          <div className="mt-3 text-2xl font-extrabold text-[#061337]">{formatKm(analytics.totalDistance)}</div>
          <div className="mt-1 text-xs font-medium text-[#64748b]">Reported odometer/trip distance</div>
        </Link>
        <Link href="/app/history/routes" className="rounded-xl border border-[#dbe5ee] bg-white p-4 shadow-sm transition hover:border-[#0D4A47]/30">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0D4A47]"><FiZap size={16} /> Average speed</div>
          <div className="mt-3 text-2xl font-extrabold text-[#061337]">{Math.round(analytics.avgSpeed)} km/h</div>
          <div className="mt-1 text-xs font-medium text-[#64748b]">Across latest device telemetry</div>
        </Link>
        <Link href="/app/reports" className="rounded-xl border border-[#dbe5ee] bg-white p-4 shadow-sm transition hover:border-[#0D4A47]/30">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0D4A47]"><FiClock size={16} /> History points</div>
          <div className="mt-3 text-2xl font-extrabold text-[#061337]">{history.length}</div>
          <div className="mt-1 text-xs font-medium text-[#64748b]">Recent tracking records</div>
        </Link>
        <Link href="/app/maintenance" className="rounded-xl border border-[#dbe5ee] bg-white p-4 shadow-sm transition hover:border-[#0D4A47]/30">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0D4A47]"><FiBatteryCharging size={16} /> Avg. voltage</div>
          <div className="mt-3 text-2xl font-extrabold text-[#061337]">{analytics.avgVoltage ? `${analytics.avgVoltage.toFixed(2)} V` : "--"}</div>
          <div className="mt-1 text-xs font-medium text-[#64748b]">Vehicle battery telemetry</div>
        </Link>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-xl border border-[#dbe5ee] bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-[#edf2f6] px-4 py-3">
            <div>
              <h2 className="text-sm font-extrabold text-[#061337]">Active assets</h2>
              <p className="text-xs font-medium text-[#64748b]">Latest location and movement status</p>
            </div>
            <Link href="/app/devices" className="text-xs font-bold text-[#0D4A47]">View map</Link>
          </div>
          <div className="divide-y divide-[#edf2f6]">
            {activeVehicles.length === 0 ? (
              <div className="p-6 text-center text-sm font-semibold text-[#94a3b8]">No live telemetry yet.</div>
            ) : (
              activeVehicles.map(({ device, telemetry: t }) => {
                const key = statusKey(t);
                return (
                  <Link key={String(device.id)} href={`/app/devices/${encodeURIComponent(String(device.id))}`} className="grid gap-3 px-4 py-3 transition hover:bg-[#f8fafc] sm:grid-cols-[1fr_110px_110px_100px] sm:items-center">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-[#061337]">{vehicleName(device)}</div>
                      <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-[#64748b]">
                        <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLORS[key] }} />
                        {key.toUpperCase()} · {timeAgo(t?.receivedAt ?? t?.eventTime)}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-[#536987]">{Math.round(Number(t?.speedKph ?? 0))} km/h</div>
                    <div className="text-xs font-bold text-[#536987]">{batteryVoltage(t) ? `${batteryVoltage(t)?.toFixed(2)} V` : "No voltage"}</div>
                    <div className="text-xs font-bold text-[#0D4A47]">Open <FiArrowRight className="inline" size={12} /></div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-xl border border-[#dbe5ee] bg-white shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-[#edf2f6] px-4 py-3">
            <div>
              <h2 className="text-sm font-extrabold text-[#061337]">Recent alerts</h2>
              <p className="text-xs font-medium text-[#64748b]">Newest fleet events</p>
            </div>
            <Link href="/app/alerts" className="text-xs font-bold text-[#0D4A47]">View all</Link>
          </div>
          <div className="divide-y divide-[#edf2f6]">
            {latestAlerts.length === 0 ? (
              <div className="p-6 text-center text-sm font-semibold text-[#94a3b8]">No alerts recorded yet.</div>
            ) : (
              latestAlerts.map((alert, index) => (
                <Link key={String(alert.id ?? index)} href="/app/alerts" className="block px-4 py-3 transition hover:bg-[#f8fafc]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-[#061337]">{compactAlertType(alert.alertType ?? alert.type)}</div>
                      <div className="mt-1 line-clamp-2 text-xs font-medium text-[#64748b]">{String(alert.message ?? "Fleet alert triggered")}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#f1f5f9] px-2 py-1 text-[10px] font-bold text-[#536987]">
                      {timeAgo(alertTime(alert))}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {[
          { label: "Moving", value: analytics.status.moving, href: "/app/devices", color: STATUS_COLORS.moving },
          { label: "Idling", value: analytics.status.idle, href: "/app/devices", color: STATUS_COLORS.idle },
          { label: "Stopped", value: analytics.status.stopped, href: "/app/devices", color: STATUS_COLORS.stopped },
          { label: "Offline", value: analytics.status.offline, href: "/app/devices/states", color: STATUS_COLORS.offline },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-xl border border-[#dbe5ee] bg-white px-4 py-3 shadow-sm transition hover:border-[#0D4A47]/30">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ background: item.color }} />
              <span className="text-sm font-bold text-[#536987]">{item.label}</span>
            </div>
            <span className="text-lg font-extrabold text-[#061337]">{loading ? "..." : item.value}</span>
          </Link>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-[#dbe5ee] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0D4A47]">
          <FiWifi size={16} />
          Data refreshes every 30 seconds from live backend APIs.
        </div>
      </div>
    </div>
  );
}

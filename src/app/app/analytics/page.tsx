"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiActivity,
  FiCheck,
  FiCpu,
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

type FleetInsight = {
  id: string;
  type: string;
  category: string;
  severity: string;
  title: string;
  summary: string;
  reason?: string;
  entityId?: string;
  entityName?: string;
  metric?: Record<string, unknown>;
  recommendedAction: string;
  status: string;
  lastObservedAt: string;
};

type InsightDashboard = {
  fleetHealthScore: number;
  healthFormula: string;
  summary: { critical: number; high: number; medium: number; low: number; info: number };
  categories: Record<string, number>;
  topInsights: FleetInsight[];
};

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: "border-red-200 bg-red-50 text-red-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  LOW: "border-blue-200 bg-blue-50 text-blue-700",
  INFO: "border-slate-200 bg-slate-50 text-slate-600",
};

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

function VisualMetricCard({
  href,
  icon,
  label,
  value,
  helper,
  color,
  image,
  imageAlt,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
  color: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <Link
      href={href}
      className="group relative min-h-[124px] overflow-hidden rounded-lg border border-[#dbe5ee] bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(15,23,42,0.11)]"
    >
      <div className="absolute inset-y-0 right-0 w-[58%] opacity-90">
        <Image src={image} alt={imageAlt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain object-right-bottom" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/35" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="grid h-7 w-7 place-items-center rounded-md text-white shadow-sm" style={{ background: color }}>
          {icon}
        </div>
        <FiArrowRight className="mt-1 text-[#94a3b8] transition group-hover:translate-x-0.5 group-hover:text-[#0D4A47]" size={14} />
      </div>
      <div className="relative z-10 mt-6 text-2xl font-extrabold leading-none text-[#061337]">{value}</div>
      <div className="relative z-10 mt-1 text-xs font-extrabold text-[#0D4A47]">{label}</div>
      <div className="relative z-10 mt-0.5 max-w-[145px] text-[10px] font-semibold leading-snug text-[#64748b]">{helper}</div>
    </Link>
  );
}

function CompactMetric({
  href,
  icon,
  label,
  value,
  helper,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  helper: string;
  children?: React.ReactNode;
}) {
  return (
    <Link href={href} className="relative overflow-hidden rounded-lg border border-[#dbe5ee] bg-white p-3 shadow-sm transition hover:border-[#0D4A47]/30">
      <div className="flex items-center gap-2 text-[11px] font-extrabold text-[#0D4A47]">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-xl font-extrabold leading-none text-[#061337]">{value}</div>
      <div className="mt-1 text-[10px] font-semibold text-[#64748b]">{helper}</div>
      {children}
    </Link>
  );
}

function Sparkline() {
  return (
    <svg className="mt-2 h-12 w-full" viewBox="0 0 240 58" role="img" aria-label="Distance trend">
      <path d="M0 37 C18 20 36 21 54 34 S91 52 112 27 S151 6 173 24 S212 51 240 19" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M0 58 L0 37 C18 20 36 21 54 34 S91 52 112 27 S151 6 173 24 S212 51 240 19 L240 58 Z" fill="#eef2f7" opacity="0.8" />
      <circle cx="54" cy="34" r="3" fill="#061337" />
      <circle cx="173" cy="24" r="3" fill="#061337" />
      <circle cx="230" cy="23" r="5" fill="#1A7A75" />
    </svg>
  );
}

function DotsGraph({ count }: { count: number }) {
  const dots = Array.from({ length: 56 }, (_, index) => index);
  return (
    <div className="mt-3 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-1">
      {dots.map((dot) => (
        <span
          key={dot}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: dot < Math.min(count, dots.length) ? "#0D4A47" : "#dbe5ee", opacity: dot % 5 === 0 ? 0.45 : 1 }}
        />
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [devices, setDevices] = useState<Row[]>([]);
  const [telemetry, setTelemetry] = useState<Record<string, Row>>({});
  const [alerts, setAlerts] = useState<Row[]>([]);
  const [geofences, setGeofences] = useState<Row[]>([]);
  const [history, setHistory] = useState<Row[]>([]);
  const [insights, setInsights] = useState<InsightDashboard | null>(null);
  const [insightCategory, setInsightCategory] = useState("ALL");
  const [insightSeverity, setInsightSeverity] = useState("ALL");
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [deviceRes, alertRes, geofenceRes, historyRes, insightRes] = await Promise.all([
        fetch("/api/devices", { cache: "no-store" }),
        fetch("/api/telemetry?type=alerts&unacknowledgedOnly=false", { cache: "no-store" }),
        fetch("/api/geofences", { cache: "no-store" }),
        fetch("/api/live-tracking?tab=history&limit=80", { cache: "no-store" }),
        fetch("/api/assistant/insights?limit=30", { cache: "no-store" }),
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
      setInsights(insightRes.ok ? await insightRes.json().catch(() => null) : null);

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

  async function acknowledgeInsight(id: string) {
    const response = await fetch(`/api/assistant/insights/${encodeURIComponent(id)}/acknowledge`, {
      method: "POST",
      credentials: "same-origin",
    });
    if (response.ok) {
      setInsights((current) => current ? {
        ...current,
        topInsights: current.topInsights.map((item) => item.id === id ? { ...item, status: "ACKNOWLEDGED" } : item),
      } : current);
    }
  }

  function askFleetAi(insight: FleetInsight) {
    window.dispatchEvent(new CustomEvent("fleet-ai:ask", {
      detail: { question: `Explain this ${insight.severity.toLowerCase()} fleet insight for ${insight.entityName ?? "my fleet"}: ${insight.title}. What should I do next?` },
    }));
  }

  const visibleInsights = useMemo(() => (insights?.topInsights ?? []).filter((item) =>
    (insightCategory === "ALL" || item.category === insightCategory) &&
    (insightSeverity === "ALL" || item.severity === insightSeverity)
  ), [insights, insightCategory, insightSeverity]);

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
    <div className="min-h-full bg-[#f3f7fa] p-3 text-[#061337] md:p-5">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#1A7A75]">Analytics</div>
          <h1 className="mt-0.5 text-xl font-extrabold tracking-tight text-[#061337] md:text-2xl">Fleet performance dashboard</h1>
          <p className="mt-1 max-w-2xl text-xs font-medium leading-5 text-[#64748b]">
            Live operational metrics from your devices, telemetry, alerts, geofences, and route history.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex h-8 items-center gap-2 rounded-md border border-[#dbe5ee] bg-white px-3 text-xs font-bold text-[#0D4A47] shadow-sm"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} size={13} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm font-semibold text-[#b91c1c]">
          {error}
        </div>
      )}

      <section className="mb-3 overflow-hidden rounded-lg border border-[#cfe0df] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5eeee] bg-[#f8fbfb] px-3 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#0D4A47] text-white"><FiCpu size={17} /></span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-[#061337]">AI Fleet Health</h2>
                <span className="rounded-full bg-[#e7f3f2] px-2 py-0.5 text-[9px] font-extrabold text-[#0D4A47]">RULE-BASED</span>
              </div>
              <p className="mt-0.5 text-[10px] font-semibold text-[#64748b]" title={insights?.healthFormula}>
                Verified telemetry findings with traceable evidence and recommended action
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right"><div className="text-[9px] font-bold uppercase text-[#64748b]">Health score</div><div className="text-2xl font-extrabold leading-none text-[#0D4A47]">{insights ? insights.fleetHealthScore : "--"}<span className="text-xs text-[#94a3b8]">/100</span></div></div>
            <div className="grid grid-cols-5 gap-1">
              {(["critical", "high", "medium", "low", "info"] as const).map((level) => (
                <button key={level} type="button" onClick={() => setInsightSeverity(insightSeverity === level.toUpperCase() ? "ALL" : level.toUpperCase())} className={`min-w-10 rounded-md border px-1.5 py-1 text-center ${SEVERITY_STYLES[level.toUpperCase()]}`}>
                  <div className="text-xs font-extrabold">{insights?.summary[level] ?? 0}</div><div className="text-[8px] font-bold uppercase">{level.slice(0, 4)}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-[#edf2f6] px-3 py-2">
          {["ALL", ...Object.keys(insights?.categories ?? {})].map((category) => (
            <button key={category} type="button" onClick={() => setInsightCategory(category)} className={`whitespace-nowrap rounded-md px-2.5 py-1 text-[10px] font-bold ${insightCategory === category ? "bg-[#0D4A47] text-white" : "bg-[#f1f5f9] text-[#536987]"}`}>
              {category === "ALL" ? "All insights" : category.toLowerCase().replaceAll("_", " ")} {category !== "ALL" && `(${insights?.categories[category] ?? 0})`}
            </button>
          ))}
        </div>

        <div className="grid gap-2 p-3 lg:grid-cols-2 xl:grid-cols-3">
          {loading && !insights ? (
            <div className="col-span-full py-6 text-center text-xs font-semibold text-[#64748b]">Checking fleet signals...</div>
          ) : visibleInsights.length === 0 ? (
            <div className="col-span-full flex items-center justify-center gap-2 py-6 text-xs font-semibold text-[#1A7A75]"><FiCheck /> No active insights match this filter.</div>
          ) : visibleInsights.slice(0, 9).map((item) => (
            <article key={item.id} className="rounded-md border border-[#dbe5ee] bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0"><div className="truncate text-xs font-extrabold text-[#061337]">{item.title}</div><div className="mt-0.5 truncate text-[10px] font-bold text-[#536987]">{item.entityName ?? "Fleet-wide"} · {timeAgo(item.lastObservedAt)}</div></div>
                <span className={`shrink-0 rounded border px-2 py-1 text-[9px] font-extrabold ${SEVERITY_STYLES[item.severity] ?? SEVERITY_STYLES.INFO}`}>{item.severity}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-[10px] font-medium leading-4 text-[#536987]">{item.summary}</p>
              {expandedInsight === item.id && <div className="mt-2 border-t border-[#edf2f6] pt-2 text-[10px] leading-4 text-[#475569]"><div><strong>Why:</strong> {item.reason || "Based on the latest verified telemetry."}</div><div className="mt-1"><strong>Action:</strong> {item.recommendedAction}</div></div>}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <button type="button" onClick={() => setExpandedInsight(expandedInsight === item.id ? null : item.id)} className="rounded border border-[#dbe5ee] px-2 py-1 text-[9px] font-bold text-[#0D4A47]">{expandedInsight === item.id ? "Hide" : "Details"}</button>
                <button type="button" onClick={() => askFleetAi(item)} className="rounded bg-[#e7f3f2] px-2 py-1 text-[9px] font-bold text-[#0D4A47]">Ask Fleet AI</button>
                {item.status === "ACTIVE" ? <button type="button" onClick={() => void acknowledgeInsight(item.id)} className="ml-auto rounded bg-[#0D4A47] px-2 py-1 text-[9px] font-bold text-white">Acknowledge</button> : <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-bold text-[#1A7A75]"><FiCheck /> Acknowledged</span>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-2 md:grid-cols-2">
        <VisualMetricCard href="/app/devices" icon={<FiTruck size={15} />} label="Total assets" value={loading ? "..." : String(devices.length)} helper={`${analytics.online} reporting now`} color="#0D4A47" image="/industries/logistics.png" imageAlt="Fleet truck" />
        <VisualMetricCard href="/app/devices" icon={<FiActivity size={15} />} label="Running" value={loading ? "..." : String(analytics.status.moving)} helper={`${analytics.status.idle} idling, ${analytics.status.stopped} stopped`} color="#1A7A75" image="/industries/vehicle-leasing.png" imageAlt="Connected car" />
        <VisualMetricCard href="/app/alerts" icon={<FiAlertTriangle size={15} />} label="Alerts last 24h" value={loading ? "..." : String(analytics.recentAlerts.length)} helper={`${analytics.criticalAlerts} critical alerts`} color="#EF334A" image="/industries/emergency-services.png" imageAlt="Alert vehicle" />
        <VisualMetricCard href="/app/geofences" icon={<FiMapPin size={15} />} label="Geofences" value={loading ? "..." : String(geofences.length)} helper="Open zone management" color="#2563EB" image="/industries/telecom.png" imageAlt="Map geofence" />
      </div>

      <div className="mt-2 grid gap-2 lg:grid-cols-4">
        <CompactMetric href="/app/history" icon={<FiNavigation size={13} />} label="Distance" value={formatKm(analytics.totalDistance)} helper="Reported odometer/trip distance">
          <Sparkline />
        </CompactMetric>
        <CompactMetric href="/app/history/routes" icon={<FiZap size={13} />} label="Average speed" value={`${Math.round(analytics.avgSpeed)} km/h`} helper="Across latest device telemetry">
          <div className="pointer-events-none absolute bottom-2 right-3 text-5xl opacity-20">⌖</div>
        </CompactMetric>
        <CompactMetric href="/app/reports" icon={<FiClock size={13} />} label="History points" value={String(history.length)} helper="Recent tracking records">
          <DotsGraph count={history.length} />
        </CompactMetric>
        <CompactMetric href="/app/maintenance" icon={<FiBatteryCharging size={13} />} label="Avg. voltage" value={analytics.avgVoltage ? `${analytics.avgVoltage.toFixed(2)} V` : "--"} helper="Vehicle battery telemetry">
          <div className="pointer-events-none absolute bottom-2 right-3 text-5xl opacity-20">▣</div>
        </CompactMetric>
      </div>

      <div className="mt-2 grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-lg border border-[#dbe5ee] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-[#edf2f6] px-3 py-2.5">
            <div>
              <h2 className="text-xs font-extrabold text-[#061337]">Active assets</h2>
              <p className="text-[10px] font-medium text-[#64748b]">Latest location and movement status</p>
            </div>
            <Link href="/app/devices" className="rounded-full border border-[#dbe5ee] px-2 py-1 text-[10px] font-bold text-[#0D4A47]">View map</Link>
          </div>
          <div className="divide-y divide-[#edf2f6]">
            {activeVehicles.length === 0 ? (
              <div className="p-5 text-center text-xs font-semibold text-[#94a3b8]">No live telemetry yet.</div>
            ) : (
              activeVehicles.map(({ device, telemetry: t }) => {
                const key = statusKey(t);
                return (
                  <Link key={String(device.id)} href={`/app/devices/${encodeURIComponent(String(device.id))}`} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 px-3 py-2.5 transition hover:bg-[#f8fafc]">
                    <div className="min-w-0 flex items-center gap-2">
                      <FiTruck className="shrink-0 text-[#0D4A47]" size={15} />
                      <div className="min-w-0">
                        <div className="truncate text-[11px] font-extrabold text-[#061337]">{vehicleName(device)}</div>
                        <div className="mt-0.5 truncate text-[10px] font-semibold text-[#64748b]">{key.toUpperCase()} · {timeAgo(t?.receivedAt ?? t?.eventTime)}</div>
                      </div>
                    </div>
                    <span className="rounded-full px-2 py-1 text-[10px] font-bold text-white" style={{ background: STATUS_COLORS[key] }}>{Math.round(Number(t?.speedKph ?? 0))} km/h</span>
                    <span className="hidden text-[10px] font-bold text-[#536987] sm:inline">{batteryVoltage(t) ? `${batteryVoltage(t)?.toFixed(2)} V` : "No voltage"}</span>
                    <span className="rounded-full bg-[#ecfdf3] px-2 py-1 text-[10px] font-bold text-[#0D4A47]">Open ›</span>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-lg border border-[#dbe5ee] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-[#edf2f6] px-3 py-2.5">
            <div>
              <h2 className="text-xs font-extrabold text-[#061337]">Recent alerts</h2>
              <p className="text-[10px] font-medium text-[#64748b]">Newest fleet events</p>
            </div>
            <Link href="/app/alerts" className="rounded-full border border-[#dbe5ee] px-2 py-1 text-[10px] font-bold text-[#0D4A47]">View all</Link>
          </div>
          <div className="divide-y divide-[#edf2f6]">
            {latestAlerts.length === 0 ? (
              <div className="p-5 text-center text-xs font-semibold text-[#94a3b8]">No alerts recorded yet.</div>
            ) : (
              latestAlerts.map((alert, index) => (
                <Link key={String(alert.id ?? index)} href="/app/alerts" className="block px-3 py-2.5 transition hover:bg-[#f8fafc]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-[11px] font-extrabold text-[#061337]">{compactAlertType(alert.alertType ?? alert.type)}</div>
                      <div className="mt-0.5 line-clamp-2 text-[10px] font-medium text-[#64748b]">{String(alert.message ?? "Fleet alert triggered")}</div>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#f1f5f9] px-2 py-1 text-[9px] font-bold text-[#536987]">
                      {timeAgo(alertTime(alert))}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-4">
        {[
          { label: "Moving", value: analytics.status.moving, href: "/app/devices", color: STATUS_COLORS.moving },
          { label: "Idling", value: analytics.status.idle, href: "/app/devices", color: STATUS_COLORS.idle },
          { label: "Stopped", value: analytics.status.stopped, href: "/app/devices", color: STATUS_COLORS.stopped },
          { label: "Offline", value: analytics.status.offline, href: "/app/devices/states", color: STATUS_COLORS.offline },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="flex items-center justify-between rounded-lg border border-[#dbe5ee] bg-white px-3 py-2.5 shadow-sm transition hover:border-[#0D4A47]/30">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
              <span className="text-xs font-bold text-[#536987]">{item.label}</span>
            </div>
            <span className="text-base font-extrabold text-[#061337]">{loading ? "..." : item.value}</span>
          </Link>
        ))}
      </div>

      <div className="mt-3 rounded-lg border border-[#dbe5ee] bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0D4A47]">
          <FiWifi size={14} />
          Data refreshes every 30 seconds from live backend APIs.
        </div>
      </div>
    </div>
  );
}

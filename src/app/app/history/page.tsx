"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiCalendar, FiClock, FiDownload, FiMapPin, FiPause, FiPlay, FiRotateCcw, FiSkipBack, FiZap } from "react-icons/fi";

const RouteCanvas = dynamic(() => import("@/components/RouteCanvas"), { ssr: false });

type Device = { id: string; name?: string; imei?: string; vehiclePlate?: string };
type Point = { id: string; eventTime: string; latitude: number; longitude: number; speedKph?: number; headingDeg?: number; ignition?: boolean; voltageMv?: number };
type Playback = { deviceId: string; deviceName: string; imei: string; points: Point[]; distanceM: number; durationSeconds: number; averageSpeedKph: number; maxSpeedKph: number };
type Segment = { startIndex: number; endIndex: number; moving: boolean; durationSeconds: number; distanceM: number; start: Point; end: Point };

export default function HistoryPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [period, setPeriod] = useState("today");
  const [from, setFrom] = useState(() => startOfToday());
  const [to, setTo] = useState(() => localInput(new Date()));
  const [stopFilter, setStopFilter] = useState("all");
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [queryRequested, setQueryRequested] = useState(false);
  const timerRef = useRef<number | null>(null);
  const autoplayRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("deviceId");
    const queryFrom = params.get("from");
    const queryTo = params.get("to");
    if (!id || !queryFrom || !queryTo) return;
    setDeviceId(id);
    setFrom(localInput(new Date(queryFrom)));
    setTo(localInput(new Date(queryTo)));
    setPeriod("custom");
    autoplayRef.current = params.get("autoplay") === "1";
    setQueryRequested(true);
  }, []);

  useEffect(() => {
    fetch("/api/devices", { cache: "no-store" })
      .then((res) => res.ok ? res.json() : Promise.reject())
      .then((data) => {
        const rows = listFrom<Device>(data);
        setDevices(rows);
        setDeviceId((current) => current || rows[0]?.id || "");
      })
      .catch(() => setError("Could not load your vehicles."));
  }, []);

  const loadPlayback = useCallback(async () => {
    if (!deviceId || !from || !to) return;
    setLoading(true);
    setPlaying(false);
    setError("");
    try {
      const params = new URLSearchParams({ deviceId, from: new Date(from).toISOString(), to: new Date(to).toISOString() });
      const response = await fetch(`/api/playback?${params}`, { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || "Playback history could not be loaded.");
      setPlayback(data);
      setCursor(0);
      if (autoplayRef.current && data?.points?.length) setPlaying(true);
      autoplayRef.current = false;
    } catch (cause) {
      setPlayback(null);
      setError(cause instanceof Error ? cause.message : "Playback history could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [deviceId, from, to]);

  useEffect(() => {
    if (!queryRequested || !deviceId || !from || !to) return;
    setQueryRequested(false);
    loadPlayback();
  }, [deviceId, from, loadPlayback, queryRequested, to]);

  useEffect(() => {
    if (!playing || !playback?.points.length) return;
    timerRef.current = window.setInterval(() => setCursor((current) => {
      if (current >= playback.points.length - 1) {
        setPlaying(false);
        return current;
      }
      return current + 1;
    }), Math.max(90, 700 / speed));
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [playing, playback, speed]);

  const points = useMemo(() => playback?.points ?? [], [playback]);
  const path = useMemo<[number, number][]>(() => points.map((point) => [Number(point.longitude), Number(point.latitude)]), [points]);
  const segments = useMemo(() => buildSegments(points), [points]);
  const shownSegments = stopFilter === "stops" ? segments.filter((segment) => !segment.moving) : segments;
  const current = points[cursor] ?? null;
  const currentDistance = useMemo(() => distanceAlong(points, cursor), [cursor, points]);

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
    if (value === "six-hours") start.setTime(end.getTime() - 6 * 60 * 60 * 1000);
    if (value !== "custom") { setFrom(localInput(start)); setTo(localInput(end)); }
  }

  function exportPlayback() {
    if (!points.length) return;
    const csv = ["time,latitude,longitude,speed_kph,heading,ignition,voltage_mv", ...points.map((point) => [point.eventTime, point.latitude, point.longitude, point.speedKph ?? 0, point.headingDeg ?? 0, point.ignition ?? false, point.voltageMv ?? ""].join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${playback?.deviceName || "vehicle"}-history.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative flex h-full min-h-[650px] overflow-hidden bg-[#eef3f7]">
      <aside className="z-10 flex w-[360px] shrink-0 flex-col border-r border-[#dbe3ea] bg-[#f8fafc] shadow-[8px_0_24px_rgba(15,23,42,0.08)] max-md:absolute max-md:inset-y-0 max-md:w-[min(88vw,360px)]">
        <div className="border-b border-[#e3e8ee] bg-white p-3">
          <div className="space-y-2">
            <HistoryField label="Reg No"><select value={deviceId} onChange={(event) => setDeviceId(event.target.value)} className="control">{devices.map((device) => <option key={device.id} value={device.id}>{device.name || device.vehiclePlate || device.imei}</option>)}</select></HistoryField>
            <HistoryField label="Filter"><select value={period} onChange={(event) => changePeriod(event.target.value)} className="control"><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="six-hours">Last 6 hours</option><option value="custom">Custom</option></select></HistoryField>
            <HistoryField label="From"><DateInput value={from} onChange={(value) => { setFrom(value); setPeriod("custom"); }} /></HistoryField>
            <HistoryField label="To"><DateInput value={to} onChange={(value) => { setTo(value); setPeriod("custom"); }} /></HistoryField>
            <HistoryField label="Stops"><select value={stopFilter} onChange={(event) => setStopFilter(event.target.value)} className="control"><option value="all">All movement</option><option value="stops">Stops only</option></select></HistoryField>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button type="button" onClick={loadPlayback} disabled={loading || !deviceId} className="history-action bg-[#f24464] text-white disabled:opacity-50">{loading ? "Loading" : "Show"}</button>
            <button type="button" onClick={() => { setPlaying(false); setPlayback(null); setCursor(0); }} className="history-action border border-[#dbe3ea] bg-white text-[#20252d]">Hide</button>
            <button type="button" onClick={exportPlayback} disabled={!points.length} className="history-action border border-[#dbe3ea] bg-white text-[#20252d] disabled:opacity-40"><FiDownload /> Export</button>
          </div>
        </div>

        {error && <div className="m-3 rounded-md border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {playback && <div className="divide-y divide-[#e7ebef]">{shownSegments.map((segment, index) => (
            <button key={`${segment.start.id}-${index}`} type="button" onClick={() => { setCursor(segment.startIndex); setPlaying(false); }} className={`w-full px-4 py-3 text-left transition hover:bg-white ${cursor >= segment.startIndex && cursor <= segment.endIndex ? "bg-white shadow-sm" : ""}`}>
              <div className="grid grid-cols-[1fr_auto_auto] items-center gap-3"><span className="text-xs font-extrabold text-[#242a32]">{formatSegmentTime(segment.start.eventTime)}</span><span className={`grid h-7 w-7 place-items-center rounded-full border-2 text-[10px] font-extrabold ${segment.moving ? "border-[#3154f5] text-[#3154f5]" : "border-[#ef334a] text-[#ef334a]"}`}>{segment.moving ? "V" : "P"}</span><span className="min-w-[58px] text-right text-xs font-bold text-[#303740]">{formatDuration(segment.durationSeconds)}</span></div>
              <div className="mt-2 flex items-center justify-between gap-3 text-[11px]"><span className="flex min-w-0 items-center gap-1.5 text-[#475569]"><FiMapPin className="shrink-0 text-[#249b65]" />{formatCoordinate(segment.start)}</span><span className="shrink-0 font-bold text-[#303740]">{formatDistance(segment.distanceM)}</span></div>
              <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-[#475569]"><FiMapPin className="shrink-0 text-[#ef334a]" />{formatCoordinate(segment.end)}</div>
            </button>
          ))}{!shownSegments.length && <div className="p-6 text-center text-xs text-[#64748b]">No movement or stop records in this period.</div>}</div>}
        </div>
        {playback && <div className="grid grid-cols-2 border-t border-[#dbe3ea] bg-white text-center text-xs font-bold text-[#252b33]"><div className="py-3">Summary</div><div className="py-3">Logs</div></div>}
      </aside>

      <main className="relative min-w-0 flex-1 bg-[#e8f0ef]">
        <RouteCanvas path={path} cursorIndex={points.length ? cursor : null} cursorHeading={current?.headingDeg} />
        {!loading && !points.length && <div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="rounded-md bg-white/95 px-5 py-4 text-center shadow-lg"><FiMapPin className="mx-auto text-[#f24464]" /><div className="mt-2 text-sm font-bold text-[#172033]">Choose a vehicle and period</div><div className="mt-1 text-xs text-[#64748b]">Select Show to draw its reported route.</div></div></div>}
        {!!points.length && <section className="absolute inset-x-4 bottom-4 z-10 mx-auto max-w-[780px] overflow-hidden rounded-md border border-white/80 bg-white/95 shadow-[0_18px_48px_rgba(15,23,42,0.22)] backdrop-blur">
          <div className="flex items-center gap-4 px-4 py-3">
            <button type="button" aria-label={playing ? "Pause playback" : "Play history"} onClick={() => setPlaying((value) => !value)} className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#f24464] text-xl text-white shadow-lg">{playing ? <FiPause /> : <FiPlay className="ml-1" />}</button>
            <button type="button" title="Restart" aria-label="Restart playback" onClick={() => { setCursor(0); setPlaying(false); }} className="playback-icon"><FiSkipBack /></button>
            <input type="range" min={0} max={Math.max(0, points.length - 1)} value={cursor} onChange={(event) => { setCursor(Number(event.target.value)); setPlaying(false); }} className="min-w-0 flex-1 accent-[#f24464]" />
            <button type="button" title="Playback speed" onClick={() => setSpeed((value) => value === 4 ? 0.5 : value * 2)} className="grid h-10 min-w-10 place-items-center rounded-full bg-[#f24464] px-2 text-xs font-extrabold text-white">{speed}x</button>
            <button type="button" title="Replay" onClick={() => { setCursor(0); setPlaying(true); }} className="playback-icon bg-[#f24464] text-white"><FiRotateCcw /></button>
          </div>
          <div className="grid gap-3 border-t border-[#e4e9ef] px-4 py-3 md:grid-cols-[1fr_auto]"><div className="flex min-w-0 items-start gap-2 text-xs font-semibold text-[#20252d]"><FiMapPin className="mt-0.5 shrink-0 text-[#f24464]" /><span>{current ? formatCoordinate(current, 6) : "--"}</span></div><div className="flex items-center gap-2 text-xs font-bold text-[#20252d]"><FiClock className="text-[#f24464]" />{current ? new Date(current.eventTime).toLocaleString() : "--"}</div></div>
          <div className="grid grid-cols-2 border-t border-[#e4e9ef] bg-[#fbfcfd] text-xs sm:grid-cols-5"><Metric icon={<FiZap />} value={formatVoltage(current?.voltageMv)} label="Battery" /><Metric value={`${Math.round(current?.speedKph ?? 0)} km/h`} label="Speed" /><Metric value={formatElapsed(points, cursor)} label="Elapsed" /><Metric value={`${Math.round(playback?.averageSpeedKph ?? 0)} km/h`} label="Average" /><Metric value={formatDistance(currentDistance)} label="Distance" /></div>
        </section>}
      </main>
    </div>
  );
}

function HistoryField({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid grid-cols-[72px_1fr] items-center gap-2 text-xs font-medium text-[#20252d]"><span>{label}</span>{children}</label>; }
function DateInput({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <div className="relative"><FiCalendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#20252d]" /><input type="datetime-local" value={value} onChange={(event) => onChange(event.target.value)} className="control pl-9" /></div>; }
function Metric({ icon, value, label }: { icon?: React.ReactNode; value: string; label: string }) { return <div className="border-r border-[#e4e9ef] px-3 py-2 text-center last:border-r-0"><div className="flex items-center justify-center gap-1 font-extrabold text-[#20252d]">{icon && <span className="text-[#f24464]">{icon}</span>}{value}</div><div className="mt-0.5 text-[9px] font-bold uppercase text-[#94a3b8]">{label}</div></div>; }

function buildSegments(points: Point[]) {
  if (!points.length) return [];
  const segments: Segment[] = [];
  let start = 0;
  let moving = isMoving(points[0]);
  for (let index = 1; index <= points.length; index += 1) {
    const nextMoving = index < points.length ? isMoving(points[index]) : !moving;
    if (index < points.length && nextMoving === moving) continue;
    const end = index - 1;
    segments.push({ startIndex: start, endIndex: end, moving, durationSeconds: Math.max(0, (new Date(points[end].eventTime).getTime() - new Date(points[start].eventTime).getTime()) / 1000), distanceM: distanceAlong(points.slice(start, end + 1), end - start), start: points[start], end: points[end] });
    start = index;
    moving = nextMoving;
  }
  return segments;
}
function isMoving(point: Point) { return Number(point.speedKph ?? 0) > 3; }
function distanceAlong(points: Point[], cursor: number) { let meters = 0; for (let index = 1; index <= Math.min(cursor, points.length - 1); index += 1) meters += haversine(points[index - 1], points[index]); return meters; }
function haversine(a: Point, b: Point) { const r = 6371000; const p1 = a.latitude * Math.PI / 180; const p2 = b.latitude * Math.PI / 180; const dp = (b.latitude - a.latitude) * Math.PI / 180; const dl = (b.longitude - a.longitude) * Math.PI / 180; const value = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2; return r * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value)); }
function listFrom<T>(data: unknown): T[] { if (Array.isArray(data)) return data as T[]; if (data && typeof data === "object" && Array.isArray((data as { content?: unknown[] }).content)) return (data as { content: T[] }).content; return []; }
function startOfToday() { const date = new Date(); date.setHours(0, 0, 0, 0); return localInput(date); }
function localInput(date: Date) { return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
function formatDistance(meters?: number) { const value = Number(meters ?? 0) / 1000; return `${value.toFixed(value >= 10 ? 1 : 2)} km`; }
function formatDuration(seconds?: number) { const value = Math.max(0, Math.round(seconds ?? 0)); const hours = Math.floor(value / 3600); const minutes = Math.floor((value % 3600) / 60); return hours ? `${hours}h ${minutes}m` : `${Math.max(1, minutes)} min`; }
function formatSegmentTime(value: string) { return new Date(value).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }); }
function formatCoordinate(point: Point, precision = 4) { return `${Number(point.latitude).toFixed(precision)}, ${Number(point.longitude).toFixed(precision)}`; }
function formatElapsed(points: Point[], cursor: number) { if (!points.length) return "00:00:00"; const seconds = Math.max(0, Math.round((new Date(points[cursor]?.eventTime).getTime() - new Date(points[0].eventTime).getTime()) / 1000)); return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map((part) => String(part).padStart(2, "0")).join(":"); }
function formatVoltage(voltageMv?: number) { return voltageMv ? `${(voltageMv / 1000).toFixed(1)} V` : "--"; }

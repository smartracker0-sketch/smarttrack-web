"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiClock, FiMapPin, FiPause, FiPlay, FiRefreshCw, FiSkipBack, FiZap } from "react-icons/fi";

const RouteCanvas = dynamic(() => import("@/components/RouteCanvas"), { ssr: false });

type Device = { id: string; name?: string; imei?: string; vehiclePlate?: string };
type PlaybackPoint = { id: string; eventTime: string; latitude: number; longitude: number; speedKph?: number; headingDeg?: number; ignition?: boolean; voltageMv?: number };
type Playback = { deviceId: string; deviceName: string; imei: string; points: PlaybackPoint[]; distanceM: number; durationSeconds: number; averageSpeedKph: number; maxSpeedKph: number };

export default function HistoryPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [from, setFrom] = useState(() => localInput(new Date(Date.now() - 6 * 60 * 60 * 1000)));
  const [to, setTo] = useState(() => localInput(new Date()));
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [queryPlaybackRequested, setQueryPlaybackRequested] = useState(false);
  const timerRef = useRef<number | null>(null);
  const autoplayRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryDeviceId = params.get("deviceId");
    const queryFrom = params.get("from");
    const queryTo = params.get("to");
    if (!queryDeviceId || !queryFrom || !queryTo) return;
    setDeviceId(queryDeviceId);
    setFrom(localInput(new Date(queryFrom)));
    setTo(localInput(new Date(queryTo)));
    autoplayRef.current = params.get("autoplay") === "1";
    setQueryPlaybackRequested(true);
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
      const res = await fetch(`/api/playback?${params}`, { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Playback history could not be loaded.");
      setPlayback(data);
      setCursor(0);
      if (autoplayRef.current && Array.isArray(data?.points) && data.points.length > 0) setPlaying(true);
      autoplayRef.current = false;
    } catch (cause) {
      setPlayback(null);
      setError(cause instanceof Error ? cause.message : "Playback history could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [deviceId, from, to]);

  useEffect(() => {
    if (!queryPlaybackRequested || !deviceId || !from || !to) return;
    setQueryPlaybackRequested(false);
    loadPlayback();
  }, [deviceId, from, loadPlayback, queryPlaybackRequested, to]);

  useEffect(() => {
    if (!playing || !playback?.points.length) return;
    timerRef.current = window.setInterval(() => {
      setCursor((current) => {
        if (current >= playback.points.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, Math.max(120, 800 / speed));
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [playing, playback, speed]);

  const points = useMemo(() => playback?.points ?? [], [playback]);
  const path = useMemo<[number, number][]>(() => points.map((point) => [Number(point.longitude), Number(point.latitude)]), [points]);
  const current = points[cursor] ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto p-4 lg:overflow-hidden">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#1A7A75]">Trips</div>
          <h1 className="mt-1 text-xl font-extrabold text-[#0D4A47]">Playback history</h1>
          <p className="mt-1 text-xs text-[#64748b]">Replay the exact GPS trail reported by a vehicle.</p>
        </div>
        <button type="button" onClick={loadPlayback} disabled={loading || !deviceId} className="flex h-9 items-center gap-2 rounded-md bg-[#0D8A80] px-4 text-xs font-bold text-white disabled:opacity-50">
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> {loading ? "Loading" : "Load history"}
        </button>
      </header>

      <section className="grid gap-2 rounded-md border border-[#d9e5e4] bg-white p-3 md:grid-cols-3">
        <label className="text-[10px] font-bold uppercase tracking-wide text-[#64748b]">Vehicle
          <select value={deviceId} onChange={(event) => setDeviceId(event.target.value)} className="mt-1 block h-9 w-full rounded-md border border-[#cbd5e1] bg-white px-3 text-xs font-semibold text-[#0D4A47]">
            {devices.map((device) => <option key={device.id} value={device.id}>{device.name || device.vehiclePlate || device.imei}</option>)}
          </select>
        </label>
        <label className="text-[10px] font-bold uppercase tracking-wide text-[#64748b]">From
          <input type="datetime-local" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-1 block h-9 w-full rounded-md border border-[#cbd5e1] px-3 text-xs text-[#0D4A47]" />
        </label>
        <label className="text-[10px] font-bold uppercase tracking-wide text-[#64748b]">To
          <input type="datetime-local" value={to} onChange={(event) => setTo(event.target.value)} className="mt-1 block h-9 w-full rounded-md border border-[#cbd5e1] px-3 text-xs text-[#0D4A47]" />
        </label>
      </section>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</div>}

      <div className="grid min-h-[620px] flex-1 gap-3 lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="relative min-h-[430px] overflow-hidden rounded-md border border-[#d9e5e4] bg-[#e8f0ef]">
          <RouteCanvas path={path} cursorIndex={points.length ? cursor : null} />
          {!loading && points.length === 0 && <div className="pointer-events-none absolute inset-0 grid place-items-center"><div className="rounded-md bg-white/95 px-5 py-4 text-center shadow-lg"><FiMapPin className="mx-auto text-[#0D8A80]" /><div className="mt-2 text-sm font-bold text-[#0D4A47]">Choose a period to replay</div><div className="mt-1 text-xs text-[#64748b]">GPS history will draw here.</div></div></div>}
        </section>

        <aside className="flex min-h-0 flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Distance" value={formatDistance(playback?.distanceM)} />
            <Metric label="Duration" value={formatDuration(playback?.durationSeconds)} />
            <Metric label="Average speed" value={`${Math.round(playback?.averageSpeedKph ?? 0)} km/h`} />
            <Metric label="Maximum speed" value={`${Math.round(playback?.maxSpeedKph ?? 0)} km/h`} />
          </div>

          <div className="rounded-md border border-[#d9e5e4] bg-white p-3">
            <div className="flex items-center justify-between">
              <button type="button" aria-label="Restart" onClick={() => { setCursor(0); setPlaying(false); }} className="grid h-8 w-8 place-items-center rounded-md border border-[#d9e5e4] text-[#0D4A47]"><FiSkipBack /></button>
              <button type="button" aria-label={playing ? "Pause" : "Play"} disabled={!points.length} onClick={() => setPlaying((value) => !value)} className="grid h-10 w-10 place-items-center rounded-full bg-[#0D8A80] text-white disabled:opacity-40">{playing ? <FiPause /> : <FiPlay className="ml-0.5" />}</button>
              <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))} aria-label="Playback speed" className="h-8 rounded-md border border-[#d9e5e4] bg-white px-2 text-xs font-bold text-[#0D4A47]">
                {[0.5, 1, 2, 4].map((value) => <option key={value} value={value}>{value}x</option>)}
              </select>
            </div>
            <input type="range" min={0} max={Math.max(0, points.length - 1)} value={Math.min(cursor, Math.max(0, points.length - 1))} onChange={(event) => { setCursor(Number(event.target.value)); setPlaying(false); }} className="mt-3 w-full accent-[#0D8A80]" />
            <div className="mt-1 flex justify-between text-[10px] font-semibold text-[#94a3b8]"><span>{points.length ? cursor + 1 : 0}</span><span>{points.length} points</span></div>
          </div>

          <div className="rounded-md border border-[#d9e5e4] bg-white p-4">
            <div className="text-sm font-extrabold text-[#0D4A47]">{playback?.deviceName || "Vehicle state"}</div>
            <div className="mt-3 space-y-2 text-xs text-[#536987]">
              <StateRow icon={<FiClock />} label="Time" value={current ? new Date(current.eventTime).toLocaleString() : "--"} />
              <StateRow icon={<FiZap />} label="Speed" value={current ? `${Math.round(current.speedKph ?? 0)} km/h` : "--"} />
              <StateRow icon={<FiMapPin />} label="Coordinates" value={current ? `${current.latitude.toFixed(5)}, ${current.longitude.toFixed(5)}` : "--"} />
              <StateRow icon={<FiRefreshCw />} label="Ignition" value={current ? (current.ignition ? "On" : "Off") : "--"} />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto rounded-md border border-[#d9e5e4] bg-white">
            <div className="sticky top-0 border-b border-[#e2e8f0] bg-white px-3 py-2 text-[11px] font-extrabold text-[#0D4A47]">Timeline</div>
            {points.slice().reverse().slice(0, 100).map((point) => <button type="button" key={point.id} onClick={() => { setCursor(points.indexOf(point)); setPlaying(false); }} className="flex w-full items-center justify-between border-b border-[#f1f5f9] px-3 py-2 text-left hover:bg-[#f4fbfa]"><span className="text-[10px] text-[#536987]">{new Date(point.eventTime).toLocaleTimeString()}</span><span className="text-[10px] font-bold text-[#0D8A80]">{Math.round(point.speedKph ?? 0)} km/h</span></button>)}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md border border-[#d9e5e4] bg-white p-3"><div className="text-[10px] font-bold uppercase tracking-wide text-[#94a3b8]">{label}</div><div className="mt-1 text-sm font-extrabold text-[#0D4A47]">{value}</div></div>;
}

function StateRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-start gap-2"><span className="mt-0.5 text-[#0D8A80]">{icon}</span><div className="min-w-0"><div className="text-[10px] font-bold uppercase text-[#94a3b8]">{label}</div><div className="break-words font-semibold text-[#334155]">{value}</div></div></div>;
}

function listFrom<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { content?: unknown[] }).content)) return (data as { content: T[] }).content;
  return [];
}

function localInput(date: Date) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatDistance(meters?: number) {
  if (!meters) return "0 km";
  return `${(meters / 1000).toFixed(meters >= 10000 ? 1 : 2)} km`;
}

function formatDuration(seconds?: number) {
  if (!seconds) return "0 min";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes} min`;
}

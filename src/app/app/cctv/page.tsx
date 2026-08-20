"use client";

import Hls from "hls.js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiCamera, FiCheckCircle, FiClock, FiFilm, FiMapPin, FiPlay, FiRefreshCw, FiSquare, FiWifi, FiWifiOff } from "react-icons/fi";

type DashcamEvent = { id: string; eventTime: string; eventType: string; severity: string; latitude?: number | null; longitude?: number | null; speedKph?: number | null; clipUrl?: string | null; thumbnailUrl?: string | null };
type Dashcam = { id: string; imei: string; name: string; vehiclePlate?: string | null; manufacturer?: string | null; model?: string | null; cameraId?: string | null; status: string; provisioned: boolean; online: boolean; lastSeenAt?: string | null; latestEvent?: DashcamEvent | null };

const dateTime = (value?: string | null) => value
  ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  : "No camera data yet";

export default function CCTVPage() {
  const [cameras, setCameras] = useState<Dashcam[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [events, setEvents] = useState<DashcamEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const selected = useMemo(() => cameras.find(camera => camera.id === selectedId) ?? cameras[0] ?? null, [cameras, selectedId]);

  const loadCameras = useCallback(async () => {
    try {
      const response = await fetch("/api/dashcams", { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 401 ? "Your session has expired." : "Could not load dashcams.");
      const data = await response.json() as Dashcam[];
      setCameras(data);
      setSelectedId(current => current && data.some(camera => camera.id === current) ? current : data[0]?.id ?? null);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load dashcams.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCameras();
    const timer = window.setInterval(() => void loadCameras(), 15_000);
    return () => window.clearInterval(timer);
  }, [loadCameras]);

  useEffect(() => {
    if (!selected?.id) { setEvents([]); return; }
    let active = true;
    fetch(`/api/dashcams/${selected.id}/events?size=50`, { cache: "no-store" })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((data: { content?: DashcamEvent[] }) => { if (active) setEvents(data.content ?? []); })
      .catch(() => { if (active) setEvents([]); });
    return () => { active = false; };
  }, [selected?.id, selected?.latestEvent?.id]);

  return (
    <main className="min-h-full bg-[#f4f7f8] p-4 text-[#102f32] sm:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#d9e3e5] pb-4">
        <div><p className="text-xs font-bold uppercase text-[#27837d]">Fleet video</p><h1 className="text-2xl font-bold">Dashcams</h1></div>
        <button type="button" onClick={() => void loadCameras()} className="grid h-10 w-10 place-items-center rounded-md border border-[#cad8da] bg-white" title="Refresh cameras" aria-label="Refresh cameras"><FiRefreshCw className={loading ? "animate-spin" : ""} /></button>
      </header>

      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <section className="border-r border-[#d9e3e5] pr-0 xl:pr-4" aria-label="Assigned dashcams">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold">Assigned cameras</h2><span className="text-xs text-[#657b7d]">{cameras.length}</span></div>
          <div className="grid gap-2">
            {cameras.map(camera => (
              <button key={camera.id} type="button" onClick={() => setSelectedId(camera.id)} className="w-full rounded-md border bg-white p-3 text-left transition" style={{ borderColor: selected?.id === camera.id ? "#27837d" : "#d9e3e5" }}>
                <div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="truncate text-sm font-bold">{camera.name}</p><p className="mt-0.5 truncate text-xs text-[#657b7d]">{camera.vehiclePlate || camera.imei}</p></div>{camera.online ? <FiWifi className="shrink-0 text-emerald-600" /> : <FiWifiOff className="shrink-0 text-[#89999b]" />}</div>
                <div className="mt-3 flex items-center justify-between text-xs"><span className={camera.online ? "text-emerald-700" : "text-[#657b7d]"}>{camera.online ? "Online" : "Offline"}</span><span className="text-[#657b7d]">{camera.model || "Dashcam"}</span></div>
              </button>
            ))}
          </div>
          {!loading && cameras.length === 0 && <div className="rounded-md border border-dashed border-[#cad8da] bg-white p-6 text-center"><FiCamera className="mx-auto mb-2 text-2xl text-[#27837d]" /><p className="text-sm font-semibold">No assigned dashcams</p><p className="mt-1 text-xs text-[#657b7d]">Set a device type to Dashcam and assign it to this user or organisation.</p></div>}
        </section>

        <section className="min-w-0">
          {selected ? <div className="grid gap-4">
            <div className="rounded-md border border-[#d9e3e5] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{selected.name}</h2><p className="text-sm text-[#657b7d]">{selected.manufacturer || "Dashcam"} {selected.model || ""} · IMEI {selected.imei}</p>{selected.cameraId && <p className="mt-1 text-xs text-[#657b7d]">Camera ID {selected.cameraId}</p>}</div><span className={`rounded-md px-2.5 py-1 text-xs font-bold ${selected.online ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{selected.online ? "Connected" : "Awaiting connection"}</span></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3"><Status icon={<FiCheckCircle />} label="Assignment" value={selected.status} /><Status icon={<FiClock />} label="Last camera event" value={dateTime(selected.lastSeenAt)} /><Status icon={<FiFilm />} label="Provisioning" value={selected.provisioned ? "Device details complete" : "Add camera ID, make and model"} /></div>
            </div>

            <LiveStream camera={selected} />

            <div className="rounded-md border border-[#d9e3e5] bg-white">
              <div className="border-b border-[#e3eaeb] px-4 py-3"><h2 className="text-sm font-bold">Camera events</h2></div>
              <div className="divide-y divide-[#e8edef]">
                {events.map(event => <div key={event.id} className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-semibold">{event.eventType.replaceAll("_", " ")}</p><p className="text-xs text-[#657b7d]">{dateTime(event.eventTime)}</p></div>{event.latitude != null && event.longitude != null && <span className="flex items-center gap-1 text-xs text-[#657b7d]"><FiMapPin /> {event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}</span>}<span className="text-xs font-semibold text-[#27837d]">{event.clipUrl ? "Clip ready" : event.severity}</span></div>)}
                {events.length === 0 && <p className="px-4 py-8 text-center text-sm text-[#657b7d]">No camera events received yet.</p>}
              </div>
            </div>
          </div> : !loading && <div className="rounded-md border border-dashed border-[#cad8da] bg-white p-10 text-center text-sm text-[#657b7d]">Assign a dashcam to begin.</div>}
        </section>
      </div>
    </main>
  );
}

function LiveStream({ camera }: { camera: Dashcam }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [channel, setChannel] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const source = `/api/dashcams/${camera.id}/stream/${channel}/live.m3u8`;

  useEffect(() => {
    if (!playing || !videoRef.current) return;
    const video = videoRef.current;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      void video.play().catch(() => undefined);
      return () => { video.removeAttribute("src"); video.load(); };
    }
    if (!Hls.isSupported()) { setError("Live HLS playback is not supported by this browser."); return; }
    const hls = new Hls({ liveSyncDurationCount: 2, lowLatencyMode: true });
    hls.loadSource(source);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => void video.play().catch(() => undefined));
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) setError("Waiting for video from the camera...");
    });
    return () => hls.destroy();
  }, [playing, source]);

  async function start() {
    setStarting(true); setError("");
    const response = await fetch(`/api/dashcams/${camera.id}/stream/start?channel=${channel}`, { method: "POST" });
    setStarting(false);
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { message?: string } | null;
      setError(body?.message ?? "Could not start the camera stream.");
      return;
    }
    setPlaying(true);
  }

  async function stop() {
    setPlaying(false);
    await fetch(`/api/dashcams/${camera.id}/stream/stop?channel=${channel}`, { method: "POST" });
  }

  return <div className="overflow-hidden rounded-md border border-[#d9e3e5] bg-[#111718]">
    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2 text-white">
      <div className="flex items-center gap-2 text-xs font-semibold"><span className={`h-2 w-2 rounded-full ${playing ? "bg-red-500 animate-pulse" : "bg-slate-500"}`} />{playing ? "Live" : "Camera ready"}</div>
      <div className="flex items-center gap-1" aria-label="Camera channel">
        {[1, 2].map(value => <button key={value} type="button" onClick={() => { if (!playing) setChannel(value); }} disabled={playing} className={`h-8 rounded-md px-3 text-xs font-bold ${channel === value ? "bg-[#27837d]" : "bg-white/10"}`}>{value === 1 ? "Road" : "Cabin"}</button>)}
      </div>
    </div>
    <div className="relative aspect-video">
      <video ref={videoRef} controls playsInline muted className={`h-full w-full bg-black object-contain ${playing ? "block" : "hidden"}`} />
      {!playing && <div className="grid h-full place-items-center text-center text-white"><div><FiCamera className="mx-auto mb-3 text-4xl text-[#55bcb4]" /><p className="font-semibold">{camera.online ? "Start live video" : "Camera is not connected"}</p><p className="mt-1 max-w-md text-xs text-[#a9b7b8]">The dashcam must be online on JT808 port 5015 before live video can start.</p></div></div>}
    </div>
    <div className="flex items-center justify-between gap-3 px-3 py-2">
      <p className="text-xs text-amber-300">{error}</p>
      {playing ? <button type="button" onClick={() => void stop()} className="ml-auto flex h-9 items-center gap-2 rounded-md bg-red-600 px-4 text-xs font-bold text-white"><FiSquare /> Stop</button> : <button type="button" onClick={() => void start()} disabled={starting || !camera.online} className="ml-auto flex h-9 items-center gap-2 rounded-md bg-[#27837d] px-4 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><FiPlay /> {starting ? "Starting..." : "Start live"}</button>}
    </div>
  </div>;
}

function Status({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-md bg-[#f4f7f8] p-3"><div className="flex items-center gap-2 text-xs font-semibold text-[#657b7d]">{icon}{label}</div><p className="mt-1 text-sm font-bold">{value}</p></div>;
}

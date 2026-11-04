"use client";

import LiveStream from "@/components/DashcamLiveStream";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiCamera, FiCheckCircle, FiClock, FiFilm, FiMapPin, FiRefreshCw, FiWifi, FiWifiOff } from "react-icons/fi";

type DashcamEvent = { id: string; eventTime: string; eventType: string; severity: string; latitude?: number | null; longitude?: number | null; speedKph?: number | null; clipUrl?: string | null; thumbnailUrl?: string | null };
type Dashcam = { id: string; imei: string; name: string; vehiclePlate?: string | null; manufacturer?: string | null; model?: string | null; cameraId?: string | null; assignedVehicleId?: string | null; assignedVehicleName?: string | null; status: string; provisioned: boolean; online: boolean; lastSeenAt?: string | null; latestEvent?: DashcamEvent | null };

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
      const requestedId = typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("deviceId");
      setSelectedId(current => current && data.some(camera => camera.id === current)
        ? current
        : requestedId && data.some(camera => camera.id === requestedId) ? requestedId : data[0]?.id ?? null);
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
              <div className="mt-3 flex items-center justify-between text-xs"><span className={camera.online ? "text-emerald-700" : "text-[#657b7d]"}>{camera.online ? "Online" : "Offline"}</span><span className="text-[#657b7d]">{camera.assignedVehicleName || "Standalone"}</span></div>
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

            <Link href={`/app/cctv/tools?deviceId=${encodeURIComponent(selected.id)}`} className="w-fit rounded-lg bg-teal-700 px-4 py-3 font-semibold text-white">Camera tools and recordings</Link>
            <LiveStream key={selected.id} camera={selected} />

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

function Status({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-md bg-[#f4f7f8] p-3"><div className="flex items-center gap-2 text-xs font-semibold text-[#657b7d]">{icon}{label}</div><p className="mt-1 text-sm font-bold">{value}</p></div>;
}

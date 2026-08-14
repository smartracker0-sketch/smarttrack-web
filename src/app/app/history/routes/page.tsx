"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FiCheck, FiEdit3, FiMap, FiPlus, FiRotateCcw, FiSave, FiTrash2, FiX } from "react-icons/fi";

const RouteCanvas = dynamic(() => import("@/components/RouteCanvas"), { ssr: false });
type Coordinate = [number, number];
type Device = { id: string; name?: string; imei?: string; vehiclePlate?: string };
type SavedRoute = { id: string; name: string; description?: string; startName?: string; endName?: string; geometryJson: string; distanceM?: number; deviceId?: string; deviceName?: string; active: boolean; createdAt: string };

export default function RoutesPage() {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<Coordinate[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startName, setStartName] = useState("");
  const [endName, setEndName] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [routesRes, devicesRes] = await Promise.all([fetch("/api/routes", { cache: "no-store" }), fetch("/api/devices", { cache: "no-store" })]);
    if (routesRes.ok) setRoutes(await routesRes.json());
    if (devicesRes.ok) setDevices(listFrom<Device>(await devicesRes.json()));
  }, []);
  useEffect(() => { load().catch(() => setError("Could not load routes.")); }, [load]);

  const selected = routes.find((route) => route.id === selectedId) ?? null;
  const visiblePath = useMemo(() => drawing ? points : selected ? parsePath(selected.geometryJson) : [], [drawing, points, selected]);

  function beginRoute() {
    setSelectedId("");
    setPoints([]);
    setName("");
    setDescription("");
    setStartName("");
    setEndName("");
    setDeviceId("");
    setError("");
    setDrawing(true);
  }

  async function saveRoute() {
    if (!name.trim() || points.length < 2) {
      setError("Enter a route name and place at least two points on the map.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/routes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, description, startName, endName, deviceId: deviceId || null, active: true, points: points.map(([longitude, latitude]) => ({ latitude, longitude })) }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "Route could not be saved.");
      await load();
      setSelectedId(data.id);
      setDrawing(false);
      setPoints([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Route could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function removeRoute(route: SavedRoute) {
    if (!window.confirm(`Delete ${route.name}?`)) return;
    const res = await fetch(`/api/routes/${route.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Route could not be deleted.");
      return;
    }
    if (selectedId === route.id) setSelectedId("");
    await load();
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto p-4 lg:overflow-hidden">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><div className="text-[10px] font-bold uppercase tracking-widest text-[#1A7A75]">Trips</div><h1 className="mt-1 text-xl font-extrabold text-[#0D4A47]">Route creation</h1><p className="mt-1 text-xs text-[#64748b]">Draw reusable routes and assign them to vehicles.</p></div>
        <button type="button" onClick={drawing ? () => setDrawing(false) : beginRoute} className="flex h-9 items-center gap-2 rounded-md bg-[#0D8A80] px-4 text-xs font-bold text-white">{drawing ? <FiX /> : <FiPlus />}{drawing ? "Cancel drawing" : "Create route"}</button>
      </header>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</div>}

      <div className="grid min-h-[650px] flex-1 gap-3 lg:min-h-0 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-auto rounded-md border border-[#d9e5e4] bg-[#f5f9f8] p-3">
          {drawing ? (
            <div className="space-y-3 rounded-md bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#0D4A47]"><FiEdit3 className="text-[#0D8A80]" /> New route</div>
              <p className="text-[11px] leading-5 text-[#64748b]">Tap the map to place the route points in travel order. Use undo to remove the last point.</p>
              <Field label="Route name" value={name} onChange={setName} required />
              <Field label="Start location" value={startName} onChange={setStartName} />
              <Field label="End location" value={endName} onChange={setEndName} />
              <label className="block text-[10px] font-bold uppercase text-[#64748b]">Assign vehicle<select value={deviceId} onChange={(event) => setDeviceId(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-[#cbd5e1] bg-white px-3 text-xs text-[#0D4A47]"><option value="">Any vehicle</option>{devices.map((device) => <option key={device.id} value={device.id}>{device.name || device.vehiclePlate || device.imei}</option>)}</select></label>
              <label className="block text-[10px] font-bold uppercase text-[#64748b]">Notes<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-1 w-full resize-none rounded-md border border-[#cbd5e1] px-3 py-2 text-xs text-[#0D4A47]" /></label>
              <div className="flex items-center justify-between rounded-md bg-[#edf8f6] px-3 py-2 text-xs font-bold text-[#0D4A47]"><span>{points.length} points</span><span>{estimateDistance(points)}</span></div>
              <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setPoints((current) => current.slice(0, -1))} disabled={!points.length} className="flex h-9 items-center justify-center gap-2 rounded-md border border-[#cbd5e1] text-xs font-bold text-[#0D4A47] disabled:opacity-40"><FiRotateCcw /> Undo</button><button type="button" onClick={saveRoute} disabled={saving || points.length < 2} className="flex h-9 items-center justify-center gap-2 rounded-md bg-[#0D8A80] text-xs font-bold text-white disabled:opacity-40"><FiSave /> {saving ? "Saving" : "Save"}</button></div>
            </div>
          ) : routes.length === 0 ? (
            <div className="grid place-items-center rounded-md bg-white px-5 py-12 text-center"><FiMap className="text-2xl text-[#0D8A80]" /><div className="mt-3 text-sm font-bold text-[#0D4A47]">No routes yet</div><div className="mt-1 text-xs leading-5 text-[#64748b]">Create the first planned route from the map.</div></div>
          ) : (
            <div className="space-y-2">{routes.map((route) => <button type="button" key={route.id} onClick={() => setSelectedId(route.id)} className={`w-full rounded-md border bg-white p-3 text-left transition ${selectedId === route.id ? "border-[#0D8A80] ring-2 ring-[#0D8A80]/10" : "border-[#d9e5e4] hover:border-[#8ec8c3]"}`}><div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="truncate text-sm font-extrabold text-[#0D4A47]">{route.name}</div><div className="mt-1 text-[10px] font-semibold text-[#64748b]">{formatDistance(route.distanceM)} {route.deviceName ? `· ${route.deviceName}` : "· Any vehicle"}</div></div><span className={`mt-0.5 flex h-5 items-center gap-1 rounded-full px-2 text-[9px] font-bold ${route.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}><FiCheck />{route.active ? "Active" : "Paused"}</span></div><div className="mt-3 flex items-center justify-between text-[10px] text-[#64748b]"><span>{route.startName || "Start"} → {route.endName || "End"}</span><button type="button" aria-label="Delete route" onClick={(event) => { event.stopPropagation(); removeRoute(route); }} className="grid h-7 w-7 place-items-center rounded-md text-red-500 hover:bg-red-50"><FiTrash2 /></button></div></button>)}</div>
          )}
        </aside>

        <section className="relative min-h-[450px] overflow-hidden rounded-md border border-[#d9e5e4] bg-[#e8f0ef]">
          <RouteCanvas path={visiblePath} drawing={drawing} onMapClick={drawing ? (coordinate) => setPoints((current) => [...current, coordinate]) : undefined} />
          {drawing && <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-[#061337]/90 px-3 py-2 text-[11px] font-bold text-white shadow-lg">Tap the map to add the next route point</div>}
          {!drawing && selected && <div className="absolute left-3 top-3 max-w-[280px] rounded-md bg-white/95 p-3 shadow-lg"><div className="text-sm font-extrabold text-[#0D4A47]">{selected.name}</div><div className="mt-1 text-[11px] text-[#64748b]">{selected.description || `${selected.startName || "Start"} to ${selected.endName || "end"}`}</div><div className="mt-2 text-[10px] font-bold text-[#0D8A80]">{formatDistance(selected.distanceM)}</div></div>}
        </section>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required = false }: { label: string; value: string; onChange: (value: string) => void; required?: boolean }) { return <label className="block text-[10px] font-bold uppercase text-[#64748b]">{label}{required ? " *" : ""}<input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-[#cbd5e1] px-3 text-xs normal-case text-[#0D4A47]" /></label>; }
function listFrom<T>(data: unknown): T[] { if (Array.isArray(data)) return data as T[]; if (data && typeof data === "object" && Array.isArray((data as { content?: unknown[] }).content)) return (data as { content: T[] }).content; return []; }
function parsePath(value: string): Coordinate[] { try { const parsed = JSON.parse(value); return Array.isArray(parsed?.coordinates) ? parsed.coordinates : []; } catch { return []; } }
function formatDistance(meters?: number) { return `${((meters ?? 0) / 1000).toFixed((meters ?? 0) >= 10000 ? 1 : 2)} km`; }
function estimateDistance(points: Coordinate[]) { let meters = 0; for (let i = 1; i < points.length; i++) meters += distance(points[i - 1], points[i]); return formatDistance(meters); }
function distance(a: Coordinate, b: Coordinate) { const radius = 6371000; const lat1 = a[1] * Math.PI / 180; const lat2 = b[1] * Math.PI / 180; const dLat = lat2 - lat1; const dLng = (b[0] - a[0]) * Math.PI / 180; const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2; return 2 * radius * Math.asin(Math.sqrt(h)); }

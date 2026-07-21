"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiList,
  FiMap,
  FiMoreHorizontal,
  FiPlus,
  FiSearch,
  FiSquare,
  FiTrash2,
  FiTruck,
  FiX,
} from "react-icons/fi";

type Geofence = {
  id: string;
  name: string;
  geofenceType: string;
  severity: string;
  active: boolean;
  centerLat?: number | null;
  centerLng?: number | null;
  radiusM?: number | null;
  address?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  vehicleCount?: number | null;
};

const SAMPLE_ZONES: Geofence[] = [
  {
    id: "sample-apapa",
    name: "Apapa Port",
    geofenceType: "CIRCLE",
    severity: "HIGH",
    active: true,
    centerLat: 6.4506,
    centerLng: 3.3642,
    radiusM: 4994,
    address: "Apapa Port Complex, Lagos, Nigeria",
    updatedAt: "2026-01-31T05:13:00.000Z",
    vehicleCount: 0,
  },
  {
    id: "sample-ikeja",
    name: "Ikeja Depot",
    geofenceType: "CIRCLE",
    severity: "MEDIUM",
    active: true,
    centerLat: 6.6018,
    centerLng: 3.3515,
    radiusM: 5422,
    address: "Ikeja Industrial Estate, Oba Akran Avenue, Lagos",
    updatedAt: "2026-01-22T19:09:00.000Z",
    vehicleCount: 0,
  },
  {
    id: "sample-lekki",
    name: "Lekki Service Zone",
    geofenceType: "POLYGON",
    severity: "LOW",
    active: true,
    centerLat: 6.4698,
    centerLng: 3.5852,
    radiusM: 2513,
    address: "Lekki-Epe Expressway, Lagos, Nigeria",
    updatedAt: "2026-01-21T18:04:00.000Z",
    vehicleCount: 0,
  },
  {
    id: "sample-vi",
    name: "Victoria Island",
    geofenceType: "CIRCLE",
    severity: "LOW",
    active: false,
    centerLat: 6.4281,
    centerLng: 3.4219,
    radiusM: 3200,
    address: "Ahmadu Bello Way, Victoria Island, Lagos",
    updatedAt: "2026-01-20T14:32:00.000Z",
    vehicleCount: 0,
  },
];

const MARKER_POSITIONS = [
  { left: "31%", top: "60%" },
  { left: "43%", top: "53%" },
  { left: "67%", top: "40%" },
  { left: "79%", top: "55%" },
  { left: "53%", top: "67%" },
  { left: "24%", top: "44%" },
];

function formatDate(value?: string | null) {
  if (!value) return "Last edited recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Last edited recently";
  return `Last edited ${date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })}, ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatRadius(radius?: number | null) {
  if (!radius) return "Radius: --";
  return `Radius : ${Math.round(radius).toLocaleString()} meters`;
}

function geofenceAddress(zone: Geofence) {
  if (zone.address) return zone.address;
  if (zone.centerLat && zone.centerLng) return `${zone.centerLat.toFixed(4)}, ${zone.centerLng.toFixed(4)}`;
  return zone.geofenceType === "POLYGON" ? "Custom polygon boundary" : "Circle boundary";
}

export default function GeofencesPage() {
  const [zones, setZones] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    geofenceType: "CIRCLE",
    severity: "LOW",
    centerLat: "",
    centerLng: "",
    radiusM: "",
    geometryJson: "",
  });
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/geofences").catch(() => null);
    if (r?.ok) {
      const d = await r.json();
      setZones(Array.isArray(d) ? d : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadInitial() {
      const r = await fetch("/api/geofences").catch(() => null);
      if (cancelled) return;
      if (r?.ok) {
        const d = await r.json();
        if (!cancelled) setZones(Array.isArray(d) ? d : []);
      }
      if (!cancelled) setLoading(false);
    }
    void loadInitial();
    return () => {
      cancelled = true;
    };
  }, []);

  const sourceZones = zones.length > 0 ? zones : SAMPLE_ZONES;

  const filteredZones = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sourceZones.filter((zone) => {
      const matchesQuery =
        !needle ||
        zone.name.toLowerCase().includes(needle) ||
        geofenceAddress(zone).toLowerCase().includes(needle);
      const matchesCategory = category === "all" || zone.geofenceType === category;
      const matchesStatus =
        status === "all" ||
        (status === "active" && zone.active) ||
        (status === "inactive" && !zone.active);
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [category, query, sourceZones, status]);

  const activeSelectedId =
    selectedId && filteredZones.some((zone) => zone.id === selectedId)
      ? selectedId
      : filteredZones[0]?.id ?? null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name,
      geofenceType: form.geofenceType,
      severity: form.severity,
      centerLat: form.centerLat ? parseFloat(form.centerLat) : null,
      centerLng: form.centerLng ? parseFloat(form.centerLng) : null,
      radiusM: form.radiusM ? parseFloat(form.radiusM) : null,
      geometryJson:
        form.geometryJson ||
        JSON.stringify({
          type: "Circle",
          coordinates: [parseFloat(form.centerLng || "0"), parseFloat(form.centerLat || "0")],
          radius: parseFloat(form.radiusM || "500"),
        }),
    };
    await fetch("/api/geofences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ name: "", geofenceType: "CIRCLE", severity: "LOW", centerLat: "", centerLng: "", radiusM: "", geometryJson: "" });
    load();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/geofences/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    load();
  }

  async function del(id: string) {
    await fetch(`/api/geofences/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="flex h-full min-h-[720px] flex-col overflow-hidden bg-[#f3f4f6] text-[#111827]">
      <header className="flex h-[58px] flex-shrink-0 items-center border-b border-[#e5e7eb] bg-[#ffffff] px-5">
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "#3949ab" }}>Geofences</h1>
      </header>

      <section className="flex flex-shrink-0 flex-wrap items-center gap-3 border-b border-[#e5e7eb] bg-[#ffffff] px-5 py-4">
        <label className="flex h-11 min-w-[170px] items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm text-[#6b7280] shadow-sm">
          <FiSearch className="h-4 w-4 text-[#9ca3af]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9ca3af]"
          />
        </label>

        <label className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 min-w-[220px] appearance-none rounded-lg border border-[#e5e7eb] bg-white px-4 pr-10 text-sm text-[#374151] shadow-sm outline-none"
          >
            <option value="all">Geofence Category</option>
            <option value="CIRCLE">Circle Geofences</option>
            <option value="POLYGON">Polygon Geofences</option>
          </select>
          <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
        </label>

        <label className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-11 min-w-[220px] appearance-none rounded-lg border border-[#e5e7eb] bg-white px-4 pr-10 text-sm text-[#374151] shadow-sm outline-none"
          >
            <option value="active">Active Geofences</option>
            <option value="inactive">Inactive Geofences</option>
            <option value="all">All Geofences</option>
          </select>
          <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
        </label>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden items-center rounded-lg border border-[#e5e7eb] bg-white p-1 shadow-sm sm:flex">
            <button className="grid h-8 w-8 place-items-center rounded-md bg-[#e0f7fa] text-[#00bcd4]" aria-label="Map view">
              <FiMap className="h-4 w-4" />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-md text-[#9ca3af]" aria-label="List view">
              <FiList className="h-4 w-4" />
            </button>
          </div>
          <button className="grid h-11 w-11 place-items-center rounded-lg border border-[#e5e7eb] bg-white text-[#6b7280] shadow-sm" aria-label="Filter">
            <FiFilter className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
            style={{ background: "#3949ab" }}
          >
            <FiPlus className="h-4 w-4" />
            Add Geofence
          </button>
          <button className="grid h-11 w-11 place-items-center rounded-lg border border-[#e5e7eb] bg-white text-[#6b7280] shadow-sm" aria-label="More">
            <FiMoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </section>

      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-r border-[#e5e7eb] bg-[#f9fafb]">
          <div className="px-5 pb-2 pt-3 text-[11px] font-medium text-[#6b7280]">
            Last updated 21st Jul 2026, 12:49 AM
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pb-4">
            {loading ? (
              <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 text-sm text-[#6b7280]">Loading geofences...</div>
            ) : filteredZones.length === 0 ? (
              <div className="rounded-lg border border-[#e5e7eb] bg-white p-4 text-sm text-[#6b7280]">No matching geofences found.</div>
            ) : (
              filteredZones.map((zone) => (
                <div
                  key={zone.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedId(zone.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedId(zone.id);
                    }
                  }}
                  className={`w-full rounded-lg border bg-white p-3 text-left shadow-sm transition ${
                    activeSelectedId === zone.id ? "border-[#3949ab]" : "border-[#e5e7eb] hover:border-[#00bcd4]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-[#111827]">{zone.name}</div>
                      <div className="mt-2 text-[11px] font-medium text-[#6b7280]">{formatDate(zone.updatedAt)}</div>
                    </div>
                    {zones.length > 0 && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          del(zone.id);
                        }}
                        className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md text-[#ef4444] hover:bg-[#fef2f2]"
                        aria-label={`Delete ${zone.name}`}
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 truncate text-xs font-medium text-[#4b5563]">{geofenceAddress(zone)}</div>

                  <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-md bg-[#f3f4f6]">
                    <div className="flex min-h-[42px] items-center gap-2 px-2 text-[11px] text-[#6b7280]">
                      <FiSquare className="h-4 w-4 text-[#00bcd4]" />
                      <span className="leading-tight">{formatRadius(zone.radiusM)}</span>
                    </div>
                    <div className="flex min-h-[42px] items-center gap-2 bg-white/60 px-2 text-[11px] text-[#6b7280]">
                      <FiTruck className="h-4 w-4 text-[#3949ab]" />
                      <span className="leading-tight">{zone.vehicleCount ?? 0} Vehicles Currently</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${zone.active ? "bg-[#e8eaf6] text-[#3949ab]" : "bg-[#f3f4f6] text-[#6b7280]"}`}>
                      {zone.active ? "Active" : "Inactive"}
                    </span>
                    {zones.length > 0 && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleActive(zone.id, zone.active);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleActive(zone.id, zone.active);
                          }
                        }}
                        className="text-[11px] font-bold text-[#00bcd4]"
                      >
                        Toggle
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex h-14 flex-shrink-0 items-center justify-between border-t border-[#e5e7eb] bg-[#f9fafb] px-5 text-sm text-[#6b7280]">
            <span>
              Showing 1 - {filteredZones.length || 0} of {filteredZones.length || 0}
            </span>
            <div className="flex items-center gap-3">
              <FiChevronLeft className="h-4 w-4 text-[#9ca3af]" />
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white font-bold text-[#111827] shadow-sm">1</span>
              <span>/ 1</span>
              <FiChevronRight className="h-4 w-4 text-[#9ca3af]" />
            </div>
          </div>
        </aside>

        <section className="relative min-h-[520px] overflow-hidden bg-[#e0f2fe]">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(57,73,171,0.08)_1px,transparent_1px),linear-gradient(rgba(57,73,171,0.08)_1px,transparent_1px)] bg-[size:64px_64px]" />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 640" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 408 C125 368 210 405 320 362 C455 308 548 326 652 281 C765 232 847 246 1000 202 L1000 640 L0 640 Z" fill="#89c7f4" />
            <path d="M0 188 C124 220 203 178 306 208 C404 237 480 190 582 228 C698 271 787 214 1000 242" fill="none" stroke="#80aeca" strokeWidth="2" />
            <path d="M70 544 C222 425 365 424 485 326 C606 228 740 214 922 95" fill="none" stroke="#ffffff" strokeWidth="6" opacity=".85" />
            <path d="M70 544 C222 425 365 424 485 326 C606 228 740 214 922 95" fill="none" stroke="#8bb3cc" strokeWidth="2" strokeDasharray="7 9" />
            <path d="M144 95 C260 171 349 179 447 256 C546 334 648 372 774 525" fill="none" stroke="#ffffff" strokeWidth="5" opacity=".9" />
            <path d="M144 95 C260 171 349 179 447 256 C546 334 648 372 774 525" fill="none" stroke="#8bb3cc" strokeWidth="1.8" strokeDasharray="6 8" />
            <path d="M305 78 C328 174 308 264 370 348 C426 425 425 507 398 640" fill="none" stroke="#9bc4dd" strokeWidth="3" />
            <path d="M610 0 C594 128 636 219 613 323 C592 422 640 521 618 640" fill="none" stroke="#9bc4dd" strokeWidth="3" />
            <path d="M0 328 C132 299 224 305 360 276 C490 248 626 197 1000 188" fill="none" stroke="#b2d2e5" strokeWidth="2" />
            <path d="M0 452 C171 467 298 511 443 477 C592 443 718 466 1000 438" fill="none" stroke="#b2d2e5" strokeWidth="2" />
          </svg>

          <div className="absolute left-[12%] top-[22%] text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">Mainland</div>
          <div className="absolute left-[38%] top-[32%] text-3xl font-bold text-[#3949ab]">Lagos</div>
          <div className="absolute left-[55%] top-[58%] text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">Lekki</div>
          <div className="absolute left-[20%] top-[68%] text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">Apapa</div>
          <div className="absolute left-[74%] top-[33%] text-xs font-semibold uppercase tracking-[0.18em] text-[#6b7280]">Ikorodu</div>

          {filteredZones.map((zone, index) => {
            const position = MARKER_POSITIONS[index % MARKER_POSITIONS.length];
            const selected = activeSelectedId === zone.id;
            return (
              <button
                key={`${zone.id}-marker`}
                onClick={() => setSelectedId(zone.id)}
                className={`absolute z-10 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white font-black text-white shadow-lg transition ${
                  selected ? "h-10 w-10 text-sm ring-4 ring-[#3949ab]/20" : "h-8 w-8 text-xs"
                }`}
                style={{ background: selected ? "#3949ab" : "#00bcd4", left: position.left, top: position.top }}
                aria-label={`Select ${zone.name}`}
              >
                G
              </button>
            );
          })}

          <button className="absolute right-5 top-5 z-20 flex h-10 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-4 text-sm font-bold text-[#374151] shadow-lg">
            <FiChevronLeft className="h-4 w-4" />
            More Options
          </button>

          <div className="absolute bottom-5 right-5 z-20 grid gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#6b7280] shadow-lg">+</button>
            <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#6b7280] shadow-lg">-</button>
          </div>

          <div className="absolute bottom-3 left-4 z-20 text-sm font-bold text-[#3949ab]">Smart Tracker</div>
          <div className="absolute bottom-3 right-24 z-20 flex items-center gap-2 text-[10px] text-[#374151]">
            <span className="rounded bg-white/85 px-2 py-1">Keyboard shortcuts</span>
            <span className="rounded bg-white/85 px-2 py-1">Map data 2026</span>
            <span className="h-1 w-20 bg-[#3949ab]" />
            <span>100 km</span>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="absolute right-5 top-20 z-30 w-[min(420px,calc(100%-2.5rem))] rounded-lg border border-[#e5e7eb] bg-white p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#111827]">Add Geofence</div>
                  <div className="mt-1 text-xs text-[#6b7280]">Create a circle or polygon boundary.</div>
                </div>
                <button type="button" onClick={() => setShowForm(false)} className="grid h-8 w-8 place-items-center rounded-md text-[#6b7280] hover:bg-[#f3f4f6]">
                  <FiX className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3">
                <input
                  required
                  placeholder="Zone name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="h-10 rounded-lg border border-[#e5e7eb] px-3 text-sm outline-none focus:border-[#00bcd4]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={form.geofenceType}
                    onChange={(e) => setForm((f) => ({ ...f, geofenceType: e.target.value }))}
                    className="h-10 rounded-lg border border-[#e5e7eb] px-3 text-sm outline-none"
                  >
                    <option>CIRCLE</option>
                    <option>POLYGON</option>
                  </select>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
                    className="h-10 rounded-lg border border-[#e5e7eb] px-3 text-sm outline-none"
                  >
                    <option>LOW</option>
                    <option>MEDIUM</option>
                    <option>HIGH</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    placeholder="Center lat"
                    value={form.centerLat}
                    onChange={(e) => setForm((f) => ({ ...f, centerLat: e.target.value }))}
                    className="h-10 rounded-lg border border-[#e5e7eb] px-3 text-sm outline-none focus:border-[#00bcd4]"
                  />
                  <input
                    placeholder="Center lng"
                    value={form.centerLng}
                    onChange={(e) => setForm((f) => ({ ...f, centerLng: e.target.value }))}
                    className="h-10 rounded-lg border border-[#e5e7eb] px-3 text-sm outline-none focus:border-[#00bcd4]"
                  />
                </div>
                <input
                  placeholder="Radius (metres)"
                  value={form.radiusM}
                  onChange={(e) => setForm((f) => ({ ...f, radiusM: e.target.value }))}
                  className="h-10 rounded-lg border border-[#e5e7eb] px-3 text-sm outline-none focus:border-[#00bcd4]"
                />
                <button type="submit" disabled={saving} className="h-10 rounded-lg text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60" style={{ background: "#3949ab" }}>
                  {saving ? "Saving..." : "Save Geofence"}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

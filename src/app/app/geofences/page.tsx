"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiFilter,
  FiList,
  FiMap,
  FiMapPin,
  FiMoreHorizontal,
  FiPlus,
  FiSearch,
  FiSquare,
  FiTrash2,
  FiTruck,
  FiX,
} from "react-icons/fi";

const MapboxMap = dynamic(() => import("@/components/MapboxMap"), { ssr: false });

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
  location?: string | null;
  category?: string | null;
  tagsJson?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  vehicleCount?: number | null;
};

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
  if (zone.location) return zone.location;
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
    locationQuery: "",
    category: "",
    tags: "",
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

  const sourceZones = zones;

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
      radiusM: form.radiusM ? parseFloat(form.radiusM) : 500,
      location: form.locationQuery || null,
      category: form.category || null,
      tagsJson: form.tags ? JSON.stringify([form.tags]) : null,
      geometryJson:
        form.geometryJson ||
        JSON.stringify({
          type: form.geofenceType === "POLYGON" ? "Polygon" : "Circle",
          coordinates: [parseFloat(form.centerLng || "0"), parseFloat(form.centerLat || "0")],
          radius: parseFloat(form.radiusM || "500"),
          location: form.locationQuery || undefined,
          category: form.category || undefined,
          tags: form.tags ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : undefined,
        }),
    };
    const res = await fetch("/api/geofences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const saved = res.ok ? await res.json().catch(() => null) : null;
    if (saved?.id) {
      setZones((prev) => [saved, ...prev.filter((zone) => zone.id !== saved.id)]);
      setSelectedId(saved.id);
      setQuery("");
      setCategory("all");
      setStatus(saved.active === false ? "inactive" : "active");
    }
    setSaving(false);
    setShowForm(false);
    setForm({ name: "", geofenceType: "CIRCLE", severity: "LOW", centerLat: "", centerLng: "", radiusM: "", geometryJson: "", locationQuery: "", category: "", tags: "" });
    await load();
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
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "#166534" }}>Geofences</h1>
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
            <button className="grid h-8 w-8 place-items-center rounded-md bg-[#dcfce7] text-[#166534]" aria-label="Map view">
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
            style={{ background: "#166534" }}
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
                    activeSelectedId === zone.id ? "border-[#166534]" : "border-[#e5e7eb] hover:border-[#15803d]"
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
                      <FiSquare className="h-4 w-4 text-[#166534]" />
                      <span className="leading-tight">{formatRadius(zone.radiusM)}</span>
                    </div>
                    <div className="flex min-h-[42px] items-center gap-2 bg-white/60 px-2 text-[11px] text-[#6b7280]">
                      <FiTruck className="h-4 w-4 text-[#166534]" />
                      <span className="leading-tight">{zone.vehicleCount ?? 0} Vehicles Currently</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${zone.active ? "bg-[#dcfce7] text-[#166534]" : "bg-[#f3f4f6] text-[#6b7280]"}`}>
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
                        className="text-[11px] font-bold text-[#15803d]"
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

        <section className="relative min-h-[520px] overflow-hidden">
          <MapboxMap
            markers={filteredZones.map(zone => ({
              id: zone.id,
              lat: zone.centerLat ?? 6.5244,
              lng: zone.centerLng ?? 3.3792,
              color: zone.active ? "#166534" : "#9ca3af",
              pulsing: zone.active,
              popupHtml: `<div style="color:#e5e7eb;padding:8px 0;"><strong style="color:#fff;font-size:14px;">${zone.name}</strong><br/><span style="font-size:12px;">${geofenceAddress(zone)}</span><br/><span style="font-size:11px;color:#9ca3af;">${formatDate(zone.updatedAt)}</span></div>`,
            }))}
            flyToId={activeSelectedId ?? ""}
            center={[3.3792, 6.5244]}
            zoom={filteredZones.length > 0 ? 10 : 5}
            style="mapbox://styles/mapbox/streets-v12"
            className="w-full h-full"
            onMarkerClick={setSelectedId}
          />

          {showForm && (
            <form onSubmit={handleSubmit} className="absolute right-5 top-5 z-30 max-h-[calc(100%-2.5rem)] w-[min(520px,calc(100%-2.5rem))] overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e7eb] bg-white px-5 py-4">
                <div>
                  <div className="text-lg font-extrabold text-[#111827]">Add Geofence</div>
                </div>
                <button type="button" onClick={() => setShowForm(false)} className="grid h-8 w-8 place-items-center rounded-md text-[#6b7280] hover:bg-[#f3f4f6]">
                  <FiX className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5 px-5 py-5">
                <section>
                  <h2 className="mb-3 text-sm font-extrabold text-[#111827]">Basic Information</h2>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-[#374151]">Name*</span>
                    <input
                      required
                      placeholder="Enter Geofence Name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      className="h-11 w-full rounded-lg border border-[#d1d5db] px-3 text-sm outline-none placeholder:text-[#9ca3af] focus:border-[#166534]"
                    />
                  </label>
                </section>

                <section>
                  <h2 className="mb-3 text-sm font-extrabold text-[#111827]">Geofence Details</h2>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-[#374151]">Find Location</span>
                    <div className="flex h-11 items-center gap-2 rounded-lg border border-[#d1d5db] px-3">
                      <FiSearch className="h-4 w-4 text-[#9ca3af]" />
                      <input
                        placeholder="Search By Location"
                        value={form.locationQuery}
                        onChange={(e) => setForm((f) => ({ ...f, locationQuery: e.target.value }))}
                        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#9ca3af]"
                      />
                    </div>
                  </label>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-[#374151]">Latitude</span>
                      <input
                        inputMode="decimal"
                        placeholder="Enter Latitude"
                        value={form.centerLat}
                        onChange={(e) => setForm((f) => ({ ...f, centerLat: e.target.value }))}
                        className="h-11 w-full rounded-lg border border-[#d1d5db] px-3 text-sm outline-none placeholder:text-[#9ca3af] focus:border-[#166534]"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-[#374151]">Longitude</span>
                      <input
                        inputMode="decimal"
                        placeholder="Enter Longitude"
                        value={form.centerLng}
                        onChange={(e) => setForm((f) => ({ ...f, centerLng: e.target.value }))}
                        className="h-11 w-full rounded-lg border border-[#d1d5db] px-3 text-sm outline-none placeholder:text-[#9ca3af] focus:border-[#166534]"
                      />
                    </label>
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-lg bg-[#f9fafb] px-3 py-2 text-sm text-[#4b5563]">
                    <FiMapPin className="h-4 w-4 text-[#166534]" />
                    <span className="font-bold text-[#111827]">Location :</span>
                    <span className="min-w-0 truncate">
                      {form.locationQuery || (form.centerLat && form.centerLng ? `${form.centerLat}, ${form.centerLng}` : "-")}
                    </span>
                  </div>
                </section>

                <section>
                  <h2 className="mb-3 text-sm font-extrabold text-[#111827]">Shape</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, geofenceType: "CIRCLE" }))}
                      className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-bold transition ${
                        form.geofenceType === "CIRCLE"
                          ? "border-[#166534] bg-[#dcfce7] text-[#166534]"
                          : "border-[#d1d5db] bg-white text-[#374151] hover:border-[#166534]"
                      }`}
                    >
                      <FiSquare className="h-4 w-4" />
                      Square
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, geofenceType: "POLYGON" }))}
                      className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-bold transition ${
                        form.geofenceType === "POLYGON"
                          ? "border-[#166534] bg-[#dcfce7] text-[#166534]"
                          : "border-[#d1d5db] bg-white text-[#374151] hover:border-[#166534]"
                      }`}
                    >
                      <FiMap className="h-4 w-4" />
                      Draw / Custom
                    </button>
                  </div>

                  <label className="mt-3 block">
                    <span className="mb-1.5 block text-xs font-bold text-[#374151]">Radius (In Meters)</span>
                    <input
                      inputMode="numeric"
                      placeholder="Enter Radius"
                      value={form.radiusM}
                      onChange={(e) => setForm((f) => ({ ...f, radiusM: e.target.value }))}
                      className="h-11 w-full rounded-lg border border-[#d1d5db] px-3 text-sm outline-none placeholder:text-[#9ca3af] focus:border-[#166534]"
                    />
                    <span className="mt-1.5 block text-xs font-medium text-[#6b7280]">Default Radius : 500 meters</span>
                  </label>
                </section>

                <section>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-[#374151]">Geofence Category</span>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        className="h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3 text-sm text-[#374151] outline-none focus:border-[#166534]"
                      >
                        <option value="">Geofence Category</option>
                        <option value="Depot">Depot</option>
                        <option value="Customer Site">Customer Site</option>
                        <option value="Restricted Zone">Restricted Zone</option>
                        <option value="Service Area">Service Area</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-[#374151]">Tags</span>
                      <select
                        value={form.tags}
                        onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                        className="h-11 w-full rounded-lg border border-[#d1d5db] bg-white px-3 text-sm text-[#374151] outline-none focus:border-[#166534]"
                      >
                        <option value="">Select Tags</option>
                        <option value="High Priority">High Priority</option>
                        <option value="Fuel Monitoring">Fuel Monitoring</option>
                        <option value="Security">Security</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </label>
                  </div>
                </section>

                <div className="flex items-center justify-end gap-2 border-t border-[#e5e7eb] pt-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="h-10 rounded-lg border border-[#d1d5db] bg-white px-4 text-sm font-bold text-[#374151] hover:bg-[#f9fafb]"
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={saving} className="h-10 rounded-lg px-5 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60" style={{ background: "#166534" }}>
                    {saving ? "Saving..." : "Save Geofence"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

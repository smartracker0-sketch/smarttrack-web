"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiSearch, FiTrash2, FiUsers, FiX } from "react-icons/fi";

type Group = { id: string; name: string; payload: { vehicles?: string[] }; updatedAt: string };

export default function VehicleGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Group | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [vehicles, setVehicles] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/fleet-records/vehicle-group", { cache: "no-store" });
    if (response.ok) setGroups(await response.json());
    else setError("Vehicle groups could not be loaded.");
  }, []);
  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); }, [load]);

  const filtered = useMemo(() => groups.filter((group) =>
    `${group.name} ${(group.payload.vehicles ?? []).join(" ")}`.toLowerCase().includes(query.toLowerCase())), [groups, query]);

  function show(group?: Group) {
    setEditing(group ?? null); setName(group?.name ?? "");
    setVehicles((group?.payload.vehicles ?? []).join(", ")); setError(""); setOpen(true);
  }

  async function save() {
    if (!name.trim()) { setError("Group name is required."); return; }
    setBusy(true);
    const response = await fetch(editing ? `/api/fleet-records/vehicle-group/${editing.id}` : "/api/fleet-records/vehicle-group", {
      method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, payload: { vehicles: vehicles.split(",").map((value) => value.trim()).filter(Boolean) }, active: true }),
    });
    setBusy(false);
    if (!response.ok) { setError("The group could not be saved."); return; }
    setOpen(false); await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this vehicle group?")) return;
    const response = await fetch(`/api/fleet-records/vehicle-group/${id}`, { method: "DELETE" });
    if (response.ok) await load(); else setError("The group could not be deleted.");
  }

  return <div className="space-y-4 p-4 sm:p-6">
    <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold text-[#1a7a75]">Vehicles</p><h1 className="text-xl font-extrabold text-[#0d4a47]">Vehicle Groups</h1><p className="mt-1 text-xs text-slate-500">Organise vehicles for reports, alerts, and daily operations.</p></div><button onClick={() => show()} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0d756d] px-4 text-xs font-bold text-white"><FiPlus />Add group</button></header>
    <div className="relative max-w-md"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search groups or vehicles" className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#0d756d]" /></div>
    {error && !open && <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">{filtered.length === 0 ? <div className="grid place-items-center px-5 py-16 text-center"><FiUsers className="text-3xl text-[#6ca8a3]" /><p className="mt-3 text-sm font-bold text-[#0d4a47]">No vehicle groups</p><p className="mt-1 text-xs text-slate-500">Create a group to organise your fleet.</p></div> : filtered.map((group) => <div key={group.id} className="flex items-center gap-3 border-b border-slate-100 px-4 py-4 last:border-0"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#e8f4f3] text-[#0d756d]"><FiUsers /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#0d4a47]">{group.name}</p><p className="truncate text-xs text-slate-500">{group.payload.vehicles?.join(", ") || "No vehicles assigned"}</p></div><button onClick={() => show(group)} className="grid h-8 w-8 place-items-center text-slate-500" aria-label="Edit group"><FiEdit2 /></button><button onClick={() => void remove(group.id)} className="grid h-8 w-8 place-items-center text-red-500" aria-label="Delete group"><FiTrash2 /></button></div>)}</div>
    {open && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"><div className="w-full max-w-md rounded-md bg-white shadow-xl"><header className="flex items-center justify-between border-b px-5 py-4"><h2 className="text-sm font-extrabold text-[#0d4a47]">{editing ? "Edit group" : "New vehicle group"}</h2><button onClick={() => setOpen(false)}><FiX /></button></header><div className="space-y-4 p-5"><label className="grid gap-1 text-xs font-bold text-slate-600">Group name<input value={name} onChange={(e) => setName(e.target.value)} className="h-10 rounded-md border px-3 text-sm font-normal outline-none focus:border-[#0d756d]" /></label><label className="grid gap-1 text-xs font-bold text-slate-600">Vehicles or registration numbers<textarea value={vehicles} onChange={(e) => setVehicles(e.target.value)} rows={4} placeholder="Separate vehicles with commas" className="rounded-md border px-3 py-2 text-sm font-normal outline-none focus:border-[#0d756d]" /></label>{error && <p className="text-xs text-red-600">{error}</p>}</div><footer className="flex justify-end gap-2 border-t px-5 py-4"><button onClick={() => setOpen(false)} className="h-9 rounded-md border px-4 text-xs font-bold">Cancel</button><button disabled={busy} onClick={() => void save()} className="h-9 rounded-md bg-[#0d756d] px-4 text-xs font-bold text-white disabled:opacity-50">{busy ? "Saving..." : "Save group"}</button></footer></div></div>}
  </div>;
}

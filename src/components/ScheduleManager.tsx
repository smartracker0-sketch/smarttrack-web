"use client";

import { useCallback, useEffect, useState } from "react";
import { FiCalendar, FiPlus, FiTrash2 } from "react-icons/fi";

type Schedule = { id: string; name: string; active: boolean; payload: { frequency?: string; nextRun?: string; recipients?: string; target?: string } };

export default function ScheduleManager({ type, title, description }: { type: string; title: string; description: string }) {
  const [items, setItems] = useState<Schedule[]>([]);
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("WEEKLY");
  const [nextRun, setNextRun] = useState("");
  const [recipients, setRecipients] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const response = await fetch(`/api/fleet-records/${type}`, { cache: "no-store" });
    if (response.ok) setItems(await response.json()); else setError("Schedules could not be loaded.");
  }, [type]);
  useEffect(() => { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); }, [load]);

  async function create() {
    if (!name.trim() || !nextRun) { setError("Name and next run are required."); return; }
    const response = await fetch(`/api/fleet-records/${type}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, active: true, payload: { frequency, nextRun, recipients } }) });
    if (!response.ok) { setError("Schedule could not be created."); return; }
    setName(""); setNextRun(""); setRecipients(""); setError(""); await load();
  }
  async function toggle(item: Schedule) {
    await fetch(`/api/fleet-records/${type}/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !item.active }) }); await load();
  }
  async function remove(id: string) { if (!window.confirm("Delete this schedule?")) return; await fetch(`/api/fleet-records/${type}/${id}`, { method: "DELETE" }); await load(); }

  return <div className="space-y-5 p-4 sm:p-6"><header><p className="text-xs font-semibold text-[#1a7a75]">Automation</p><h1 className="text-xl font-extrabold text-[#0d4a47]">{title}</h1><p className="mt-1 text-xs text-slate-500">{description}</p></header>
    <section className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 md:grid-cols-5"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Schedule name" className="h-10 rounded-md border px-3 text-sm" /><select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="h-10 rounded-md border px-3 text-sm"><option>DAILY</option><option>WEEKLY</option><option>MONTHLY</option><option>ONCE</option></select><input type="datetime-local" value={nextRun} onChange={(e) => setNextRun(e.target.value)} className="h-10 rounded-md border px-3 text-sm" /><input value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="Email recipients" className="h-10 rounded-md border px-3 text-sm" /><button onClick={() => void create()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#0d756d] px-4 text-xs font-bold text-white"><FiPlus />Create</button>{error && <p className="text-xs text-red-600 md:col-span-5">{error}</p>}</section>
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white">{items.length === 0 ? <div className="grid place-items-center py-16 text-center"><FiCalendar className="text-3xl text-[#6ca8a3]" /><p className="mt-3 text-sm font-bold text-[#0d4a47]">No schedules created</p></div> : items.map((item) => <div key={item.id} className="grid items-center gap-3 border-b px-4 py-4 last:border-0 sm:grid-cols-[1fr_120px_180px_auto]"><div><p className="text-sm font-bold text-[#0d4a47]">{item.name}</p><p className="text-xs text-slate-500">{item.payload.recipients || "No email recipient"}</p></div><span className="text-xs font-semibold text-slate-600">{item.payload.frequency}</span><span className="text-xs text-slate-500">{item.payload.nextRun ? new Date(item.payload.nextRun).toLocaleString() : "Not scheduled"}</span><div className="flex items-center gap-2"><button onClick={() => void toggle(item)} className={`h-8 rounded-full px-3 text-[10px] font-bold ${item.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{item.active ? "Active" : "Paused"}</button><button onClick={() => void remove(item.id)} className="grid h-8 w-8 place-items-center text-red-500"><FiTrash2 /></button></div></div>)}</section>
  </div>;
}

"use client";
import { useState, useEffect, useCallback } from "react";

type Tyre = { id: string; position: string; brand?: string; vehiclePlate?: string; status: string; pressurePsi?: number; nextCheckDate?: string; };

const STATUS_COLORS: Record<string, string> = { GOOD: '#22C55E', WORN: '#F59E0B', REPLACE: '#EF4444', DAMAGED: '#7C3AED' };

export default function TyreManagementPage() {
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ position: '', brand: '', vehiclePlate: '', status: 'GOOD', pressurePsi: '', installedAt: '', nextCheckDate: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/tyres').catch(() => null);
    if (r?.ok) { const d = await r.json(); setTyres(Array.isArray(d) ? d : d?.content ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch('/api/tyres', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...form, pressurePsi: form.pressurePsi ? parseFloat(form.pressurePsi) : null }),
    });
    setSaving(false); setShowForm(false);
    setForm({ position: '', brand: '', vehiclePlate: '', status: 'GOOD', pressurePsi: '', installedAt: '', nextCheckDate: '', notes: '' }); load();
  }

  async function del(id: string) { await fetch(`/api/tyres/${id}`, { method: 'DELETE' }); load(); }

  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Tyre Management</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Track tyre health, pressure, rotation schedules, and replacements.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Tyre records</div>
          <button onClick={() => setShowForm(v => !v)} className="text-xs font-semibold px-4 py-2 rounded-xl text-white" style={{ background: '#0D4A47' }}>{showForm ? 'Cancel' : '+ Add tyre'}</button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4 grid gap-3 rounded-2xl border p-4" style={{ borderColor: '#C5E0DE' }}>
            <input required placeholder="Position (e.g. Front Left)" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <div className="flex gap-2">
              <input placeholder="Brand" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm flex-1" style={{ borderColor: '#C5E0DE' }} />
              <input placeholder="Vehicle plate" value={form.vehiclePlate} onChange={e => setForm(f => ({ ...f, vehiclePlate: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm flex-1" style={{ borderColor: '#C5E0DE' }} />
            </div>
            <div className="flex gap-2">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm flex-1" style={{ borderColor: '#C5E0DE' }}>
                {['GOOD','WORN','REPLACE','DAMAGED'].map(s => <option key={s}>{s}</option>)}
              </select>
              <input type="number" step="0.1" placeholder="Pressure (PSI)" value={form.pressurePsi} onChange={e => setForm(f => ({ ...f, pressurePsi: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm flex-1" style={{ borderColor: '#C5E0DE' }} />
            </div>
            <div className="flex gap-2">
              <input type="date" placeholder="Installed" value={form.installedAt} onChange={e => setForm(f => ({ ...f, installedAt: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm flex-1" style={{ borderColor: '#C5E0DE' }} />
              <input type="date" placeholder="Next check" value={form.nextCheckDate} onChange={e => setForm(f => ({ ...f, nextCheckDate: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm flex-1" style={{ borderColor: '#C5E0DE' }} />
            </div>
            <button type="submit" disabled={saving} className="h-10 rounded-xl text-sm font-semibold text-white" style={{ background: '#0D4A47' }}>{saving ? 'Saving…' : 'Save'}</button>
          </form>
        )}
        {loading ? (
          <div className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>Loading…</div>
        ) : tyres.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E8F4F3' }}><span className="text-xl">🔧</span></div>
            <div className="text-sm font-semibold" style={{ color: '#0D4A47' }}>No tyre records yet</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>Add your first tyre record above.</div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {tyres.map(t => (
              <div key={t.id} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
                <div>
                  <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{t.vehiclePlate ? `${t.vehiclePlate} — ` : ''}{t.position}</div>
                  <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{t.brand || 'Unknown brand'}{t.pressurePsi ? ` · ${t.pressurePsi} PSI` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: (STATUS_COLORS[t.status] ?? '#9ca3af') + '1a', color: STATUS_COLORS[t.status] ?? '#9ca3af' }}>{t.status}</div>
                  <button onClick={() => del(t.id)} className="text-xs px-2 py-1 rounded-lg" style={{ color: '#EF4444' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect, useCallback } from "react";

type Geofence = { id: string; name: string; geofenceType: string; severity: string; active: boolean; centerLat?: number; centerLng?: number; radiusM?: number; };

const SEV_COLORS: Record<string, string> = { LOW: '#22C55E', MEDIUM: '#F59E0B', HIGH: '#EF4444' };

export default function GeofencesPage() {
  const [zones, setZones] = useState<Geofence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', geofenceType: 'CIRCLE', severity: 'LOW', centerLat: '', centerLng: '', radiusM: '', geometryJson: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/geofences').catch(() => null);
    if (r?.ok) { const d = await r.json(); setZones(Array.isArray(d) ? d : []); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const payload = {
      name: form.name, geofenceType: form.geofenceType, severity: form.severity,
      centerLat: form.centerLat ? parseFloat(form.centerLat) : null,
      centerLng: form.centerLng ? parseFloat(form.centerLng) : null,
      radiusM: form.radiusM ? parseFloat(form.radiusM) : null,
      geometryJson: form.geometryJson || JSON.stringify({ type: 'Circle', coordinates: [parseFloat(form.centerLng || '0'), parseFloat(form.centerLat || '0')], radius: parseFloat(form.radiusM || '500') }),
    };
    await fetch('/api/geofences', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    setSaving(false); setShowForm(false);
    setForm({ name: '', geofenceType: 'CIRCLE', severity: 'LOW', centerLat: '', centerLng: '', radiusM: '', geometryJson: '' }); load();
  }

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/geofences/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ active: !active }) }); load();
  }

  async function del(id: string) { await fetch(`/api/geofences/${id}`, { method: 'DELETE' }); load(); }

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Geofences</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Create circle and polygon geofences, schedule them and assign devices.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Zones</div>
          <button onClick={() => setShowForm(v => !v)} className="text-xs font-semibold px-4 py-2 rounded-xl text-white" style={{ background: '#0D4A47' }}>{showForm ? 'Cancel' : '+ Add zone'}</button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4 grid gap-3 rounded-2xl border p-4" style={{ borderColor: '#C5E0DE' }}>
            <input required placeholder="Zone name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <div className="flex gap-2">
              <select value={form.geofenceType} onChange={e => setForm(f => ({ ...f, geofenceType: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm flex-1" style={{ borderColor: '#C5E0DE' }}>
                <option>CIRCLE</option><option>POLYGON</option>
              </select>
              <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm flex-1" style={{ borderColor: '#C5E0DE' }}>
                <option>LOW</option><option>MEDIUM</option><option>HIGH</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input placeholder="Center lat" value={form.centerLat} onChange={e => setForm(f => ({ ...f, centerLat: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm flex-1" style={{ borderColor: '#C5E0DE' }} />
              <input placeholder="Center lng" value={form.centerLng} onChange={e => setForm(f => ({ ...f, centerLng: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm flex-1" style={{ borderColor: '#C5E0DE' }} />
            </div>
            <input placeholder="Radius (metres)" value={form.radiusM} onChange={e => setForm(f => ({ ...f, radiusM: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <button type="submit" disabled={saving} className="h-10 rounded-xl text-sm font-semibold text-white" style={{ background: '#0D4A47' }}>{saving ? 'Saving…' : 'Save'}</button>
          </form>
        )}
        {loading ? (
          <div className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>Loading…</div>
        ) : zones.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E8F4F3' }}><span className="text-xl">📍</span></div>
            <div className="text-sm font-semibold" style={{ color: '#0D4A47' }}>No geofences yet</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>Add your first zone above.</div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {zones.map(z => (
              <div key={z.id} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
                <div>
                  <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{z.name}</div>
                  <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{z.geofenceType}{z.radiusM ? ` · r=${z.radiusM}m` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: (SEV_COLORS[z.severity] ?? '#9ca3af') + '1a', color: SEV_COLORS[z.severity] ?? '#9ca3af' }}>{z.severity}</div>
                  <button onClick={() => toggleActive(z.id, z.active)} className="text-xs px-2 py-1 rounded-lg" style={{ color: z.active ? '#22C55E' : '#9ca3af' }}>{z.active ? 'Active' : 'Off'}</button>
                  <button onClick={() => del(z.id)} className="text-xs px-2 py-1 rounded-lg" style={{ color: '#EF4444' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


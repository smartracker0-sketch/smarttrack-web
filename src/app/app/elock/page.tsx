"use client";
import { useState, useEffect, useCallback } from "react";

type ELock = { id: string; lockSerial: string; status: string; notes?: string; lastEventAt?: string; };

const STATUS_COLORS: Record<string, string> = { LOCKED: '#0D4A47', UNLOCKED: '#22C55E', ERROR: '#EF4444', UNKNOWN: '#9ca3af' };

export default function ElockPage() {
  const [elocks, setElocks] = useState<ELock[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ lockSerial: '', status: 'UNKNOWN', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/elock').catch(() => null);
    if (r?.ok) { const d = await r.json(); setElocks(Array.isArray(d) ? d : d?.content ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch('/api/elock', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false); setShowForm(false);
    setForm({ lockSerial: '', status: 'UNKNOWN', notes: '' }); load();
  }

  async function setStatus(id: string, status: string) {
    await fetch(`/api/elock/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ status }) }); load();
  }

  async function del(id: string) { await fetch(`/api/elock/${id}`, { method: 'DELETE' }); load(); }

  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Security</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>E-Lock Status</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Monitor and control electronic lock status across your fleet in real time.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>E-lock devices</div>
          <button onClick={() => setShowForm(v => !v)} className="text-xs font-semibold px-4 py-2 rounded-xl text-white" style={{ background: '#0D4A47' }}>{showForm ? 'Cancel' : '+ Register e-lock'}</button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4 grid gap-3 rounded-2xl border p-4" style={{ borderColor: '#C5E0DE' }}>
            <input required placeholder="Lock serial number" value={form.lockSerial} onChange={e => setForm(f => ({ ...f, lockSerial: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }}>
              {['LOCKED','UNLOCKED','UNKNOWN'].map(s => <option key={s}>{s}</option>)}
            </select>
            <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <button type="submit" disabled={saving} className="h-10 rounded-xl text-sm font-semibold text-white" style={{ background: '#0D4A47' }}>{saving ? 'Saving…' : 'Save'}</button>
          </form>
        )}
        {loading ? (
          <div className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>Loading…</div>
        ) : elocks.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E8F4F3' }}><span className="text-xl">🔒</span></div>
            <div className="text-sm font-semibold" style={{ color: '#0D4A47' }}>No e-locks registered</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>Register your first e-lock above.</div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {elocks.map(lock => (
              <div key={lock.id} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
                <div>
                  <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{lock.lockSerial}</div>
                  {lock.lastEventAt && <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>Last event: {new Date(lock.lastEventAt).toLocaleString()}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: (STATUS_COLORS[lock.status] ?? '#9ca3af') + '1a', color: STATUS_COLORS[lock.status] ?? '#9ca3af' }}>{lock.status}</div>
                  {lock.status !== 'LOCKED' && <button onClick={() => setStatus(lock.id, 'LOCKED')} className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: '#E8F4F3', color: '#0D4A47' }}>Lock</button>}
                  {lock.status !== 'UNLOCKED' && <button onClick={() => setStatus(lock.id, 'UNLOCKED')} className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: '#dcfce7', color: '#22C55E' }}>Unlock</button>}
                  <button onClick={() => del(lock.id)} className="text-xs px-2 py-1 rounded-lg" style={{ color: '#EF4444' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

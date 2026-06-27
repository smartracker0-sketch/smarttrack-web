"use client";
import { useState, useEffect, useCallback } from "react";

type Rec = {
  id: string; task: string; vehiclePlate?: string; status: string;
  dueDate?: string; cost?: number; notes?: string;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#F59E0B', IN_PROGRESS: '#1A7A75', DONE: '#22C55E', OVERDUE: '#EF4444',
};

export default function MaintenancePage() {
  const [records, setRecords] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ task: '', vehiclePlate: '', status: 'PENDING', dueDate: '', cost: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/maintenance').catch(() => null);
    if (r?.ok) {
      const d = await r.json();
      setRecords(Array.isArray(d) ? d : d?.content ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...form, cost: form.cost ? parseFloat(form.cost) : null }),
    });
    setSaving(false);
    setShowForm(false);
    setForm({ task: '', vehiclePlate: '', status: 'PENDING', dueDate: '', cost: '', notes: '' });
    load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/maintenance/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Service History & Reminders</h1>
        <p className="mt-4 text-sm leading-6 text-muted">View past service records and upcoming reminders for all vehicles.</p>
      </div>

      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Maintenance records</div>
          <button onClick={() => setShowForm(v => !v)} className="text-xs font-semibold px-4 py-2 rounded-xl text-white" style={{ background: '#0D4A47' }}>
            {showForm ? 'Cancel' : '+ Add record'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4 grid gap-3 rounded-2xl border p-4" style={{ borderColor: '#C5E0DE' }}>
            <input required placeholder="Task (e.g. Oil change)" value={form.task} onChange={e => setForm(f => ({ ...f, task: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <input placeholder="Vehicle plate" value={form.vehiclePlate} onChange={e => setForm(f => ({ ...f, vehiclePlate: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }}>
              {['PENDING','IN_PROGRESS','DONE','OVERDUE'].map(s => <option key={s}>{s}</option>)}
            </select>
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <input type="number" step="0.01" placeholder="Cost" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <textarea placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" rows={2} style={{ borderColor: '#C5E0DE' }} />
            <button type="submit" disabled={saving} className="h-10 rounded-xl text-sm font-semibold text-white" style={{ background: '#0D4A47' }}>{saving ? 'Saving…' : 'Save'}</button>
          </form>
        )}

        {loading ? (
          <div className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>Loading…</div>
        ) : records.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E8F4F3' }}><span className="text-xl">🔧</span></div>
            <div className="text-sm font-semibold" style={{ color: '#0D4A47' }}>No maintenance records yet</div>
            <div className="text-xs max-w-xs" style={{ color: '#9ca3af' }}>Add your first service task above.</div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {records.map(rec => (
              <div key={rec.id} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
                <div>
                  <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{rec.vehiclePlate ? `${rec.vehiclePlate} — ` : ''}{rec.task}</div>
                  {rec.dueDate && <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>Due: {rec.dueDate}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: (STATUS_COLORS[rec.status] ?? '#9ca3af') + '1a', color: STATUS_COLORS[rec.status] ?? '#9ca3af' }}>{rec.status}</div>
                  <button onClick={() => handleDelete(rec.id)} className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ color: '#EF4444' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect, useCallback } from "react";

type Consigner = { id: string; name: string; consignerType: string; contactPhone?: string; contactEmail?: string; };

export default function ConsignersPage() {
  const [items, setItems] = useState<Consigner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', consignerType: 'CONSIGNOR', contactPhone: '', contactEmail: '', address: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/consigners').catch(() => null);
    if (r?.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d?.content ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch('/api/consigners', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false); setShowForm(false);
    setForm({ name: '', consignerType: 'CONSIGNOR', contactPhone: '', contactEmail: '', address: '' }); load();
  }

  async function del(id: string) { await fetch(`/api/consigners/${id}`, { method: 'DELETE' }); load(); }

  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Trips</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Consigners</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Manage consignors and consignees linked to your fleet trips and deliveries.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Consigner list</div>
          <button onClick={() => setShowForm(v => !v)} className="text-xs font-semibold px-4 py-2 rounded-xl text-white" style={{ background: '#0D4A47' }}>{showForm ? 'Cancel' : '+ Add consigner'}</button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4 grid gap-3 rounded-2xl border p-4" style={{ borderColor: '#C5E0DE' }}>
            <input required placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <select value={form.consignerType} onChange={e => setForm(f => ({ ...f, consignerType: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }}>
              <option>CONSIGNOR</option>
              <option>CONSIGNEE</option>
            </select>
            <input placeholder="Phone" value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <input placeholder="Email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <button type="submit" disabled={saving} className="h-10 rounded-xl text-sm font-semibold text-white" style={{ background: '#0D4A47' }}>{saving ? 'Saving…' : 'Save'}</button>
          </form>
        )}
        {loading ? (
          <div className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E8F4F3' }}><span className="text-xl">👥</span></div>
            <div className="text-sm font-semibold" style={{ color: '#0D4A47' }}>No consigners yet</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>Add your first consigner above.</div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {items.map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
                <div>
                  <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{c.name}</div>
                  <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{c.contactPhone || c.contactEmail || ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#E8F4F3', color: '#0D4A47' }}>{c.consignerType}</div>
                  <button onClick={() => del(c.id)} className="text-xs px-2 py-1 rounded-lg" style={{ color: '#EF4444' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

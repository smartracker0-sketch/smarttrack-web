"use client";
import { useState, useEffect, useCallback } from "react";

type Doc = { id: string; title: string; docType: string; vehiclePlate?: string; expiryDate?: string; status: string; fileUrl?: string; };

const STATUS_COLORS: Record<string, string> = { VALID: '#22C55E', EXPIRING_SOON: '#F59E0B', EXPIRED: '#EF4444' };

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', docType: 'INSURANCE', vehiclePlate: '', expiryDate: '', fileUrl: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/documents').catch(() => null);
    if (r?.ok) { const d = await r.json(); setDocs(Array.isArray(d) ? d : d?.content ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch('/api/documents', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false); setShowForm(false);
    setForm({ title: '', docType: 'INSURANCE', vehiclePlate: '', expiryDate: '', fileUrl: '' }); load();
  }

  async function del(id: string) { await fetch(`/api/documents/${id}`, { method: 'DELETE' }); load(); }

  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Documents</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Vehicle registration, insurance, permits, and compliance documents.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Documents</div>
          <button onClick={() => setShowForm(v => !v)} className="text-xs font-semibold px-4 py-2 rounded-xl text-white" style={{ background: '#0D4A47' }}>{showForm ? 'Cancel' : '+ Add document'}</button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4 grid gap-3 rounded-2xl border p-4" style={{ borderColor: '#C5E0DE' }}>
            <input required placeholder="Title (e.g. Insurance — Truck 12)" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <select value={form.docType} onChange={e => setForm(f => ({ ...f, docType: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }}>
              {['INSURANCE','REGISTRATION','PERMIT','INSPECTION','LICENCE','OTHER'].map(t => <option key={t}>{t}</option>)}
            </select>
            <input placeholder="Vehicle plate" value={form.vehiclePlate} onChange={e => setForm(f => ({ ...f, vehiclePlate: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <input type="date" placeholder="Expiry date" value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <input placeholder="File URL (optional)" value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <button type="submit" disabled={saving} className="h-10 rounded-xl text-sm font-semibold text-white" style={{ background: '#0D4A47' }}>{saving ? 'Saving…' : 'Save'}</button>
          </form>
        )}
        {loading ? (
          <div className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>Loading…</div>
        ) : docs.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E8F4F3' }}><span className="text-xl">📄</span></div>
            <div className="text-sm font-semibold" style={{ color: '#0D4A47' }}>No documents yet</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>Add your first document above.</div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {docs.map(d => (
              <div key={d.id} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
                <div>
                  <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{d.title}</div>
                  <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{d.docType}{d.expiryDate ? ` · Expires: ${d.expiryDate}` : ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: (STATUS_COLORS[d.status] ?? '#9ca3af') + '1a', color: STATUS_COLORS[d.status] ?? '#9ca3af' }}>{d.status}</div>
                  {d.fileUrl && <a href={d.fileUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold" style={{ color: '#1A7A75' }}>View</a>}
                  <button onClick={() => del(d.id)} className="text-xs px-2 py-1 rounded-lg" style={{ color: '#EF4444' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

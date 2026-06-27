"use client";
import { useState, useEffect, useCallback } from "react";

type Expense = {
  id: string; category: string; amount: number; currency: string;
  description?: string; expenseDate: string; vehiclePlate?: string;
};

const CAT_COLORS: Record<string, string> = {
  FUEL: '#F97316', TOLL: '#F59E0B', MAINTENANCE: '#1A7A75',
  TYRE: '#8B5CF6', INSURANCE: '#3B82F6', OTHER: '#9ca3af',
};

export default function ExpensesPage() {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: 'FUEL', amount: '', currency: 'USD', description: '', vehiclePlate: '', expenseDate: new Date().toISOString().slice(0,10) });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/expenses').catch(() => null);
    if (r?.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d?.content ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    await fetch('/api/expenses', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }) });
    setSaving(false); setShowForm(false);
    setForm({ category: 'FUEL', amount: '', currency: 'USD', description: '', vehiclePlate: '', expenseDate: new Date().toISOString().slice(0,10) });
    load();
  }

  async function del(id: string) { await fetch(`/api/expenses/${id}`, { method: 'DELETE' }); load(); }

  const total = items.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Finance</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>My Expenses</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Track fuel, tolls, maintenance costs, and other fleet expenses.</p>
      </div>

      {!loading && items.length > 0 && (
        <div className="rounded-2xl border p-4 flex items-center justify-between" style={{ borderColor: '#C5E0DE', background: '#E8F4F3' }}>
          <div className="text-sm font-semibold" style={{ color: '#0D4A47' }}>Total ({items.length} entries)</div>
          <div className="text-lg font-extrabold" style={{ color: '#0D4A47' }}>{items[0]?.currency} {total.toFixed(2)}</div>
        </div>
      )}

      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Expense log</div>
          <button onClick={() => setShowForm(v => !v)} className="text-xs font-semibold px-4 py-2 rounded-xl text-white" style={{ background: '#0D4A47' }}>{showForm ? 'Cancel' : '+ Add expense'}</button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4 grid gap-3 rounded-2xl border p-4" style={{ borderColor: '#C5E0DE' }}>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }}>
              {['FUEL','TOLL','MAINTENANCE','TYRE','INSURANCE','OTHER'].map(c => <option key={c}>{c}</option>)}
            </select>
            <div className="flex gap-2">
              <input required type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm flex-1" style={{ borderColor: '#C5E0DE' }} />
              <input placeholder="Currency" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm w-24" style={{ borderColor: '#C5E0DE' }} />
            </div>
            <input placeholder="Vehicle plate" value={form.vehiclePlate} onChange={e => setForm(f => ({ ...f, vehiclePlate: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <input placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <input type="date" value={form.expenseDate} onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))} className="rounded-lg border px-3 py-2 text-sm" style={{ borderColor: '#C5E0DE' }} />
            <button type="submit" disabled={saving} className="h-10 rounded-xl text-sm font-semibold text-white" style={{ background: '#0D4A47' }}>{saving ? 'Saving…' : 'Save'}</button>
          </form>
        )}

        {loading ? (
          <div className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E8F4F3' }}><span className="text-xl">💰</span></div>
            <div className="text-sm font-semibold" style={{ color: '#0D4A47' }}>No expenses yet</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>Add your first expense above.</div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {items.map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
                <div>
                  <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{e.vehiclePlate ? `${e.vehiclePlate} — ` : ''}{e.description || e.category}</div>
                  <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{e.expenseDate}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold" style={{ color: CAT_COLORS[e.category] ?? '#9ca3af' }}>{e.currency} {e.amount.toFixed(2)}</div>
                  <button onClick={() => del(e.id)} className="text-xs px-2 py-1 rounded-lg" style={{ color: '#EF4444' }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Documents</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Vehicle registration, insurance, permits, and compliance documents.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Documents</div>
        <div className="mt-4 grid gap-3">
          {[
            { name: 'Insurance — Truck 12', expires: 'Expires: Dec 2025', status: 'Valid', color: '#22C55E' },
            { name: 'RC Book — Van 3', expires: 'Expires: Mar 2026', status: 'Valid', color: '#22C55E' },
            { name: 'Permit — Car 5', expires: 'Expired: Jan 2025', status: 'Expired', color: '#EF4444' },
          ].map((d) => (
            <div key={d.name} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{d.name}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{d.expires}</div>
              </div>
              <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: d.color + '1a', color: d.color }}>{d.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function RoutesPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Trips</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Routes</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Define and manage standard routes for vehicle assignments and compliance.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Saved routes</div>
        <div className="mt-4 grid gap-3">
          {[
            { name: 'Route Alpha', from: 'Warehouse A', to: 'Site 1', dist: '38 km', stops: 2 },
            { name: 'Route Beta', from: 'Depot Central', to: 'Client HQ', dist: '61 km', stops: 1 },
            { name: 'Route Gamma', from: 'Site 2', to: 'Warehouse B', dist: '24 km', stops: 0 },
          ].map((r) => (
            <div key={r.name} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{r.name}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{r.from} → {r.to} · {r.dist} · {r.stops} stop{r.stops !== 1 ? 's' : ''}</div>
              </div>
              <div className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#E8F4F3', color: '#0D4A47' }}>{r.dist}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

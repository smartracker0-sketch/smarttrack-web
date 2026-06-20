export default function VehicleGroupsPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Vehicles</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>My Vehicle Groups</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Organise vehicles into logical groups for easier monitoring and reporting.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Groups</div>
        <div className="mt-4 grid gap-3">
          {[
            { name: 'North Zone', count: 8, color: '#22C55E' },
            { name: 'South Zone', count: 5, color: '#1A7A75' },
            { name: 'Delivery Fleet', count: 12, color: '#F97316' },
          ].map((g) => (
            <div key={g.name} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{g.name}</div>
              <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: g.color + '1a', color: g.color }}>{g.count} vehicles</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VehicleDirectoryPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Vehicles</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Vehicle Directory</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Full directory of all registered vehicles with specs and ownership details.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>All Vehicles</div>
        <div className="mt-4 grid gap-3">
          {[
            { name: 'Truck 12', reg: 'PB10GK1234', type: 'HCV', year: '2021' },
            { name: 'Van 3', reg: 'PB07CA5678', type: 'LCV', year: '2022' },
            { name: 'Car 5', reg: 'PB08AB9012', type: 'Sedan', year: '2020' },
          ].map((v) => (
            <div key={v.reg} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{v.name}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{v.reg} · {v.type} · {v.year}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CCTVPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>CCTV</h1>
        <p className="mt-4 text-sm leading-6 text-muted">View and manage in-vehicle CCTV camera feeds and recorded footage across your fleet.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Cameras Online', value: '14', color: '#22C55E' },
          { label: 'Cameras Offline', value: '2', color: '#EF4444' },
          { label: 'Recording', value: '12', color: '#1A7A75' },
          { label: 'Incidents Today', value: '3', color: '#F59E0B' },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border p-5 flex flex-col gap-1" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
            <div className="text-2xl font-extrabold" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs font-semibold" style={{ color: '#374151' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Camera list</div>
        <div className="mt-4 grid gap-3">
          {[
            { vehicle: 'Truck 12', cameras: 'Front, Rear, Cabin', status: 'Online', statusColor: '#22C55E' },
            { vehicle: 'Van 3', cameras: 'Front, Cabin', status: 'Online', statusColor: '#22C55E' },
            { vehicle: 'Car 5', cameras: 'Front', status: 'Offline', statusColor: '#EF4444' },
            { vehicle: 'EV Truck 01', cameras: 'Front, Rear', status: 'Recording', statusColor: '#1A7A75' },
          ].map((c) => (
            <div key={c.vehicle} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{c.vehicle}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{c.cameras}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: c.statusColor + '1a', color: c.statusColor }}>{c.status}</div>
                <button className="text-xs font-semibold px-3 py-1 rounded-full border" style={{ borderColor: '#C5E0DE', color: '#0D4A47' }}>View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EVPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>EV</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Monitor electric vehicle battery levels, charging status, and range across your fleet.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'EVs Online', value: '6', color: '#22C55E' },
          { label: 'Charging', value: '2', color: '#1A7A75' },
          { label: 'Low Battery', value: '1', color: '#EF4444' },
          { label: 'Avg Range (km)', value: '184', color: '#F59E0B' },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border p-5 flex flex-col gap-1" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
            <div className="text-2xl font-extrabold" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs font-semibold" style={{ color: '#374151' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>EV fleet status</div>
        <div className="mt-4 grid gap-3">
          {[
            { name: 'EV Truck 01', battery: 82, range: '210 km', status: 'Moving', statusColor: '#22C55E' },
            { name: 'EV Van 02', battery: 45, range: '115 km', status: 'Charging', statusColor: '#1A7A75' },
            { name: 'EV Car 03', battery: 18, range: '46 km', status: 'Low Battery', statusColor: '#EF4444' },
          ].map((v) => (
            <div key={v.name} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{v.name}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>Range: {v.range}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-20 h-2 rounded-full overflow-hidden" style={{ background: '#E8F4F3' }}>
                    <div className="h-full rounded-full" style={{ width: `${v.battery}%`, background: v.battery < 25 ? '#EF4444' : '#22C55E' }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#0D4A47' }}>{v.battery}%</span>
                </div>
                <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: v.statusColor + '1a', color: v.statusColor }}>{v.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

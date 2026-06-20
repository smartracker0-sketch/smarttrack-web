export default function DriverPerformancePage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Drivers</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Driver Performance</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Monitor driving behaviour, safety scores, and performance trends across your fleet.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Avg Safety Score', value: '87', color: '#22C55E' },
          { label: 'Harsh Braking Events', value: '12', color: '#EF4444' },
          { label: 'Speeding Incidents', value: '5', color: '#F59E0B' },
          { label: 'Idle Time (hrs)', value: '8.4', color: '#1A7A75' },
        ].map((m) => (
          <div key={m.label} className="rounded-2xl border p-5 flex flex-col gap-1" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
            <div className="text-2xl font-extrabold" style={{ color: m.color }}>{m.value}</div>
            <div className="text-xs font-semibold" style={{ color: '#374151' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Driver leaderboard</div>
        <div className="mt-4 grid gap-3">
          {[
            { name: 'Sarah Jenkins', vehicle: 'Truck 12', score: 98, trend: '↑', trendColor: '#22C55E' },
            { name: 'Mike Torres', vehicle: 'Van 3', score: 92, trend: '→', trendColor: '#F59E0B' },
            { name: 'Ravi Sharma', vehicle: 'Car 5', score: 78, trend: '↓', trendColor: '#EF4444' },
          ].map((d, i) => (
            <div key={d.name} className="flex items-center gap-4 rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0" style={{ background: '#E8F4F3', color: '#0D4A47' }}>
                {i + 1}
              </div>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: '#0D4A47' }}>
                  {d.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{d.name}</div>
                  <div className="text-xs" style={{ color: '#1A7A75' }}>{d.vehicle}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#E8F4F3', color: '#0D4A47' }}>Score: {d.score}</div>
                <span className="text-sm font-bold" style={{ color: d.trendColor }}>{d.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

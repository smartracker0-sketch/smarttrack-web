export default function DriversPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Drivers</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Manage driver profiles, licences, assignments, and behaviour scores.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Driver roster</div>
        <div className="mt-4 grid gap-3">
          {[
            { name: 'Sarah Jenkins', vehicle: 'Truck 12', score: 98, status: 'On duty' },
            { name: 'Mike Torres', vehicle: 'Van 3', score: 92, status: 'On duty' },
            { name: 'Ravi Sharma', vehicle: 'Car 5', score: 78, status: 'Off duty' },
          ].map((d) => (
            <div key={d.name} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: '#0D4A47' }}>
                  {d.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{d.name}</div>
                  <div className="text-xs" style={{ color: '#1A7A75' }}>{d.vehicle}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: '#E8F4F3', color: '#0D4A47' }}>Score: {d.score}</div>
                <div className="text-xs font-semibold" style={{ color: d.status === 'On duty' ? '#22C55E' : '#9CA3AF' }}>{d.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

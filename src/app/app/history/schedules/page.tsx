export default function TripSchedulesPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Trips</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Trip Schedules</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Plan and manage recurring or one-time trip schedules for your fleet.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Upcoming schedules</div>
        <div className="mt-4 grid gap-3">
          {[
            { name: 'Warehouse → Site A', vehicle: 'Truck 12', time: 'Today 08:00', status: 'Scheduled', color: '#1A7A75' },
            { name: 'Depot → Client HQ', vehicle: 'Van 3', time: 'Tomorrow 09:30', status: 'Confirmed', color: '#22C55E' },
            { name: 'Site B → Warehouse', vehicle: 'Car 5', time: 'Jun 22 14:00', status: 'Pending', color: '#F59E0B' },
          ].map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{s.name}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{s.vehicle} · {s.time}</div>
              </div>
              <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: s.color + '1a', color: s.color }}>{s.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

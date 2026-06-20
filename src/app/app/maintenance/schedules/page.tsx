export default function ServiceSchedulesPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Maintenance</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Service Schedules</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Set up and manage recurring service intervals for each vehicle in your fleet.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Scheduled services</div>
        <div className="mt-4 grid gap-3">
          {[
            { vehicle: 'Truck 12', service: 'Oil Change', interval: 'Every 5,000 km', next: 'In 320 km', color: '#22C55E' },
            { vehicle: 'Van 3', service: 'Tyre Rotation', interval: 'Every 10,000 km', next: 'In 1,240 km', color: '#1A7A75' },
            { vehicle: 'Car 5', service: 'Brake Inspection', interval: 'Every 6 months', next: 'Overdue 12 days', color: '#EF4444' },
            { vehicle: 'Truck 12', service: 'Air Filter', interval: 'Every 15,000 km', next: 'In 4,100 km', color: '#22C55E' },
          ].map((s) => (
            <div key={s.vehicle + s.service} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{s.vehicle} — {s.service}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{s.interval}</div>
              </div>
              <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: s.color + '1a', color: s.color }}>{s.next}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MaintenancePage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Service History & Reminders</h1>
        <p className="mt-4 text-sm leading-6 text-muted">View past service records and upcoming reminders for all vehicles.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { vehicle: 'Truck 12', task: 'Engine oil change', due: 'Due in 3 days', tone: '#F59E0B' },
          { vehicle: 'Van 3', task: 'Tyre rotation', due: 'Due in 7 days', tone: '#1A7A75' },
          { vehicle: 'Car 5', task: 'Air filter replacement', due: 'Overdue by 2 days', tone: '#EF4444' },
          { vehicle: 'Truck 12', task: 'Brake inspection', due: 'Due in 14 days', tone: '#22C55E' },
        ].map((m) => (
          <div key={m.task + m.vehicle} className="rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
            <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{m.vehicle}</div>
            <div className="mt-1 text-sm" style={{ color: '#1A7A75' }}>{m.task}</div>
            <div className="mt-2 text-xs font-semibold" style={{ color: m.tone }}>{m.due}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

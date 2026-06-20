export default function ReportSchedulesPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Reports</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Report Schedules</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Automate report generation and delivery on a recurring schedule.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Scheduled reports</div>
        <div className="mt-4 grid gap-3">
          {[
            { name: 'Daily Fleet Summary', frequency: 'Daily · 07:00 AM', recipients: '3 recipients', status: 'Active', color: '#22C55E' },
            { name: 'Weekly Mileage Report', frequency: 'Every Monday · 08:00 AM', recipients: '2 recipients', status: 'Active', color: '#22C55E' },
            { name: 'Monthly Fuel Report', frequency: '1st of month · 09:00 AM', recipients: '5 recipients', status: 'Paused', color: '#F59E0B' },
          ].map((r) => (
            <div key={r.name} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{r.name}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{r.frequency} · {r.recipients}</div>
              </div>
              <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: r.color + '1a', color: r.color }}>{r.status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

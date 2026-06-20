export default function TyreManagementPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Tyre Management</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Track tyre health, pressure, rotation schedules, and replacements.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { vehicle: 'Truck 12', position: 'Front Left', brand: 'Apollo', status: 'Good', pressure: '32 PSI', color: '#22C55E' },
          { vehicle: 'Truck 12', position: 'Front Right', brand: 'Apollo', status: 'Worn', pressure: '30 PSI', color: '#F59E0B' },
          { vehicle: 'Van 3', position: 'Rear Left', brand: 'MRF', status: 'Good', pressure: '35 PSI', color: '#22C55E' },
          { vehicle: 'Van 3', position: 'Rear Right', brand: 'MRF', status: 'Replace', pressure: '28 PSI', color: '#EF4444' },
        ].map((t) => (
          <div key={t.vehicle + t.position} className="rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{t.vehicle} — {t.position}</div>
              <div className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: t.color + '1a', color: t.color }}>{t.status}</div>
            </div>
            <div className="mt-1 text-xs" style={{ color: '#1A7A75' }}>{t.brand} · {t.pressure}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

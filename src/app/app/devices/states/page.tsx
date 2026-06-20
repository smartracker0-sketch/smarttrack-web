export default function VehicleStatesPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Vehicles</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>My Vehicle States</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Define and view custom operational states for your vehicles.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Moving', count: 18, color: '#22C55E' },
          { label: 'Stopped', count: 4, color: '#EF4444' },
          { label: 'Idle', count: 2, color: '#F59E0B' },
          { label: 'Offline', count: 6, color: '#9CA3AF' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border p-5 flex flex-col items-center gap-2" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
            <div className="text-2xl font-extrabold" style={{ color: s.color }}>{s.count}</div>
            <div className="text-xs font-semibold" style={{ color: '#374151' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

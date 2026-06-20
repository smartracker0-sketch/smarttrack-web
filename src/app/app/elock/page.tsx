export default function ElockPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Security</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>E-Lock Status</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Monitor and control electronic lock status across your fleet in real time.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Lock status</div>
        <div className="mt-4 grid gap-3">
          {[
            { vehicle: 'Truck 12', lockId: 'EL-001', status: 'Locked', lastEvent: '2h ago' },
            { vehicle: 'Van 3', lockId: 'EL-002', status: 'Unlocked', lastEvent: '5m ago' },
            { vehicle: 'Car 5', lockId: 'EL-003', status: 'Locked', lastEvent: '1d ago' },
          ].map((e) => (
            <div key={e.lockId} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{e.vehicle}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>Lock ID: {e.lockId} · Last event: {e.lastEvent}</div>
              </div>
              <div
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  background: e.status === 'Locked' ? '#22C55E1a' : '#EF44441a',
                  color: e.status === 'Locked' ? '#22C55E' : '#EF4444',
                }}
              >
                {e.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

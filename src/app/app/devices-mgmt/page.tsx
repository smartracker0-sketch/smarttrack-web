export default function DevicesMgmtPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>System</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Devices</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Manage GPS trackers, SIM cards, firmware versions, and device assignments.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Device inventory</div>
        <div className="mt-4 grid gap-3">
          {[
            { imei: '354678901234567', model: 'GT06N', sim: '9876543210', firmware: 'v2.3.1', status: 'Online' },
            { imei: '354678901234568', model: 'TK103B', sim: '9876543211', firmware: 'v1.9.0', status: 'Online' },
            { imei: '354678901234569', model: 'GT06N', sim: '9876543212', firmware: 'v2.3.1', status: 'Offline' },
          ].map((d) => (
            <div key={d.imei} className="rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{d.model}</div>
                <div className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: d.status === 'Online' ? '#22C55E1a' : '#EF44441a', color: d.status === 'Online' ? '#22C55E' : '#EF4444' }}>{d.status}</div>
              </div>
              <div className="mt-1 text-xs" style={{ color: '#1A7A75' }}>IMEI: {d.imei} · SIM: {d.sim} · FW: {d.firmware}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

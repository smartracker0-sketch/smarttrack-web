export default function GeofencesPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Geofences</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Create circle, polygon, and route corridor geofences. Schedule them and assign devices.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-divider bg-surface p-6 md:col-span-2">
          <div className="text-sm font-extrabold">Zones</div>
          <div className="mt-4 grid gap-3">
            {[
              { name: 'HQ Warehouse', meta: 'Circle • 12 devices • 24/7', color: '#22C55E' },
              { name: 'City Center Zone', meta: 'Polygon • 8 devices • Business hours', color: '#F97316' },
              { name: 'Route A Corridor', meta: 'Route • 6 devices • Mon–Fri', color: '#1A7A75' },
            ].map((z) => (
              <div key={z.name} className="rounded-2xl border p-4 flex items-center gap-3" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: z.color }} />
                <div>
                  <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{z.name}</div>
                  <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{z.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-divider bg-surface p-6">
          <div className="text-sm font-extrabold">Create</div>
          <div className="mt-2 text-xs text-muted">UI to draw zones on a map will be implemented here.</div>
          <button className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-sm font-semibold text-white transition-all hover:brightness-110" style={{ background: '#0D4A47' }}>
            Create geofence
          </button>
        </div>
      </div>
    </div>
  );
}


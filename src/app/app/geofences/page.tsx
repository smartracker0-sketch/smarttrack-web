export default function GeofencesPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-semibold text-muted">Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Geofences</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Create circle, polygon, and route corridor geofences. Schedule them and assign devices.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-divider bg-surface p-6 md:col-span-2">
          <div className="text-sm font-extrabold">Zones</div>
          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-divider bg-background p-4">
              <div className="text-sm font-extrabold">HQ Warehouse</div>
              <div className="mt-1 text-xs text-muted">Circle • 12 devices • 24/7</div>
            </div>
            <div className="rounded-2xl border border-divider bg-background p-4">
              <div className="text-sm font-extrabold">City Center Zone</div>
              <div className="mt-1 text-xs text-muted">Polygon • 8 devices • Business hours</div>
            </div>
            <div className="rounded-2xl border border-divider bg-background p-4">
              <div className="text-sm font-extrabold">Route A Corridor</div>
              <div className="mt-1 text-xs text-muted">Route • 6 devices • Mon–Fri</div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-divider bg-surface p-6">
          <div className="text-sm font-extrabold">Create</div>
          <div className="mt-2 text-xs text-muted">UI to draw zones on a map will be implemented here.</div>
          <button className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-dark">
            Create geofence
          </button>
        </div>
      </div>
    </div>
  );
}


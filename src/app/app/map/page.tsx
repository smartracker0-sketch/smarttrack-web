export default function MapPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-semibold text-muted">Tracking</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Live Map</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Full-screen live tracking map with device selection, filters, layers, and controls.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-divider bg-surface p-6 md:col-span-2">
          <div className="text-sm font-extrabold">Map</div>
          <div className="mt-4 h-[420px] rounded-3xl border border-divider bg-background">
            <div className="flex h-full items-center justify-center text-sm text-muted">
              Map component (next: wire latest locations and markers)
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-divider bg-surface p-6">
          <div className="text-sm font-extrabold">Controls</div>
          <div className="mt-4 grid gap-3">
            <button className="inline-flex h-11 items-center justify-center rounded-xl border border-divider bg-background text-sm font-semibold hover:bg-surface">
              Filters
            </button>
            <button className="inline-flex h-11 items-center justify-center rounded-xl border border-divider bg-background text-sm font-semibold hover:bg-surface">
              Layers
            </button>
            <button className="inline-flex h-11 items-center justify-center rounded-xl border border-divider bg-background text-sm font-semibold hover:bg-surface">
              Traffic (planned)
            </button>
            <button className="inline-flex h-11 items-center justify-center rounded-xl border border-divider bg-background text-sm font-semibold hover:bg-surface">
              Weather (planned)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

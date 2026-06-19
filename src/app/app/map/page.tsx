export default function MapPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Tracking</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Live Map</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Full-screen live tracking map with device selection, filters, layers, and controls.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-divider bg-surface p-6 md:col-span-2">
          <div className="text-sm font-extrabold">Map</div>
          <div className="mt-4 h-[420px] rounded-3xl border overflow-hidden" style={{ borderColor: '#C5E0DE', background: '#E8F4F3' }}>
            <div className="flex h-full flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#0D4A47' }}>
                <span className="text-2xl">🗺️</span>
              </div>
              <p className="text-sm font-semibold" style={{ color: '#0D4A47' }}>Live map coming soon</p>
              <p className="text-xs" style={{ color: '#1A7A75' }}>Real-time vehicle positions will appear here</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-divider bg-surface p-6">
          <div className="text-sm font-extrabold">Controls</div>
          <div className="mt-4 grid gap-3">
            <button className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition-colors" style={{ borderColor: '#C5E0DE', color: '#0D4A47', background: '#E8F4F3' }}>
              Filters
            </button>
            <button className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold transition-colors" style={{ borderColor: '#C5E0DE', color: '#0D4A47', background: '#E8F4F3' }}>
              Layers
            </button>
            <button className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold" style={{ borderColor: '#C5E0DE', color: '#B2D4D2', background: '#fff' }}>
              Traffic (planned)
            </button>
            <button className="inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-semibold" style={{ borderColor: '#C5E0DE', color: '#B2D4D2', background: '#fff' }}>
              Weather (planned)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

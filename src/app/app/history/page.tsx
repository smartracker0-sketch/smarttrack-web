export default function HistoryPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>History</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Trip history, stops, and playback will be available here.
        </p>
      </div>

      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold">Recent trips</div>
        <div className="mt-4 grid gap-3">
          {[
            { name: 'Truck 12', meta: '08:10 → 09:05 • 42.3 km • 55m', dist: '42.3 km' },
            { name: 'Van 3', meta: '11:20 → 13:02 • 78.8 km • 1h 42m', dist: '78.8 km' },
          ].map((t) => (
            <div key={t.name} className="rounded-2xl border p-4 flex items-center justify-between" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{t.name}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{t.meta}</div>
              </div>
              <div className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: '#E8F4F3', color: '#0D4A47' }}>{t.dist}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


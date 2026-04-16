export default function HistoryPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-semibold text-muted">Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">History</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Trip history, stops, and playback will be available here.
        </p>
      </div>

      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold">Recent trips</div>
        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-divider bg-background p-4">
            <div className="text-sm font-extrabold">Truck 12</div>
            <div className="mt-1 text-xs text-muted">08:10 → 09:05 • 42.3 km • 55m</div>
          </div>
          <div className="rounded-2xl border border-divider bg-background p-4">
            <div className="text-sm font-extrabold">Van 3</div>
            <div className="mt-1 text-xs text-muted">11:20 → 13:02 • 78.8 km • 1h 42m</div>
          </div>
        </div>
      </div>
    </div>
  );
}


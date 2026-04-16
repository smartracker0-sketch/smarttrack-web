export default function AlertsPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-semibold text-muted">Alerts</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Alerts center</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          View, filter, acknowledge, and export alerts across your fleet.
        </p>
      </div>

      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-extrabold">Recent</div>
          <div className="flex gap-2">
            <button className="inline-flex h-10 items-center justify-center rounded-xl border border-divider bg-background px-4 text-sm font-semibold hover:bg-surface">
              Filters
            </button>
            <button className="inline-flex h-10 items-center justify-center rounded-xl border border-divider bg-background px-4 text-sm font-semibold hover:bg-surface">
              Export
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <AlertCard tone="danger" title="Speeding" desc="Truck 12 exceeded 90 km/h" time="5m ago" />
          <AlertCard tone="warning" title="Geofence breach" desc="Van 3 exited Warehouse zone" time="18m ago" />
          <AlertCard tone="danger" title="SOS" desc="Driver 7 pressed panic button" time="1h ago" />
        </div>
      </div>
    </div>
  );
}

function AlertCard({
  tone,
  title,
  desc,
  time,
}: {
  tone: "danger" | "warning";
  title: string;
  desc: string;
  time: string;
}) {
  const cls =
    tone === "danger"
      ? "border-danger/30 bg-danger/10 text-danger"
      : "border-warning/30 bg-warning/10 text-warning";

  return (
    <div className="rounded-2xl border border-divider bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold">{title}</div>
          <div className="mt-1 truncate text-xs text-muted">{desc}</div>
        </div>
        <div className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>{time}</div>
      </div>
      <div className="mt-4 flex gap-2">
        <button className="inline-flex h-10 items-center justify-center rounded-xl border border-divider bg-surface px-4 text-sm font-semibold hover:bg-background">
          View on map
        </button>
        <button className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark">
          Acknowledge
        </button>
      </div>
    </div>
  );
}

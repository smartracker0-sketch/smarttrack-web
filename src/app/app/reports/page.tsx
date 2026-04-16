export default function ReportsPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-semibold text-muted">Reports</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Report center</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Generate reports for devices/drivers, export in PDF/Excel/CSV, and schedule delivery.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card title="Trip Summary" desc="Trips, distance, duration, average speed." />
        <Card title="Stops Report" desc="Parking events, idle time, and stop locations." />
        <Card title="Zone Visits" desc="Geofence entry/exit events and compliance." />
        <Card title="Events" desc="Speeding, SOS, and custom sensor events." />
        <Card title="Maintenance" desc="Service schedules and upcoming maintenance." />
        <Card title="Eco-driving" desc="Driver behavior scoring and violations." />
      </div>
    </div>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-3xl border border-divider bg-surface p-6">
      <div className="text-sm font-extrabold">{title}</div>
      <div className="mt-2 text-sm leading-6 text-muted">{desc}</div>
      <button className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl border border-divider bg-background text-sm font-semibold hover:bg-surface">
        Configure
      </button>
    </div>
  );
}

export default function TyreManagementPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Tyre Management</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Track tyre health, pressure, rotation schedules, and replacements.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Tyre status</div>
        <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E8F4F3' }}>
            <span className="text-xl">🚨</span>
          </div>
          <div className="text-sm font-semibold" style={{ color: '#0D4A47' }}>No tyre data yet</div>
          <div className="text-xs max-w-xs" style={{ color: '#9ca3af' }}>Tyre health, pressure, and rotation records will appear here once the tyre management module is connected to the backend.</div>
        </div>
      </div>
    </div>
  );
}

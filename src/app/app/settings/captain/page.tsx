export default function CaptainConfigurationsPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Configurations</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Captain Configurations</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Configure captain-level access, permissions, and operational rules for fleet supervisors.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          { title: 'Access Control', desc: 'Define which features captains can access and manage within the platform.', action: 'Configure' },
          { title: 'Approval Workflows', desc: 'Set up trip, expense, and maintenance approval chains for captains.', action: 'Configure' },
          { title: 'Notification Rules', desc: 'Control which alerts and reports are routed to captain accounts.', action: 'Configure' },
          { title: 'Captain Hierarchy', desc: 'Assign captains to specific vehicle groups, zones, or routes.', action: 'Configure' },
        ].map((c) => (
          <div key={c.title} className="rounded-3xl border border-divider bg-surface p-6">
            <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{c.title}</div>
            <div className="mt-2 text-sm leading-6 text-muted">{c.desc}</div>
            <button className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold text-white transition-all hover:brightness-110" style={{ background: '#0D4A47' }}>
              {c.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

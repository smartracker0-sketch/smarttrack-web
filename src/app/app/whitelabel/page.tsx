export default function WhitelabelPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Admin</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Whitelabel Admin</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Manage tenant branding, domains, and report templates for white-label deployments.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Section title="Branding" items={["Logo & colors", "Mobile branding", "Email templates"]} />
        <Section title="Domains" items={["Subdomain manager", "Custom domain mapping", "SSL provisioning"]} />
        <Section title="Reports" items={["Header/footer branding", "Template library", "Scheduled delivery"]} />
      </div>
    </div>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-divider bg-surface p-6">
      <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{title}</div>
      <ul className="mt-4 grid gap-2 text-sm">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-2 h-2 w-2 rounded-full flex-shrink-0" style={{ background: '#1A7A75' }} />
            <span style={{ color: '#1A7A75' }}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}


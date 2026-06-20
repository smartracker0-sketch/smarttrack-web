import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Preferences</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Settings</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Theme, language, units, and account preferences for the web console.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Section title="Account" items={[{ label: "Profile", href: "/app/profile" }]} />
        <Section title="Preferences" items={[{ label: "Language (coming soon)" }, { label: "Units (coming soon)" }]} />
        <Section title="Admin" items={[{ label: "Whitelabel Admin", href: "/app/whitelabel" }]} />
      </div>
    </div>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: { label: string; href?: string }[];
}) {
  return (
    <div className="rounded-3xl border border-divider bg-surface p-6">
      <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{title}</div>
      <div className="mt-4 grid gap-2">
        {items.map((i) =>
          i.href ? (
            <Link
              key={i.label}
              href={i.href}
              className="rounded-2xl border p-4 text-sm font-semibold transition-colors hover:bg-[#E8F4F3]"
              style={{ borderColor: '#C5E0DE', color: '#0D4A47', background: '#fff' }}
            >
              {i.label}
            </Link>
          ) : (
            <div key={i.label} className="rounded-2xl border p-4 text-sm" style={{ borderColor: '#C5E0DE', color: '#B2D4D2', background: '#fff' }}>
              {i.label}
            </div>
          ),
        )}
      </div>
    </div>
  );
}


export default function CustomFieldsPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Configurations</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Custom Fields</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Define custom data fields for vehicles, drivers, trips, and other fleet entities.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Defined fields</div>
        <div className="mt-4 grid gap-3">
          {[
            { name: 'Cargo Type', entity: 'Vehicle', type: 'Dropdown', required: true },
            { name: 'Driver Licence No.', entity: 'Driver', type: 'Text', required: true },
            { name: 'Trip Purpose', entity: 'Trip', type: 'Text', required: false },
            { name: 'Fuel Card No.', entity: 'Vehicle', type: 'Text', required: false },
          ].map((f) => (
            <div key={f.name} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{f.name}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{f.entity} · {f.type}</div>
              </div>
              <div className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: f.required ? '#EF44441a' : '#E8F4F3', color: f.required ? '#EF4444' : '#0D4A47' }}>
                {f.required ? 'Required' : 'Optional'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

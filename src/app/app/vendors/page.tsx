export default function VendorsPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Fleet</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Vendors</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Manage fuel, maintenance, and service vendors for your fleet.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Vendor list</div>
        <div className="mt-4 grid gap-3">
          {[
            { name: 'HP Petrol Station', type: 'Fuel', contact: '+91 98765 43210' },
            { name: 'AutoCare Workshop', type: 'Maintenance', contact: '+91 98123 45678' },
            { name: 'FastTyre Co.', type: 'Tyres', contact: '+91 99887 76655' },
          ].map((v) => (
            <div key={v.name} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{v.name}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{v.contact}</div>
              </div>
              <div className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#E8F4F3', color: '#0D4A47' }}>{v.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

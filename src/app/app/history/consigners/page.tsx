export default function ConsignersPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Trips</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Consigners</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Manage consignors and consignees linked to your fleet trips and deliveries.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Consigner list</div>
        <div className="mt-4 grid gap-3">
          {[
            { name: 'Agro Supply Co.', type: 'Consignor', contact: '+91 98001 11222', trips: 14 },
            { name: 'Metro Traders', type: 'Consignee', contact: '+91 98002 33444', trips: 9 },
            { name: 'North Parts Ltd.', type: 'Consignor', contact: '+91 98003 55666', trips: 21 },
          ].map((c) => (
            <div key={c.name} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{c.name}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{c.contact} · {c.trips} trips</div>
              </div>
              <div className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#E8F4F3', color: '#0D4A47' }}>{c.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

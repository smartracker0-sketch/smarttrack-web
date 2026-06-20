export default function ExpensesPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Finance</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>My Expenses</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Track fuel, tolls, maintenance costs, and other fleet expenses.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Expense log</div>
        <div className="mt-4 grid gap-3">
          {[
            { desc: 'Fuel — Truck 12', amount: '₹4,200', date: 'Today', color: '#F97316' },
            { desc: 'Toll — Van 3', amount: '₹120', date: 'Yesterday', color: '#F59E0B' },
            { desc: 'Oil change — Car 5', amount: '₹800', date: '3 days ago', color: '#1A7A75' },
          ].map((e) => (
            <div key={e.desc} className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
              <div>
                <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{e.desc}</div>
                <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{e.date}</div>
              </div>
              <div className="text-sm font-bold" style={{ color: e.color }}>{e.amount}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

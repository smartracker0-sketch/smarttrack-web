export default function EcoDrivingPage() {
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Analytics</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Eco-driving</h1>
        <p className="mt-4 text-sm leading-6 text-muted">
          Driver scoring, harsh events, and leaderboards (web version of the mobile eco-driving module).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-divider bg-surface p-6 md:col-span-2">
          <div className="text-sm font-extrabold">Monthly score</div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Metric label="Overall" value="85" />
            <Metric label="Harsh accel" value="12" />
            <Metric label="Harsh braking" value="8" />
            <Metric label="Speeding" value="3" />
          </div>
        </div>

        <div className="rounded-3xl border border-divider bg-surface p-6">
          <div className="text-sm font-extrabold">Leaderboard</div>
          <div className="mt-4 grid gap-3">
            <Row name="Sarah Jenkins" score="98" />
            <Row name="Mike Torres" score="92" />
            <Row name="You" score="85" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
      <div className="text-xs font-semibold" style={{ color: '#1A7A75' }}>{label}</div>
      <div className="mt-2 text-2xl font-extrabold" style={{ color: '#0D4A47' }}>{value}</div>
    </div>
  );
}

function Row({ name, score }: { name: string; score: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
      <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{name}</div>
      <div className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: '#E8F4F3', color: '#0D4A47' }}>{score}</div>
    </div>
  );
}


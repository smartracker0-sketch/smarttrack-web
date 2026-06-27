"use client";
import { useState, useEffect, useCallback } from "react";

type Driver = { id: string; displayName: string; email: string; scoreTotal?: number; scoreBand?: string; totalTripsScored?: number; };

const BAND_COLORS: Record<string, string> = { EXCELLENT: '#22C55E', GOOD: '#1A7A75', AVERAGE: '#F59E0B', POOR: '#EF4444' };

export default function DriverPerformancePage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/drivers').catch(() => null);
    if (r?.ok) { const d = await r.json(); setDrivers(Array.isArray(d) ? d : d?.content ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const sorted = [...drivers].sort((a, b) => (b.scoreTotal ?? 0) - (a.scoreTotal ?? 0));

  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Drivers</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Driver Performance</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Monitor driving behaviour, safety scores, and performance trends across your fleet.</p>
      </div>
      <div className="rounded-3xl border border-divider bg-surface p-6">
        <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>Leaderboard</div>
        {loading ? (
          <div className="mt-6 text-center text-sm" style={{ color: '#9ca3af' }}>Loading…</div>
        ) : sorted.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-3 py-10 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#E8F4F3' }}><span className="text-xl">📈</span></div>
            <div className="text-sm font-semibold" style={{ color: '#0D4A47' }}>No performance data yet</div>
            <div className="text-xs max-w-xs" style={{ color: '#9ca3af' }}>Scores appear once drivers with the DRIVER role complete scored trips.</div>
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {sorted.map((d, i) => (
              <div key={d.id} className="flex items-center gap-4 rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0" style={{ background: i === 0 ? '#FEF9C3' : '#E8F4F3', color: i === 0 ? '#CA8A04' : '#0D4A47' }}>#{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold truncate" style={{ color: '#0D4A47' }}>{d.displayName}</div>
                  <div className="mt-0.5 text-xs" style={{ color: '#1A7A75' }}>{d.totalTripsScored ?? 0} trips scored</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {d.scoreBand && (
                    <div className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: (BAND_COLORS[d.scoreBand] ?? '#9ca3af') + '1a', color: BAND_COLORS[d.scoreBand] ?? '#9ca3af' }}>{d.scoreBand}</div>
                  )}
                  <div className="text-lg font-extrabold" style={{ color: '#0D4A47' }}>{Number(d.scoreTotal ?? 0).toFixed(0)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

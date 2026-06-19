import Link from "next/link";
import { cookies } from "next/headers";

type DevicesPageResponse = {
  content?: unknown[];
  totalElements?: number;
};

async function fetchDeviceCount() {
  const access = (await cookies()).get("tp_access")?.value;
  if (!access) return null;

  const baseUrl = process.env.TRACKPRO_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
  try {
    const resp = await fetch(`${baseUrl}/api/v1/devices`, {
      headers: { authorization: `Bearer ${access}` },
      cache: "no-store",
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as DevicesPageResponse;
    if (typeof data.totalElements === "number") return data.totalElements;
    if (Array.isArray(data.content)) return data.content.length;
    return null;
  } catch {
    return null;
  }
}

export default async function AppHomePage() {
  const deviceCount = await fetchDeviceCount();

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border p-8 bg-white" style={{ borderColor: '#C5E0DE' }}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold" style={{ color: '#1A7A75' }}>Dashboard</div>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Good day, Admin</h1>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
              Your live fleet overview across devices, alerts, geofences, reports, and operations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Active vehicles" value={deviceCount === null ? "—" : `${deviceCount}`} accent="primary" />
            <StatCard label="Alerts today" value="3" accent="danger" />
            <StatCard label="Geofence violations" value="1" accent="warning" />
            <StatCard label="Eco score (avg)" value="85" accent="success" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-3xl border p-6 bg-white" style={{ borderColor: '#C5E0DE' }}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold">Fleet status</div>
            <Link href="/app/devices" className="text-xs font-semibold hover:underline" style={{ color: '#0D4A47' }}>
              View devices
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatusTile label="Moving" value="18" color="success" />
            <StatusTile label="Stopped" value="4" color="danger" />
            <StatusTile label="Idle" value="2" color="warning" />
            <StatusTile label="Offline" value="6" color="muted" />
          </div>

          <div className="mt-6 rounded-3xl border p-6" style={{ borderColor: '#C5E0DE', background: '#E8F4F3' }}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold">Dispatch panel</div>
              <Link href="/app" className="text-xs font-semibold hover:underline" style={{ color: '#0D4A47' }}>
                Open
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniCard title="Unassigned jobs" value="12" tone="warning" />
              <MiniCard title="Available drivers" value="8" tone="success" />
            </div>
            <div className="mt-4">
              <button className="inline-flex h-12 w-full items-center justify-center rounded-full px-6 text-sm font-semibold text-white transition-colors hover:brightness-110" style={{ background: '#0D4A47' }}>
                Assign jobs
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border p-6 bg-white" style={{ borderColor: '#C5E0DE' }}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold">Recent alerts</div>
            <Link href="/app/alerts" className="text-xs font-semibold hover:underline" style={{ color: '#0D4A47' }}>
              View all
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            <AlertRow title="Speeding" subtitle="Truck 12 exceeded 90 km/h" time="5m ago" tone="danger" />
            <AlertRow title="Geofence exit" subtitle="Van 3 exited Warehouse zone" time="18m ago" tone="warning" />
            <AlertRow title="SOS" subtitle="Driver 7 pressed panic button" time="1h ago" tone="danger" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border p-6 md:col-span-2 bg-white" style={{ borderColor: '#C5E0DE' }}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold">Map preview</div>
            <Link href="/app/map" className="text-xs font-semibold hover:underline" style={{ color: '#0D4A47' }}>
              Open map
            </Link>
          </div>
          <div className="mt-4 rounded-3xl border p-6" style={{ borderColor: '#C5E0DE', background: '#E8F4F3' }}>
            <div className="h-56 rounded-2xl" style={{ background: '#E8F4F3' }}>
              <div className="flex h-full items-center justify-center rounded-2xl border text-sm" style={{ borderColor: '#C5E0DE', color: '#1A7A75', background: '#fff' }}>
                Live map preview (next: connect to latest locations)
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border p-6 bg-white" style={{ borderColor: '#C5E0DE' }}>
          <div className="text-sm font-extrabold">Quick actions</div>
          <div className="mt-4 grid gap-3">
            <QuickLink href="/app/geofences" title="Geofences" subtitle="Create and assign zones" />
            <QuickLink href="/app/history" title="History" subtitle="Trips, stops, and replay" />
            <QuickLink href="/app/reports" title="Reports" subtitle="Generate and export" />
            <QuickLink href="/app/eco-driving" title="Eco-driving" subtitle="Driver scoring" />
            <QuickLink href="/app/whitelabel" title="Whitelabel Admin" subtitle="Branding and templates" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "primary" | "success" | "warning" | "danger";
}) {
  const styles: Record<string, { color: string; bg: string }> = {
    primary: { color: '#0D4A47', bg: 'rgba(13,74,71,0.1)' },
    success: { color: '#22C55E', bg: 'rgba(34,197,94,0.1)' },
    warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    danger:  { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  };
  const s = styles[accent];

  return (
    <div className="rounded-2xl border p-4 bg-white" style={{ borderColor: '#C5E0DE' }}>
      <div className="text-xs font-semibold" style={{ color: '#1A7A75' }}>{label}</div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: s.color, background: s.bg }}>Live</div>
      </div>
    </div>
  );
}

function StatusTile({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "success" | "warning" | "danger" | "muted";
}) {
  const pillStyle: Record<string, { color: string; bg: string }> = {
    success: { color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
    warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    danger:  { color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
    muted:   { color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
  };
  const ps = pillStyle[color];

  return (
    <div className="rounded-2xl border p-4 bg-white" style={{ borderColor: '#C5E0DE' }}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold">{value}</div>
        <div className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: ps.color, background: ps.bg }}>{label}</div>
      </div>
      <div className="mt-2 text-xs" style={{ color: '#1A7A75' }}>Vehicles</div>
    </div>
  );
}

function MiniCard({ title, value, tone }: { title: string; value: string; tone: "success" | "warning" }) {
  const s = tone === "success"
    ? { color: '#22C55E', bg: 'rgba(34,197,94,0.1)' }
    : { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };
  return (
    <div className="rounded-2xl border p-4 bg-white" style={{ borderColor: '#C5E0DE' }}>
      <div className="text-xs font-semibold" style={{ color: '#1A7A75' }}>{title}</div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: s.color, background: s.bg }}>Today</div>
      </div>
    </div>
  );
}

function AlertRow({
  title,
  subtitle,
  time,
  tone,
}: {
  title: string;
  subtitle: string;
  time: string;
  tone: "warning" | "danger";
}) {
  const ts = tone === "danger"
    ? { color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' }
    : { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' };
  return (
    <div className="rounded-2xl border p-4 bg-white" style={{ borderColor: '#C5E0DE' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold">{title}</div>
          <div className="mt-1 truncate text-xs" style={{ color: '#1A7A75' }}>{subtitle}</div>
        </div>
        <div className="shrink-0 rounded-full border px-3 py-1 text-xs font-semibold" style={{ color: ts.color, background: ts.bg, borderColor: ts.border }}>{time}</div>
      </div>
    </div>
  );
}

function QuickLink({ href, title, subtitle }: { href: string; title: string; subtitle: string }) {
  return (
    <Link href={href} className="rounded-2xl border p-4 bg-white transition-colors hover:bg-[#E8F4F3] block" style={{ borderColor: '#C5E0DE' }}>
      <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{title}</div>
      <div className="mt-1 text-xs" style={{ color: '#1A7A75' }}>{subtitle}</div>
    </Link>
  );
}

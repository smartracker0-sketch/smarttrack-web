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
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold text-muted">Dashboard</div>
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
        <div className="md:col-span-2 rounded-3xl border border-divider bg-surface p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold">Fleet status</div>
            <Link href="/app/devices" className="text-xs font-semibold text-primary hover:underline">
              View devices
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatusTile label="Moving" value="18" color="success" />
            <StatusTile label="Stopped" value="4" color="danger" />
            <StatusTile label="Idle" value="2" color="warning" />
            <StatusTile label="Offline" value="6" color="muted" />
          </div>

          <div className="mt-6 rounded-3xl border border-divider bg-background p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold">Dispatch panel</div>
              <Link href="/app" className="text-xs font-semibold text-primary hover:underline">
                Open
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <MiniCard title="Unassigned jobs" value="12" tone="warning" />
              <MiniCard title="Available drivers" value="8" tone="success" />
            </div>
            <div className="mt-4">
              <button className="inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-dark">
                Assign jobs
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-divider bg-surface p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold">Recent alerts</div>
            <Link href="/app/alerts" className="text-xs font-semibold text-primary hover:underline">
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
        <div className="rounded-3xl border border-divider bg-surface p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold">Map preview</div>
            <Link href="/app/map" className="text-xs font-semibold text-primary hover:underline">
              Open map
            </Link>
          </div>
          <div className="mt-4 rounded-3xl border border-divider bg-background p-6">
            <div className="h-56 rounded-2xl bg-background">
              <div className="flex h-full items-center justify-center rounded-2xl border border-divider bg-surface text-sm text-muted">
                Live map preview (next: connect to latest locations)
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-divider bg-surface p-6">
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
  const cls = {
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    danger: "text-danger bg-danger/10",
  }[accent];

  return (
    <div className="rounded-2xl border border-divider bg-background p-4">
      <div className="text-xs font-semibold text-muted">{label}</div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl font-extrabold">{value}</div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>Live</div>
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
  const cls = {
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-danger/15 text-danger",
    muted: "bg-divider text-muted",
  }[color];

  return (
    <div className="rounded-2xl border border-divider bg-background p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold">{value}</div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>{label}</div>
      </div>
      <div className="mt-2 text-xs text-muted">Vehicles</div>
    </div>
  );
}

function MiniCard({ title, value, tone }: { title: string; value: string; tone: "success" | "warning" }) {
  const cls = tone === "success" ? "text-success bg-success/10" : "text-warning bg-warning/10";
  return (
    <div className="rounded-2xl border border-divider bg-surface p-4">
      <div className="text-xs font-semibold text-muted">{title}</div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-2xl font-extrabold">{value}</div>
        <div className={`rounded-full px-3 py-1 text-xs font-semibold ${cls}`}>Today</div>
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
  const cls = tone === "danger" ? "bg-danger/10 text-danger border-danger/30" : "bg-warning/10 text-warning border-warning/30";
  return (
    <div className="rounded-2xl border border-divider bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold">{title}</div>
          <div className="mt-1 truncate text-xs text-muted">{subtitle}</div>
        </div>
        <div className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>{time}</div>
      </div>
    </div>
  );
}

function QuickLink({ href, title, subtitle }: { href: string; title: string; subtitle: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-divider bg-background p-4 hover:bg-surface">
      <div className="text-sm font-extrabold">{title}</div>
      <div className="mt-1 text-xs text-muted">{subtitle}</div>
    </Link>
  );
}

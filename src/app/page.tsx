import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-divider/70 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
              <span className="text-sm font-extrabold tracking-tight">TP</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-extrabold tracking-tight">TrackPro</div>
              <div className="text-xs text-muted">Fleet Intelligence Platform</div>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#modules" className="hover:text-foreground">
              Modules
            </a>
            <a href="#security" className="hover:text-foreground">
              Security
            </a>
            <a href="#contact" className="hover:text-foreground">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full border border-divider bg-surface px-4 py-2 text-sm font-semibold text-foreground hover:bg-background md:inline-flex"
            >
              Sign in
            </Link>
            <Link
              href="/login"
              className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Open console
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-28 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
            <div className="absolute -top-24 right-[-120px] h-[420px] w-[420px] rounded-full bg-primary/20 blur-3xl" />
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-divider bg-surface px-4 py-2 text-xs font-semibold text-muted">
                Real-time tracking • Alerts • Reports • White-label
              </div>
              <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
                Fleet intelligence at your fingertips
              </h1>
              <p className="mt-5 text-lg leading-8 text-muted">
                TrackPro helps fleets monitor vehicles in real time, automate geofence and speeding alerts, and turn raw
                location data into actionable reports. Built for multi-tenant and white-label deployments.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                  Sign in to dashboard
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-full border border-divider bg-surface px-6 py-3 text-sm font-semibold text-foreground hover:bg-background"
                >
                  Explore features
                </a>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-divider bg-surface p-4">
                <div>
                  <div className="text-xl font-extrabold text-foreground">100K+</div>
                  <div className="text-xs text-muted">devices (target scale)</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-foreground">900+</div>
                  <div className="text-xs text-muted">protocols (planned)</div>
                </div>
                <div>
                  <div className="text-xl font-extrabold text-foreground">Multi</div>
                  <div className="text-xs text-muted">tenant-ready</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-divider bg-surface p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold">Live operations</div>
                    <div className="text-xs text-muted">Snapshot of what TrackPro monitors</div>
                  </div>
                  <div className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">Connected</div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-divider bg-background p-4">
                    <div className="text-xs text-muted">Active vehicles</div>
                    <div className="mt-2 text-2xl font-extrabold">24</div>
                    <div className="mt-2 h-2 w-full rounded-full bg-divider">
                      <div className="h-2 w-4/5 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="rounded-2xl border border-divider bg-background p-4">
                    <div className="text-xs text-muted">Alerts today</div>
                    <div className="mt-2 text-2xl font-extrabold">3</div>
                    <div className="mt-2 text-xs font-semibold text-danger">2 critical</div>
                  </div>
                  <div className="col-span-2 rounded-2xl border border-divider bg-background p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted">Geofence events</div>
                        <div className="mt-1 text-lg font-bold">Warehouse zone</div>
                      </div>
                      <div className="rounded-full bg-warning/15 px-3 py-1 text-xs font-semibold text-warning">
                        1 violation
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                      <div className="rounded-xl border border-divider bg-surface p-3">
                        <div className="text-muted">Entry</div>
                        <div className="mt-1 font-bold text-foreground">12</div>
                      </div>
                      <div className="rounded-xl border border-divider bg-surface p-3">
                        <div className="text-muted">Exit</div>
                        <div className="mt-1 font-bold text-foreground">9</div>
                      </div>
                      <div className="rounded-xl border border-divider bg-surface p-3">
                        <div className="text-muted">Idle</div>
                        <div className="mt-1 font-bold text-foreground">2h</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 rounded-3xl border border-divider bg-surface p-6">
                <div className="text-sm font-bold">Why fleets choose TrackPro</div>
                <ul className="mt-4 grid gap-3 text-sm text-muted">
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                    Real-time maps, device status, and driver visibility.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                    Alert automation with routing and escalation.
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                    Reporting that scales with time-series data.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-t border-divider bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight">Built for operations, not dashboards</h2>
              <p className="mt-4 text-muted">
                TrackPro combines live tracking with fleet management workflows, analytics, and white-label tooling.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
              <FeatureCard
                title="Live tracking"
                description="Monitor vehicles in real time with map layers, clustering, and device trails."
                badge="Map"
              />
              <FeatureCard
                title="Smart alerts"
                description="Geofence entry/exit, speeding, idling, and SOS alerts with configurable rules."
                badge="Alerts"
              />
              <FeatureCard
                title="Reports & exports"
                description="Trip summaries, stops, zone visits, events, and scheduled exports (PDF/Excel/CSV)."
                badge="Reports"
              />
              <FeatureCard
                title="Eco-driving"
                description="Driver scoring with harsh acceleration/braking detection and leaderboards."
                badge="Analytics"
              />
              <FeatureCard
                title="Device compatibility"
                description="Protocol-first ingestion approach designed to support large device ecosystems."
                badge="Integrations"
              />
              <FeatureCard
                title="White-label & multi-tenant"
                description="Tenant branding, custom domains, and branded report headers/footers."
                badge="Enterprise"
              />
            </div>
          </div>
        </section>

        <section id="modules" className="border-t border-divider bg-background">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <h2 className="text-3xl font-extrabold tracking-tight">Modules</h2>
            <p className="mt-4 max-w-3xl text-muted">
              TrackPro is organized into clear modules so teams can ship faster and scale features independently.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              <ModuleCard
                title="Fleet Management"
                items={["Vehicles & drivers", "Maintenance tracking", "Documents & expiry alerts", "Dispatch workflows"]}
              />
              <ModuleCard
                title="Tracking & Maps"
                items={["Live map", "Device list & filters", "Trip history", "Replay foundation"]}
              />
              <ModuleCard
                title="Geofencing"
                items={["Circle, polygon, route corridors", "Scheduling", "Bulk assignment", "Analytics-ready events"]}
              />
              <ModuleCard
                title="Business"
                items={["Multi-tenant roles", "Reseller structure", "Quotas & billing hooks", "White-label tooling"]}
              />
            </div>
          </div>
        </section>

        <section id="security" className="border-t border-divider bg-surface">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight">Security & reliability</h2>
                <p className="mt-4 text-muted">
                  Designed with secure authentication and multi-tenant isolation in mind.
                </p>
                <div className="mt-8 grid gap-3">
                  <SecurityRow title="Role-based access control" description="Control visibility by role, branch, or tenant." />
                  <SecurityRow title="Tenant isolation ready" description="Tenant identifiers and isolation strategies for enterprise deployments." />
                  <SecurityRow title="Operational monitoring" description="Health checks, status visibility, and service boundaries for scale." />
                </div>
              </div>
              <div className="rounded-3xl border border-divider bg-background p-6">
                <div className="text-sm font-bold">Deployment options</div>
                <div className="mt-4 grid gap-3 text-sm text-muted">
                  <div className="rounded-2xl border border-divider bg-surface p-4">
                    <div className="font-semibold text-foreground">Cloud</div>
                    <div className="mt-1">Hosted deployments with multi-tenant support.</div>
                  </div>
                  <div className="rounded-2xl border border-divider bg-surface p-4">
                    <div className="font-semibold text-foreground">On-prem</div>
                    <div className="mt-1">Run in your own infrastructure with full control.</div>
                  </div>
                  <div className="rounded-2xl border border-divider bg-surface p-4">
                    <div className="font-semibold text-foreground">White-label</div>
                    <div className="mt-1">Custom branding, domains, and client-specific portals.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="border-t border-divider bg-background">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="rounded-3xl border border-divider bg-surface p-8 md:p-10">
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center">
                <div>
                  <h2 className="text-3xl font-extrabold tracking-tight">Let’s build your fleet platform</h2>
                  <p className="mt-4 text-muted">
                    Tell us about your fleet, devices, and requirements. We’ll tailor a TrackPro deployment for your team.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <a
                    href="mailto:support@trackpro.local"
                    className="inline-flex items-center justify-center rounded-full border border-divider bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-surface"
                  >
                    Email us
                  </a>
                  <a
                    href="#"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
                  >
                    Request demo
                  </a>
                </div>
              </div>
            </div>
            <footer className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-divider pt-6 text-xs text-muted md:flex-row">
              <div>© {new Date().getFullYear()} TrackPro</div>
              <div className="flex gap-4">
                <a href="#features" className="hover:text-foreground">
                  Features
                </a>
                <a href="#modules" className="hover:text-foreground">
                  Modules
                </a>
                <a href="#security" className="hover:text-foreground">
                  Security
                </a>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, description, badge }: { title: string; description: string; badge: string }) {
  return (
    <div className="rounded-3xl border border-divider bg-background p-6">
      <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{badge}</div>
      <div className="mt-4 text-lg font-extrabold">{title}</div>
      <div className="mt-2 text-sm leading-6 text-muted">{description}</div>
    </div>
  );
}

function ModuleCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-divider bg-surface p-6">
      <div className="text-lg font-extrabold">{title}</div>
      <ul className="mt-4 grid gap-2 text-sm text-muted">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SecurityRow({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-divider bg-background p-4">
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted">{description}</div>
    </div>
  );
}

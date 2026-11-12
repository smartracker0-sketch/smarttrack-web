"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  FiArrowDown,
  FiArrowUp,
  FiArrowUpRight,
  FiCheck,
  FiDownload,
  FiSettings,
  FiX,
} from "react-icons/fi";
import PageHeader from "./PageHeader";
import Icon from "./Icon";
import { pageById } from "./navigation";
import { useFleetData } from "./useFleetData";
import { useWorkspace } from "./WorkspaceContext";
import { canReadModule } from "./access";
import {
  motionOf,
  read,
  numeric,
  rowsFrom,
  telemetryOf,
  textOf,
  csvDownload,
  type DataRow,
} from "./data";

const WIDGETS = [
  ["motion", "Fleet motion", "activity"],
  ["fuel", "Fuel snapshot", "fuel"],
  ["connectivity", "Status charts", "dashboard"],
  ["drivers", "Driver intelligence", "users"],
  ["telemetry", "Telemetry", "activity"],
  ["video", "Video snapshot", "video"],
  ["activity", "Recent activity", "history"],
  ["mileage", "Mileage by vehicle", "truck"],
] as const;
type Layout = { order: string[]; hidden: string[] };
const DEFAULT: Layout = { order: WIDGETS.map(([id]) => id), hidden: [] };
function Donut({
  label,
  values,
}: {
  label: string;
  values: { label: string; value: number; color: string }[];
}) {
  const total = values.reduce((sum, item) => sum + item.value, 0);
  return (
    <article className="st-card">
      <div className="st-card-head">
        <h2>{label}</h2>
      </div>
      <div className="st-donut">
        <div className="st-donut-chart">
          <svg viewBox="0 0 140 140" aria-label={label} role="img">
            <circle
              cx="70"
              cy="70"
              r="52"
              stroke="var(--st-line)"
              strokeWidth="20"
              fill="none"
            />
            {values.map((item, index) => {
              const length = total ? (item.value / total) * 326.73 : 0,
                start = total
                  ? (values
                      .slice(0, index)
                      .reduce((sum, segment) => sum + segment.value, 0) /
                      total) *
                    326.73
                  : 0;
              return (
                <circle
                  key={item.label}
                  cx="70"
                  cy="70"
                  r="52"
                  fill="none"
                  stroke={item.color}
                  strokeWidth="20"
                  strokeDasharray={`${length} ${326.73 - length}`}
                  strokeDashoffset={-start}
                  transform="rotate(-90 70 70)"
                />
              );
            })}
          </svg>
          <span>
            <strong>{total}</strong>
            <small>devices</small>
          </span>
        </div>
        <div className="st-chart-legend">
          {values.map((item) => (
            <div key={item.label}>
              <i style={{ background: item.color }} />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>
                {total ? Math.round((item.value / total) * 100) : 0}%
              </small>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
function Band({
  items,
}: {
  items: {
    label: string;
    value: ReactNode;
    note?: string;
    href?: string;
    action?: boolean;
  }[];
}) {
  return (
    <div className="st-band">
      {items.map((item) => {
        const body = (
          <>
            {item.action ? (
              <>
                <strong>{item.label}</strong>
                <span>{item.value}</span>
                <FiArrowUpRight
                  className="st-band-action-arrow"
                  aria-hidden="true"
                />
              </>
            ) : (
              <>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </>
            )}
            {item.note && <small>{item.note}</small>}
          </>
        );
        return item.href ? (
          <Link
            href={item.href}
            key={item.label}
            className={item.action ? "st-band-action" : undefined}
          >
            {body}
          </Link>
        ) : (
          <div key={item.label}>{body}</div>
        );
      })}
    </div>
  );
}
function Mileage({ revision }: { revision: number }) {
  const { scope } = useWorkspace();
  const [period, setPeriod] = useState("Today"),
    [query, setQuery] = useState(""),
    [rows, setRows] = useState<DataRow[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  const dates = useMemo(() => {
    const end = new Date(revision);
    const start = new Date(end);
    start.setHours(0, 0, 0, 0);
    if (period === "7D") start.setDate(start.getDate() - 6);
    if (period === "30D") start.setDate(start.getDate() - 29);
    if (period === "Custom") {
      if (!from || !to) return null;
      return {
        from: new Date(from).toISOString(),
        to: new Date(to).toISOString(),
      };
    }
    return { from: start.toISOString(), to: end.toISOString() };
  }, [period, from, to, revision]);
  useEffect(() => {
    const controller = new AbortController(),
      timer = setTimeout(() => {
        if (scope?.length === 0) {
          setRows([]);
          setLoading(false);
          return;
        }
        if (!dates) {
          setRows([]);
          setLoading(false);
          return;
        }
        if (
          Date.parse(dates.from) >= Date.parse(dates.to) ||
          Date.parse(dates.to) - Date.parse(dates.from) > 31 * 86400000
        ) {
          setError("Choose a valid period of at most 31 days.");
          setLoading(false);
          return;
        }
        setLoading(true);
        setError("");
        const params = new URLSearchParams(dates);
        scope?.forEach((id) => params.append("organisationId", id));
        fetch("/api/dashboard/mileage?" + params, {
          signal: controller.signal,
          cache: "no-store",
        })
          .then(async (response) => {
            if (!response.ok)
              throw Error("Mileage is temporarily unavailable.");
            return response.json();
          })
          .then((data) => setRows(rowsFrom(data)))
          .catch((cause) => {
            if (cause.name !== "AbortError") {
              setError(cause.message);
              setRows([]);
            }
          })
          .finally(() => {
            if (!controller.signal.aborted) setLoading(false);
          });
      }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [dates, scope]);
  const filtered = rows.filter((row) =>
      [row.vehiclePlate, row.name]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
    ),
    max = Math.max(1, ...filtered.map((row) => numeric(row.distanceKm) ?? 0));
  return (
    <div className="st-card">
      <div className="st-card-head">
        <div className="st-tabs" aria-label="Mileage period">
          {["Today", "7D", "30D", "Custom"].map((value) => (
            <button
              key={value}
              className={period === value ? "is-active" : ""}
              aria-pressed={period === value}
              onClick={() => setPeriod(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <span className="st-muted st-mileage-note">
          Recorded odometer distance
        </span>
      </div>
      {period === "Custom" && (
        <div className="st-card-body st-form-grid">
          <label className="st-field">
            <span>From</span>
            <input
              className="st-input"
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="st-field">
            <span>To</span>
            <input
              className="st-input"
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
        </div>
      )}
      <div className="st-table-tools">
        <label className="st-search">
          <Icon name="truck" size={15} />
          <input
            aria-label="Search mileage by vehicle"
            placeholder="Search vehicles"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="st-toolbar-right">
          <button
            className="st-button st-small"
            disabled={loading || !rows.length}
            onClick={() =>
              csvDownload(
                "vehicle-mileage.csv",
                ["Vehicle", "Trips", "Distance (km)"],
                filtered.map((row) => [
                  row.vehiclePlate ?? row.name,
                  row.tripCount,
                  row.distanceKm,
                ]),
              )
            }
          >
            <FiDownload />
            Export CSV
          </button>
        </div>
      </div>
      <div
        className="st-mileage-scroll"
        tabIndex={0}
        role="region"
        aria-label="Mileage by vehicle; scroll for more rows"
      >
        <table className="st-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th className="st-number">Trips</th>
              <th className="st-number">Distance</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3}>Loading mileage…</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={3} role="status">
                  {error}
                </td>
              </tr>
            ) : !filtered.length ? (
              <tr>
                <td colSpan={3}>
                  {period === "Custom" && !dates
                    ? "Choose a date range."
                    : "No mileage recorded for this scope."}
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={String(row.deviceId)}>
                  <td>
                    <Link
                      className="st-link"
                      href={`/app/devices?vehicle=${encodeURIComponent(String(row.deviceId))}`}
                    >
                      {textOf(row.vehiclePlate ?? row.name)}
                    </Link>
                    {row.vehiclePlate && row.name !== row.vehiclePlate ? (
                      <small>{textOf(row.name)}</small>
                    ) : null}
                  </td>
                  <td className="st-number">{textOf(row.tripCount)}</td>
                  <td className="st-number">
                    <div className="st-mileage-distance">
                      {row.distanceKm != null && (
                        <i>
                          <span
                            style={{
                              width:
                                ((numeric(row.distanceKm) ?? 0) / max) * 100 +
                                "%",
                            }}
                          />
                        </i>
                      )}
                      <strong>
                        {row.distanceKm == null
                          ? "—"
                          : `${Number(row.distanceKm).toLocaleString(undefined, { maximumFractionDigits: 1 })} km`}
                      </strong>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default function Dashboard() {
  const fleet = useFleetData(),
    { account, scope, sidebarColour, setSidebarColour } = useWorkspace();
  const [draftSidebar, setDraftSidebar] = useState<"blue" | "white">("white");
  const [layout, setLayout] = useState<Layout>(DEFAULT),
    [draft, setDraft] = useState<Layout | null>(null),
    [arranging, setArranging] = useState(false),
    [drag, setDrag] = useState<string | null>(null),
    [activityPage, setActivityPage] = useState(1),
    [revision, setRevision] = useState(() => Date.now());
  function refresh() {
    fleet.refresh();
    setRevision(Date.now());
  }
  useEffect(() => {
    const timer = setInterval(() => setRevision(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  const key = "st-dashboard-layout:" + account.id;
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(key) ?? "null");
        if (
          saved &&
          Array.isArray(saved.order) &&
          Array.isArray(saved.hidden)
        ) {
          const valid = DEFAULT.order.filter((id) => saved.order.includes(id));
          setLayout({
            order: [
              ...saved.order.filter((id: string) => valid.includes(id)),
              ...DEFAULT.order.filter((id) => !valid.includes(id)),
            ],
            hidden: saved.hidden.filter((id: string) =>
              DEFAULT.order.includes(id),
            ),
          });
        }
      } catch {
        /* Ignore obsolete display preferences. */
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [key]);
  const byId = new Map(
    fleet.devices.map((device) => [String(device.id), device]),
  );
  const objects = fleet.objects.filter(
    (row) =>
      scope === null ||
      scope.includes(String(byId.get(String(row.id))?.organisationId ?? "")),
  );
  const counts = { moving: 0, idle: 0, stopped: 0, inactive: 0 };
  objects.forEach((row) => counts[motionOf(row, fleet.loadedAt)]++);
  const alerts = fleet.alerts.filter(
    (row) =>
      scope === null ||
      scope.includes(
        String(byId.get(String(row.deviceId))?.organisationId ?? ""),
      ),
  );
  const drivers = fleet.drivers.filter((row) => scope === null || scope.includes(String(row.organisationId)));
  const activityIndex = Math.min(
    activityPage,
    Math.max(1, Math.ceil(alerts.length / 6)),
  );
  const fuelRows = objects
      .map((row) => read(row, "latestFuel"))
      .filter((row): row is DataRow => Boolean(row && typeof row === "object")),
    fuelPct = fuelRows
      .map((row) => numeric(row.fuelLevelPct))
      .filter((value): value is number => value !== null),
    fuelLitres = fuelRows
      .map((row) => numeric(row.fuelLiters))
      .filter((value): value is number => value !== null);
  const cameras = fleet.cameras.filter(
      (row) =>
        scope === null ||
        scope.includes(
          String(
            row.organisationId ??
              byId.get(String(row.id))?.organisationId ??
              byId.get(String(row.assignedVehicleId))?.organisationId ??
              "",
          ),
        ),
    ),
    telemetry = objects.map(telemetryOf),
    speed = telemetry
      .map((row) => numeric(row.speedKph))
      .filter((value): value is number => value !== null),
    voltage = telemetry
      .map((row) => numeric(row.voltageMv))
      .filter((value): value is number => value !== null);
  const seenCount = telemetry.filter((row) =>
    read(row, "receivedAt", "eventTime"),
  ).length;
  const fresh = telemetry.filter((row) => {
    const at = Date.parse(textOf(read(row, "receivedAt", "eventTime"), ""));
    return Number.isFinite(at) && fleet.loadedAt - at < 15 * 60000;
  }).length;
  const fmt = (n: number) =>
    n.toLocaleString(undefined, { maximumFractionDigits: 1 });
  const selectedLayout = draft ?? layout;
  const allowedWidget = (id: string) =>
    canReadModule(
      account,
      id === "fuel" ? "fuel" : id === "video" ? "video" : "control",
    );
  function persist(next: Layout) {
    setLayout(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      /* Keep the active layout in memory. */
    }
  }
  function reorder(id: string, direction: number) {
    setDraft((current) => {
      if (!current) return current;
      const order = [...current.order],
        visible = order.filter(allowedWidget),
        position = visible.indexOf(id),
        next = Math.max(0, Math.min(visible.length - 1, position + direction));
      const index = order.indexOf(id),
        target = order.indexOf(visible[next]);
      if (position < 0 || target < 0) return current;
      [order[index], order[target]] = [order[target], order[index]];
      return { ...current, order };
    });
  }
  const widgets: Record<string, ReactNode> = {
    motion: (
      <div className="st-grid st-grid-4">
        {(["moving", "idle", "stopped", "inactive"] as const).map((status) => (
          <Link
            key={status}
            className={`st-kpi st-kpi-${status}`}
            href={`/app/devices?status=${status}`}
          >
            <span>
              {status[0].toUpperCase() + status.slice(1)}
              <Icon
                name={
                  status === "moving"
                    ? "activity"
                    : status === "idle"
                      ? "history"
                      : status === "stopped"
                        ? "truck"
                        : "cpu"
                }
              />
            </span>
            <strong>
              {fleet.loading && !fleet.objects.length ? "…" : counts[status]}
            </strong>
          </Link>
        ))}
      </div>
    ),
    fuel: (
      <Band
        items={[
          {
            label: "Vehicles with fuel data",
            value: fuelRows.length,
            href: "/app/fuel/sensors",
          },
          {
            label: "Average fuel",
            value: fuelPct.length
              ? fmt(fuelPct.reduce((a, b) => a + b, 0) / fuelPct.length) + "%"
              : "—",
            href: "/app/fuel-monitoring",
          },
          {
            label: "Fuel in tanks",
            value: fuelLitres.length
              ? fmt(fuelLitres.reduce((a, b) => a + b, 0)) + " L"
              : "—",
          },
          {
            label: "Low fuel vehicles",
            value: fuelPct.length
              ? fuelPct.filter((value) => value < 15).length
              : "—",
            note: "Below 15%",
            href: "/app/fuel-monitoring",
          },
        ]}
      />
    ),
    connectivity: (
      <div className="st-grid st-grid-3">
        <Donut
          label="Device connectivity"
          values={[
            { label: "Online", value: fresh, color: "#0ea5a4" },
            { label: "Offline", value: seenCount - fresh, color: "#e5484d" },
            {
              label: "Never reported",
              value: objects.length - seenCount,
              color: "#94a3b8",
            },
          ]}
        />
        <Donut
          label="Fleet motion"
          values={[
            { label: "Moving", value: counts.moving, color: "#159957" },
            { label: "Idle", value: counts.idle, color: "#d28b08" },
            { label: "Stopped", value: counts.stopped, color: "#e5484d" },
            { label: "Inactive", value: counts.inactive, color: "#8b5cf6" },
          ]}
        />
        <article className="st-card">
          <div className="st-card-head">
            <h2>Driver directory</h2>
            <Link href="/app/drivers" className="st-link">
              Drivers
            </Link>
          </div>
          <div className="st-card-body">
            <strong className="st-large-figure">
              {drivers.length}
            </strong>
            <p className="st-muted">Registered drivers</p>
            <p className="st-muted">
              Vehicle assignments are managed in the driver directory.
            </p>
          </div>
        </article>
      </div>
    ),
    drivers: (
      <Band
        items={[
          {
            label: "Scored drivers",
            value:
              drivers.filter((row) => row.scoreTotal != null).length,
            href: "/app/drivers",
          },
          {
            label: "Driver performance",
            value: "View scores",
            action: true,
            href: "/app/drivers/performance",
          },
          {
            label: "Open alerts",
            value: alerts.filter((row) => row.acknowledged !== true).length,
            href: "/app/alerts",
          },
          {
            label: "Fleet health score",
            value:
              fleet.insights?.fleetHealthScore != null
                ? textOf(fleet.insights.fleetHealthScore) + "/100"
                : "—",
            href: "/app/analytics",
          },
        ]}
      />
    ),
    telemetry: (
      <Band
        items={[
          { label: "Reporting vehicles", value: seenCount },
          {
            label: "Average speed",
            value: speed.length
              ? fmt(speed.reduce((a, b) => a + b, 0) / speed.length) + " km/h"
              : "—",
          },
          {
            label: "Average voltage",
            value: voltage.length
              ? fmt(
                  voltage.reduce((a, b) => a + b, 0) / voltage.length / 1000,
                ) + " V"
              : "—",
          },
          {
            label: "Latest reports",
            value: objects.length,
            href: "/app/devices",
          },
        ]}
      />
    ),
    video: (
      <Band
        items={[
          {
            label: "Registered cameras",
            value: cameras.length,
            href: "/app/video/cameras",
          },
          {
            label: "Streaming",
            value: "View streams",
            href: "/app/cctv",
            action: true,
          },
          {
            label: "Video events",
            value: "Review evidence",
            action: true,
            href: "/app/video/events",
          },
          {
            label: "Driver scores",
            value: "View scores",
            action: true,
            href: "/app/drivers/performance",
          },
        ]}
      />
    ),
    activity: (
      <div className="st-grid st-grid-2">
        <article className="st-card">
          <div className="st-card-head">
            <h2>Fleet insights</h2>
            <Link href="/app/analytics" className="st-link">
              View all
            </Link>
          </div>
          <div className="st-card-body">
            {rowsFrom(fleet.insights?.topInsights)
              .slice(0, 4)
              .map((row) => (
                <div key={String(row.id)} className="st-activity-item">
                  <strong>{textOf(row.title)}</strong>
                  <p className="st-muted">{textOf(row.summary)}</p>
                  <button
                    className="st-button st-small"
                    onClick={() =>
                      window.dispatchEvent(
                        new CustomEvent("fleet-ai:ask", {
                          detail: {
                            question: `Explain this fleet insight: ${textOf(row.title)}`,
                          },
                        }),
                      )
                    }
                  >
                    Ask AI Assistant
                  </button>
                </div>
              ))}
            {!rowsFrom(fleet.insights?.topInsights).length && (
              <p className="st-muted">No active fleet insights.</p>
            )}
          </div>
        </article>
        <article className="st-card">
          <div className="st-card-head">
            <h2>Recent activity</h2>
            <Link href="/app/alerts" className="st-link">
              View alerts
            </Link>
          </div>
          <div className="st-card-body">
            {alerts
              .slice((activityIndex - 1) * 6, activityIndex * 6)
              .map((row) => (
                <div className="st-activity-row" key={String(row.id)}>
                  <span>
                    {textOf(read(row, "message", "type", "alertType"))}
                  </span>
                  <time>
                    {new Date(
                      textOf(
                        read(row, "alertTime", "eventTime", "createdAt"),
                        "",
                      ),
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              ))}
            {!alerts.length && <p className="st-muted">No recent alerts.</p>}
          </div>
          <div className="st-table-footer">
            <span>{alerts.length} alerts</span>
            <div className="st-pagination">
              <button
                aria-label="Previous activity"
                disabled={activityIndex <= 1}
                onClick={() => setActivityPage((value) => value - 1)}
              >
                ‹
              </button>
              <button
                aria-label="Next activity"
                disabled={activityIndex * 6 >= alerts.length}
                onClick={() => setActivityPage((value) => value + 1)}
              >
                ›
              </button>
            </div>
          </div>
        </article>
      </div>
    ),
    mileage: <Mileage revision={revision} />,
  };
  return (
    <>
      <PageHeader
        page={pageById("dashboard")!}
        onRefresh={refresh}
        actions={
          <>
            <button
              className="st-button"
              onClick={() => {
                setDraftSidebar(sidebarColour);
                setDraft({
                  order: [...layout.order],
                  hidden: [...layout.hidden],
                });
                setArranging(true);
              }}
            >
              <Icon name="layers" size={15} />
              Arrange
            </button>
            <button
              className="st-button st-primary"
              onClick={() => {
                setDraftSidebar(sidebarColour);
                setDraft({
                  order: [...layout.order],
                  hidden: [...layout.hidden],
                });
                setArranging(false);
              }}
            >
              <FiSettings />
              Customize
            </button>
          </>
        }
      />
      {fleet.errors.length > 0 && (
        <div className="st-error" role="status">
          {fleet.errors.join(" · ")}. <button onClick={refresh}>Retry</button>
        </div>
      )}
      {draft && arranging && (
        <div className="st-notice st-arrange-bar">
          <span>Drag sections to reorder your dashboard.</span>
          <button
            className="st-button st-small"
            onClick={() => {
              setDraft(null);
              setArranging(false);
            }}
          >
            Cancel
          </button>
          <button
            className="st-button st-primary st-small"
            onClick={() => {
              persist(draft);
              setDraft(null);
              setArranging(false);
            }}
          >
            <FiCheck />
            Save layout
          </button>
        </div>
      )}
      <div className="st-dashboard-widgets">
        {!selectedLayout.order.some(
          (id) => !selectedLayout.hidden.includes(id) && allowedWidget(id),
        ) && (
          <section className="st-card st-empty">
            <h2>No dashboard widgets selected</h2>
            <p>
              Use an enabled module in the navigation, or customize the widgets
              available to your role.
            </p>
            <Link className="st-button" href="/app/support">
              Support
            </Link>
          </section>
        )}
        {selectedLayout.order
          .filter(
            (id) => !selectedLayout.hidden.includes(id) && allowedWidget(id),
          )
          .map((id) => {
            const definition = WIDGETS.find((widget) => widget[0] === id);
            if (!definition) return null;
            return (
              <section
                key={id}
                data-widget={id}
                draggable={arranging}
                className={arranging ? "st-widget is-arranging" : "st-widget"}
                onDragStart={() => setDrag(id)}
                onDragOver={(event) => {
                  if (arranging) event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (!draft || !drag || drag === id) return;
                  const order = draft.order.filter((item) => item !== drag);
                  order.splice(order.indexOf(id), 0, drag);
                  setDraft({ ...draft, order });
                  setDrag(null);
                }}
              >
                <h2 className="st-section-title">
                  <Icon name={definition[2]} size={16} />
                  {definition[1]}
                </h2>
                {widgets[id]}
              </section>
            );
          })}
      </div>
      {draft && !arranging && (
        <div
          className="st-dialog-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDraft(null);
          }}
        >
          <section
            className="st-dialog st-customize"
            role="dialog"
            aria-modal="true"
            aria-label="Customize dashboard"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                setDraft(null);
              }
            }}
          >
            <header>
              <h2>Customize dashboard</h2>
              <button
                className="st-icon-button"
                aria-label="Close customization"
                autoFocus
                onClick={() => setDraft(null)}
              >
                <FiX />
              </button>
            </header>
            <div className="st-dialog-body">
              <fieldset className="st-sidebar-colour-options">
                <legend>Sidebar colour</legend>
                {(["blue", "white"] as const).map((colour) => <label key={colour} className={draftSidebar === colour ? "is-selected" : ""}>
                  <input type="radio" name="sidebar-colour" value={colour} checked={draftSidebar === colour} onChange={() => setDraftSidebar(colour)} />
                  <span className={`st-sidebar-swatch is-${colour}`} aria-hidden="true" />
                  {colour === "blue" ? "Blue" : "White"}
                </label>)}
              </fieldset>
              {draft.order.filter(allowedWidget).map((id, index) => (
                <div key={id} className="st-customize-row">
                  <label>
                    <input
                      type="checkbox"
                      checked={!draft.hidden.includes(id)}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          hidden: event.target.checked
                            ? draft.hidden.filter((item) => item !== id)
                            : [...draft.hidden, id],
                        })
                      }
                    />
                    {WIDGETS.find((widget) => widget[0] === id)?.[1]}
                  </label>
                  <button
                    className="st-icon-button"
                    aria-label={`Move ${id} up`}
                    disabled={index === 0}
                    onClick={() => reorder(id, -1)}
                  >
                    <FiArrowUp />
                  </button>
                  <button
                    className="st-icon-button"
                    aria-label={`Move ${id} down`}
                    disabled={
                      index === draft.order.filter(allowedWidget).length - 1
                    }
                    onClick={() => reorder(id, 1)}
                  >
                    <FiArrowDown />
                  </button>
                </div>
              ))}
            </div>
            <footer>
              <button
                className="st-button"
                style={{ marginRight: "auto" }}
                onClick={() => { setDraft(DEFAULT); setDraftSidebar("white"); }}
              >
                Reset
              </button>
              <button className="st-button" onClick={() => setDraft(null)}>
                Cancel
              </button>
              <button
                className="st-button st-primary"
                onClick={() => {
                  persist(draft);
                  setSidebarColour(draftSidebar);
                  setDraft(null);
                }}
              >
                Save changes
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FiCalendar,
  FiChevronDown,
  FiDownload,
  FiPrinter,
} from "react-icons/fi";
import PageHeader from "./PageHeader";
import DataTable, { type Column } from "./DataTable";
import { pageById } from "./navigation";
import { escapeHtml, read, rowsFrom, textOf, type DataRow } from "./data";
import { useWorkspace } from "./WorkspaceContext";
type Definition = {
  kind: string;
  title: string;
  note: string;
  columns: { key: string; label: string; numeric: boolean }[];
};
type Summary = {
  rows: number;
  vehicles: number;
  totals: Record<string, number | null>;
  statuses: Record<string, number>;
};
const EMPTY: Summary = { rows: 0, vehicles: 0, totals: {}, statuses: {} };
const kinds: Record<string, { kind: string; label: string }[]> = {
  refuels: [{ kind: "fuel-refuels", label: "Refuels" }],
  drains: [{ kind: "fuel-drains", label: "Drains & theft" }],
  consumption: [
    { kind: "fuel-consumption", label: "By vehicle" },
    { kind: "fuel-drivers", label: "By driver" },
    { kind: "fuel-forecast", label: "Range forecast" },
  ],
  "fuel-reports": [
    { kind: "fuel-consumption", label: "Consumption" },
    { kind: "fuel-refuels", label: "Refuels" },
    { kind: "fuel-drains", label: "Drains & theft" },
    { kind: "fuel-trips", label: "Trip fuel efficiency" },
  ],
  "video-analytics": [{ kind: "video-analytics", label: "Analytics" }],
  "video-reports": [
    { kind: "video-events", label: "Events" },
    { kind: "video-analytics", label: "By camera" },
  ],
  "maintenance-reports": [
    { kind: "maintenance-history", label: "Work orders" },
  ],
  "maintenance-alerts": [{ kind: "maintenance-due", label: "Due work orders" }],
  "sms-reports": [{ kind: "sms-delivery", label: "Delivery" }],
};
export function isReportWorkspace(id: string) {
  return Boolean(kinds[id]);
}
function localDate(value: Date) {
  return new Date(value.getTime() - value.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
function currentRange() {
  const end = new Date(),
    start = new Date(end);
  start.setHours(0, 0, 0, 0);
  return { label: "Today", from: localDate(start), to: localDate(end) };
}
export default function ReportWorkspace({ id }: { id: string }) {
  const { scope, account } = useWorkspace();
  const query = useSearchParams();
  const reportType = query.get("type");
  const options = useMemo(
    () =>
      kinds[id] ?? [
        { kind: reportType ?? "fuel-consumption", label: "Report" },
      ],
    [id, reportType],
  );
  const [tableQuery, setTableQuery] = useState({ search: "", sort: "" });
  const [kind, setKind] = useState(options[0].kind),
    [definition, setDefinition] = useState<Definition | null>(null),
    [summary, setSummary] = useState<Summary>(EMPTY),
    [range, setRange] = useState(currentRange),
    [status, setStatus] = useState(""),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0),
    [exporting, setExporting] = useState(false);
  const dateMenu = useRef<HTMLDetailsElement>(null),
    exportMenu = useRef<HTMLDetailsElement>(null);
  const prefs = `st-report-tab:${account.id}:${id}`;
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const value = localStorage.getItem(prefs);
        setKind(
          value && options.some((option) => option.kind === value)
            ? value
            : options[0].kind,
        );
      } catch {
        /* Keep the first report tab. */
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [prefs, options]);
  const params = useMemo(() => {
    const value = new URLSearchParams();
    const from = Date.parse(range.from),
      to = Date.parse(range.to);
    if (Number.isFinite(from) && Number.isFinite(to)) {
      value.set("from", new Date(from).toISOString());
      value.set("to", new Date(to).toISOString());
    }
    scope?.forEach((id) => value.append("organisationId", id));
    if (status) value.set("status", status);
    return value.toString();
  }, [range, scope, status]);
  const valid = Boolean(
    range.from &&
    range.to &&
    range.from < range.to &&
    Date.parse(range.to) - Date.parse(range.from) <= 31 * 86400000,
  );
  const exportParams = useMemo(() => {
    const value = new URLSearchParams(params);
    if (tableQuery.search) value.set("search", tableQuery.search);
    if (tableQuery.sort) value.set("sort", tableQuery.sort);
    return value.toString();
  }, [params, tableQuery]);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
      async function load() {
        try {
          const response = await fetch(`/api/reports/${kind}/schema`, {
            signal: controller.signal,
            cache: "no-store",
          });
          const schema = await response.json();
          if (!response.ok)
            throw Error(
              schema?.message ?? "Report definition could not be loaded.",
            );
          if (!controller.signal.aborted) setDefinition(schema);
          if (scope?.length === 0) {
            setSummary(EMPTY);
            return;
          }
          if (!valid) {
            setSummary(EMPTY);
            throw Error(
              "Choose a date range of at most 31 days, with the end after the start.",
            );
          }
          const result = await fetch(`/api/reports/${kind}?${params}&size=1`, {
            signal: controller.signal,
            cache: "no-store",
          });
          const body = await result.json();
          if (!result.ok)
            throw Error(body?.message ?? "This report could not be loaded.");
          if (!controller.signal.aborted) setSummary(body.summary ?? EMPTY);
        } catch (cause) {
          if (!controller.signal.aborted)
            setError(
              cause instanceof Error
                ? cause.message
                : "This report could not be loaded.",
            );
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      }
      void load();
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [kind, params, valid, scope, revision]);
  const columns = useMemo<Column[]>(
    () =>
      definition?.columns.map((column) => ({
        ...column,
        render: (row) => {
          const value = read(row, column.key);
          if (column.key === "time" && value) {
            const date = new Date(String(value));
            return Number.isFinite(date.getTime())
              ? date.toLocaleString()
              : "—";
          }
          if (column.key === "status")
            return (
              <span
                className={`st-status ${["OVERDUE", "CRITICAL", "HIGH", "FAILED", "UNDELIVERABLE"].includes(String(value)) ? "st-status-stopped" : ["REVIEW_REQUIRED", "LOW", "MEDIUM", "DUE_TODAY", "UPCOMING", "PENDING", "SENT"].includes(String(value)) ? "st-status-idle" : ["RECORDED", "DETECTED", "DELIVERED", "COMPLETED", "DONE"].includes(String(value)) ? "st-status-moving" : "st-status-inactive"}`}
              >
                {textOf(value).replaceAll("_", " ")}
              </span>
            );
          if (column.numeric && typeof value === "number")
            return value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            });
          return textOf(value);
        },
      })) ?? [],
    [definition],
  );
  function choosePeriod(label: string) {
    if (label === "Custom") {
      setRange((current) => ({ ...current, label }));
      return;
    }
    const end = new Date(),
      start = new Date(end);
    start.setHours(0, 0, 0, 0);
    if (label === "Yesterday") {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    }
    if (label === "7 days") start.setDate(start.getDate() - 6);
    if (label === "30 days") start.setDate(start.getDate() - 29);
    if (label === "Next 7 days" || label === "Next 30 days") {
      end.setDate(end.getDate() + (label === "Next 7 days" ? 6 : 29));
      end.setHours(23, 59, 59, 999);
    }
    setRange({ label, from: localDate(start), to: localDate(end) });
  }
  async function exportFile(format: "csv" | "xlsx") {
    if (exporting) return;
    setExporting(true);
    setError("");
    try {
      const response = await fetch(
        `/api/reports/${kind}/export?${exportParams}&format=${format}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw Error(body?.message ?? "The report could not be exported.");
      }
      const url = URL.createObjectURL(await response.blob()),
        anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${kind}.${format}`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      if (exportMenu.current) exportMenu.current.open = false;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }
  async function printReport() {
    if (!definition || exporting) return;
    setExporting(true);
    setError("");
    try {
      const rows: DataRow[] = [];
      let page = 0,
        total = 1;
      while (page < total) {
        const response = await fetch(
          `/api/reports/${kind}?${exportParams}&size=100&page=${page}`,
          { cache: "no-store" },
        );
        const body = await response.json();
        if (!response.ok)
          throw Error(body?.message ?? "The print report could not be loaded.");
        rows.push(...rowsFrom(body));
        total = Number(body.totalPages) || 1;
        page++;
      }
      const frame = document.createElement("iframe");
      frame.style.position = "fixed";
      frame.style.width = "0";
      frame.style.height = "0";
      frame.style.border = "0";
      frame.title = "Print report";
      document.body.appendChild(frame);
      frame.onload = () => {
        frame.contentWindow?.addEventListener(
          "afterprint",
          () => frame.remove(),
          { once: true },
        );
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
      };
      frame.srcdoc = `<!doctype html><html><head><title>${escapeHtml(definition.title)}</title><style>body{font:12px system-ui;color:#0f172a;margin:24px}h1{font-size:22px}p{color:#475569}table{width:100%;border-collapse:collapse}th,td{padding:8px;border-bottom:1px solid #ddd;text-align:left}thead{display:table-header-group}tr{break-inside:avoid}@page{size:A4 landscape;margin:12mm}</style></head><body><h1>Smart Tracker · ${escapeHtml(definition.title)}</h1><p>${escapeHtml(range.from)} — ${escapeHtml(range.to)}</p><table><thead><tr>${definition.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${definition.columns.map((column) => `<td>${escapeHtml(textOf(row[column.key]))}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
      if (exportMenu.current) exportMenu.current.open = false;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Print failed.");
    } finally {
      setExporting(false);
    }
  }
  const totals = summary.totals;
  const metrics = [
    {
      label: kind.includes("drivers")
        ? "Drivers"
        : kind.includes("trips")
          ? "Trips"
          : kind.includes("refuels") || kind.includes("drains")
            ? "Events"
            : kind === "video-events"
              ? "Events"
              : kind === "video-analytics"
                ? "Cameras with events"
                : kind.startsWith("maintenance-")
                  ? "Work orders"
                  : kind === "sms-delivery"
                    ? "Messages"
                    : "Vehicles with readings",
      value: summary.rows,
    },
    ...(kind.includes("refuels") ||
    kind.includes("drains") ||
    kind.includes("trips") ||
    !kind.startsWith("fuel-")
      ? [{ label: "Vehicles", value: summary.vehicles }]
      : []),
    ...[
      "volumeLiters",
      "usedLiters",
      "distanceKm",
      "cost",
      "eventCount",
      "availableClips",
    ]
      .filter((key) => Object.hasOwn(totals, key))
      .slice(0, 2)
      .map((key) => ({
        label:
          key === "volumeLiters"
            ? "Recorded volume (L)"
            : key === "usedLiters"
              ? "Observed use (L)"
              : key === "cost"
                ? "Recorded cost (NGN)"
                : key === "eventCount"
                  ? "Events"
                  : key === "availableClips"
                    ? "Clips received"
                    : "Recorded distance (km)",
        value: totals[key],
      })),
  ];
  const page = pageById(id)!;
  return (
    <>
      <PageHeader
        page={page}
        onRefresh={() => {
          if (range.label !== "Custom") choosePeriod(range.label);
          setRevision((value) => value + 1);
        }}
        actions={
          <>
            {id === "maintenance-alerts" && (
              <Link className="st-button st-primary" href="/app/maintenance">
                Work orders
              </Link>
            )}
            <details
              ref={dateMenu}
              className="st-report-date-menu"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.stopPropagation();
                  event.currentTarget.open = false;
                }
              }}
            >
              <summary className="st-button">
                <FiCalendar />
                {range.label}
                <FiChevronDown />
              </summary>
              <div className="st-popover st-report-date-fields">
                <label className="st-field">
                  <span>Period</span>
                  <select
                    className="st-input"
                    value={range.label}
                    onChange={(event) => choosePeriod(event.target.value)}
                  >
                    {(id === "maintenance-alerts"
                      ? ["Today", "Next 7 days", "Next 30 days", "Custom"]
                      : ["Today", "Yesterday", "7 days", "30 days", "Custom"]
                    ).map((label) => (
                      <option key={label}>{label}</option>
                    ))}
                  </select>
                </label>
                <label className="st-field">
                  <span>From</span>
                  <input
                    className="st-input"
                    type="datetime-local"
                    value={range.from}
                    max={range.to}
                    onChange={(event) =>
                      setRange((current) => ({
                        ...current,
                        from: event.target.value,
                        label: "Custom",
                      }))
                    }
                  />
                </label>
                <label className="st-field">
                  <span>To</span>
                  <input
                    className="st-input"
                    type="datetime-local"
                    value={range.to}
                    min={range.from}
                    onChange={(event) =>
                      setRange((current) => ({
                        ...current,
                        to: event.target.value,
                        label: "Custom",
                      }))
                    }
                  />
                </label>
                <button
                  className="st-button st-small"
                  onClick={() => {
                    if (dateMenu.current) dateMenu.current.open = false;
                  }}
                >
                  Done
                </button>
              </div>
            </details>
            <details className="st-report-export-menu" ref={exportMenu}>
              <summary className="st-button">
                <FiDownload />
                {exporting ? "Preparing…" : "Export"}
                <FiChevronDown />
              </summary>
              <div className="st-popover">
                <button
                  disabled={exporting || loading || !valid}
                  onClick={() => void exportFile("csv")}
                >
                  CSV · all matching rows
                </button>
                <button
                  disabled={exporting || loading || !valid}
                  onClick={() => void exportFile("xlsx")}
                >
                  Excel workbook
                </button>
                <button
                  disabled={exporting || loading || !valid}
                  onClick={() => void printReport()}
                >
                  <FiPrinter />
                  Print / PDF
                </button>
              </div>
            </details>
          </>
        }
      />
      {options.length > 1 && (
        <nav className="st-tabs st-report-tabs" aria-label="Report views">
          {options.map((option) => (
            <button
              className={kind === option.kind ? "is-active" : ""}
              aria-pressed={kind === option.kind}
              key={option.kind}
              onClick={() => {
                setKind(option.kind);
                setStatus("");
                try {
                  localStorage.setItem(prefs, option.kind);
                } catch {
                  /* Keep the active view. */
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </nav>
      )}
      {error && (
        <p className="st-error" role="alert">
          {error}
        </p>
      )}
      {definition?.note && <p className="st-report-note">{definition.note}</p>}
      <div className="st-band st-report-summary">
        {metrics.map((metric) => (
          <div key={metric.label} className="st-report-metric">
            <span>{metric.label}</span>
            <strong>
              {loading
                ? "…"
                : metric.value == null
                  ? "—"
                  : Number(metric.value).toLocaleString(undefined, {
                      maximumFractionDigits: 1,
                    })}
            </strong>
          </div>
        ))}
      </div>
      {definition && valid && (
        <DataTable
          key={`${id}:${kind}:${revision}`}
          id={`${id}:${kind}`}
          endpoint={`/api/reports/${kind}?${params}`}
          columns={columns}
          serverPaged
          deviceRows={!kind.endsWith("drivers")}
          mapIdKey="deviceId"
          onQueryChange={setTableQuery}
          actions={
            Object.keys(summary.statuses).length ? (
              <select
                className="st-input"
                aria-label="Report status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">All statuses</option>
                {Object.entries(summary.statuses).map(([value, count]) => (
                  <option value={value} key={value}>
                    {value.replaceAll("_", " ")} ({count})
                  </option>
                ))}
              </select>
            ) : undefined
          }
        />
      )}
    </>
  );
}

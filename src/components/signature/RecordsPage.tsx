"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DataTable, { type Column } from "./DataTable";
import VideoEvents from "./VideoEvents";
import OperationsPage, { isOperationsPage } from "./OperationsPage";
import ReportWorkspace, { isReportWorkspace } from "./ReportWorkspace";
import ResetHub from "./ResetHub";
import ScheduledReports from "./ScheduledReports";
import PageHeader from "./PageHeader";
import { pageById } from "./navigation";
import Icon from "./Icon";
import { read, rowsFrom, textOf, vehicleName, type DataRow } from "./data";
import { useWorkspace } from "./WorkspaceContext";
const deviceColumns: Column[] = [
  {
    key: "vehiclePlate",
    label: "Vehicle",
    render: (row) => <strong>{vehicleName(row)}</strong>,
  },
  { key: "imei", label: "IMEI" },
  { key: "deviceType", label: "Device type" },
  { key: "organisationName", label: "Account" },
  { key: "status", label: "Status" },
  {
    key: "createdAt",
    label: "Registered",
    render: (row) =>
      row.createdAt
        ? new Date(String(row.createdAt)).toLocaleDateString()
        : "—",
  },
];
const cameraColumns: Column[] = [
  {
    key: "vehiclePlate",
    label: "Vehicle",
    render: (row) => <strong>{vehicleName(row)}</strong>,
  },
  { key: "name", label: "Camera" },
  {
    key: "deviceId",
    label: "Device ID",
    render: (row) => textOf(read(row, "deviceId", "imei", "serialNo")),
  },
  { key: "status", label: "Connection" },
  { key: "channels", label: "Channels", numeric: true },
];
const placeColumns: Column[] = [
  { key: "name", label: "Name" },
  { key: "category", label: "Category" },
  { key: "location", label: "Location" },
  { key: "radiusM", label: "Radius (m)", numeric: true },
  {
    key: "active",
    label: "Status",
    render: (row) => (row.active === true ? "Active" : "Inactive"),
  },
];
const ruleColumns: Column[] = [
  { key: "alertKey", label: "Rule" },
  {
    key: "enabled",
    label: "Status",
    render: (row) => (row.enabled === true ? "Enabled" : "Disabled"),
  },
  {
    key: "emailEnabled",
    label: "Email",
    render: (row) => (row.emailEnabled === true ? "On" : "Off"),
  },
  {
    key: "smsEnabled",
    label: "SMS",
    render: (row) => (row.smsEnabled === true ? "On" : "Off"),
  },
];
const maintenanceColumns: Column[] = [
  {
    key: "deviceName",
    label: "Vehicle",
    render: (row) =>
      textOf(read(row, "vehiclePlate", "deviceName", "deviceId")),
  },
  {
    key: "title",
    label: "Service",
    render: (row) => textOf(read(row, "task", "title", "name", "serviceType")),
  },
  { key: "dueDate", label: "Due date" },
  { key: "status", label: "Status" },
  { key: "cost", label: "Cost", numeric: true },
];
const sensorColumns: Column[] = [
  {
    key: "vehiclePlate",
    label: "Vehicle",
    render: (row) => <strong>{vehicleName(row)}</strong>,
  },
  { key: "imei", label: "Tracker" },
  { key: "gatewayDeviceName", label: "Linked vehicle" },
  { key: "tankCapacityLiters", label: "Tank (L)", numeric: true },
  { key: "fuelMeasurementRange", label: "Measurement range", numeric: true },
  { key: "status", label: "Status" },
];
const isSensor = (row: DataRow) =>
  String(row.deviceType).toLowerCase() === "fuel sensor";
const configs: Record<
  string,
  {
    endpoint: string;
    columns: Column[];
    serverPaged?: boolean;
    scoped?: boolean;
    deviceRows?: boolean;
    rowFilter?: (row: DataRow) => boolean;
  }
> = {
  vehicles: {
    endpoint: "/api/devices",
    columns: deviceColumns,
    serverPaged: true,
    deviceRows: true,
  },
  devices: {
    endpoint: "/api/devices",
    columns: deviceColumns,
    serverPaged: true,
    deviceRows: true,
  },
  "device-reports": {
    endpoint: "/api/devices",
    columns: deviceColumns,
    serverPaged: true,
    deviceRows: true,
  },
  sensors: {
    endpoint: "/api/devices?size=500",
    columns: sensorColumns,
    deviceRows: true,
    scoped: true,
    rowFilter: isSensor,
  },
  cameras: {
    endpoint: "/api/dashcams",
    columns: cameraColumns,
    deviceRows: true,
  },
  pois: { endpoint: "/api/live-tracking?tab=landmark", columns: placeColumns },
  "alert-rules": {
    endpoint: "/api/telemetry/alert-settings",
    columns: ruleColumns,
  },
  "service-history": {
    endpoint: "/api/maintenance",
    columns: maintenanceColumns,
  },
  "licence-consumption": {
    endpoint: "/api/admin/devices?size=500",
    columns: deviceColumns,
    deviceRows: false,
  },
};
const useful: Record<string, { label: string; href: string }> = {
  fuel: { label: "View fuel monitoring", href: "/app/fuel-monitoring" },
  video: { label: "View streams", href: "/app/cctv" },
  maintenance: { label: "View work orders", href: "/app/maintenance" },
  reports: { label: "View reports", href: "/app/reports" },
  control: { label: "View devices", href: "/app/devices-mgmt" },
  admin: { label: "View administration", href: "/admin/overview" },
};
export default function RecordsPage({ id }: { id: string }) {
  const page = pageById(id)!;
  const { admin } = useWorkspace();
  const config = configs[id];
  const [revision, setRevision] = useState(0);
  if (!page) return null;
  if(id==="reset")return <ResetHub/>;
  if(id==="maintenance-delivery")return <ScheduledReports maintenance/>;
  if (isOperationsPage(id)) return <OperationsPage id={id} />;
  if (isReportWorkspace(id)) return <ReportWorkspace id={id} />;
  if (id === "video-events" || id === "incidents")
    return <VideoEvents priority={id === "incidents"} />;
  if (id.endsWith("overview")) return <HubOverview id={id} />;
  return (
    <>
      <PageHeader
        page={page}
        onRefresh={config ? () => setRevision((value) => value + 1) : undefined}
        tenant={Boolean(config?.serverPaged || config?.scoped) && !page.admin}
      />
      {config ? (
        <DataTable
          key={id + revision}
          id={id}
          {...config}
          actions={
            id === "alert-rules" ? (
              <Link href="/app/alerts" className="st-button">
                Configure alerts
              </Link>
            ) : (id === "vehicles" || id === "devices") && admin ? (
              <Link href="/admin/devices" className="st-button">
                Manage devices
              </Link>
            ) : undefined
          }
        />
      ) : (
        <section className="st-card">
          <div className="st-empty">
            <Icon name={page.icon} size={30} />
            <h2 className="st-unavailable-title">
              {page.title} is not available in this release
            </h2>
            <p>This module is awaiting implementation.</p>
            {page.hub && (
              <Link className="st-button" href={useful[page.hub].href}>
                {useful[page.hub].label}
              </Link>
            )}
          </div>
        </section>
      )}
    </>
  );
}
export function HubOverview({ id }: { id: string }) {
  const page = pageById(id)!;
  const [rows, setRows] = useState<DataRow[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  const endpoint =
    page.hub === "video"
      ? "/api/dashcams"
      : page.hub === "maintenance"
        ? "/api/maintenance"
        : "/api/devices?size=100";
  useEffect(() => {
    const controller = new AbortController();
    fetch(endpoint, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw Error("This overview could not be loaded.");
        return response.json();
      })
      .then((data) => {
        setRows(rowsFrom(data));
        setError("");
      })
      .catch((cause) => {
        if (cause.name !== "AbortError") setError(cause.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [endpoint, revision]);
  const title =
    page.hub === "video"
      ? "Camera connections"
      : page.hub === "maintenance"
        ? "Service records"
        : "Device checks";
  const target = useful[page.hub!];
  const attention = rows
    .filter(
      (row) =>
        !["ACTIVE", "ONLINE", "COMPLETED", "DONE", "ENABLED"].includes(
          String(row.status).toUpperCase(),
        ),
    )
    .slice(0, 6);
  const totals = useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((row) =>
        ["ACTIVE", "ONLINE", "COMPLETED", "ENABLED"].includes(
          String(row.status).toUpperCase(),
        ),
      ).length,
    }),
    [rows],
  );
  return (
    <>
      <PageHeader
        page={page}
        onRefresh={() => setRevision((value) => value + 1)}
        tenant={false}
      />
      {error && (
        <div className="st-error" role="alert">
          {error}
        </div>
      )}
      <div className="st-band st-band-metrics">
        <div>
          <span>
            {page.hub === "video"
              ? "Registered cameras"
              : page.hub === "maintenance"
                ? "Service records"
                : "Devices"}
          </span>
          <strong>{loading ? "…" : totals.total}</strong>
        </div>
        <div>
          <span>Active</span>
          <strong>{loading ? "…" : totals.active}</strong>
        </div>
        <div>
          <span>Other statuses</span>
          <strong>{loading ? "…" : totals.total - totals.active}</strong>
        </div>
      </div>
      <div className="st-grid st-grid-2" style={{ marginTop: 16 }}>
        <section className="st-card">
          <div className="st-card-head">
            <h2>{title}</h2>
            <Link className="st-link" href={target.href}>
              View all
            </Link>
          </div>
          <div className="st-card-body">
            {loading ? (
              <p role="status">Loading…</p>
            ) : !rows.length ? (
              <p className="st-muted">No records in this scope.</p>
            ) : (
              rows.slice(0, 6).map((row) => (
                <div className="st-activity-row" key={String(row.id)}>
                  <span>
                    {textOf(
                      read(row, "vehiclePlate", "name", "deviceName", "id"),
                    )}
                  </span>
                  <strong>{textOf(row.status)}</strong>
                </div>
              ))
            )}
          </div>
        </section>
        <section className="st-card">
          <div className="st-card-head">
            <h2>Needs attention</h2>
          </div>
          <div className="st-card-body">
            {loading ? (
              <p role="status">Loading checks…</p>
            ) : !attention.length ? (
              <p className="st-muted">
                No outstanding items in the loaded records.
              </p>
            ) : (
              attention.map((row) => (
                <div className="st-activity-row" key={String(row.id)}>
                  <span>
                    {textOf(
                      read(row, "vehiclePlate", "name", "deviceName", "id"),
                    )}
                    <small className="st-muted">{textOf(row.status)}</small>
                  </span>
                  <Link href={target.href} className="st-link">
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}

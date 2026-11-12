"use client";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "./PageHeader";
import DataTable, { type Column } from "./DataTable";
import { pageById } from "./navigation";
import { useWorkspace } from "./WorkspaceContext";
import { fetchDirectory } from "@/lib/fetchDirectory";
import { type DataRow, vehicleName } from "./data";
const assigned = (row: DataRow) => Boolean(String(row.vehiclePlate ?? "").trim());
const columns: Column[] = [{ key: "vehiclePlate", label: "Vehicle", render: (row) => vehicleName(row) }, { key: "imei", label: "IMEI" }, { key: "deviceType", label: "Device type" }, { key: "organisationName", label: "Account" }, { key: "assignment", label: "Registration", render: (row) => assigned(row) ? "Assigned" : "Unassigned" }, { key: "status", label: "Device status" }];
export default function VehicleStates() {
  const { scope } = useWorkspace();
  const [rows, setRows] = useState<DataRow[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState(""), [revision, setRevision] = useState(0), [segment, setSegment] = useState("all");
  useEffect(() => { const controller = new AbortController(); const timer = setTimeout(() => { setLoading(true); fetchDirectory<DataRow>("/api/devices", controller.signal).then((records) => { setRows(records); setError(""); }).catch((cause) => { if (cause.name !== "AbortError") setError(cause.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); }); }, 0); return () => { clearTimeout(timer); controller.abort(); }; }, [revision]);
  const visible = rows.filter((row) => scope === null || scope.includes(String(row.organisationId))), total = visible.length, linked = visible.filter(assigned).length;
  const filter = useMemo(() => (row: DataRow) => segment === "all" || (segment === "assigned" ? assigned(row) : !assigned(row)), [segment]);
  return <><PageHeader page={pageById("vehicle-states")!} onRefresh={() => setRevision((value) => value + 1)} />{error && <p className="st-error" role="alert">{error}</p>}<div className="st-grid st-grid-3" style={{ marginBottom: 16 }}>{[["all", "All devices", total], ["assigned", "Assigned", linked], ["unassigned", "Unassigned", total - linked]].map(([key, label, count]) => <button key={String(key)} className={`st-card st-state-kpi${segment === key ? " is-selected" : ""}`} aria-pressed={segment === key} onClick={() => setSegment(String(key))}><span>{label}</span><strong>{loading ? "…" : count}</strong></button>)}</div><DataTable id="vehicle-states" endpoint="/api/fleet-ledger/devices" columns={columns} rowFilter={filter} scoped refreshKey={revision} deviceRows /></>;
}

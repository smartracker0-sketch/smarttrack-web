"use client";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import PageHeader from "./PageHeader";
import DataTable, { type Column } from "./DataTable";
import { pageById } from "./navigation";
import { useWorkspace } from "./WorkspaceContext";
import { type DataRow } from "./data";
import styles from "./ScheduledReports.module.css";
type Group = DataRow & { id: string; name: string; active: boolean; payload: { vehicles?: string[] } };
export default function VehicleGroups() {
  const { account } = useWorkspace();
  const canWrite = account.roles.includes("SUPER_ADMIN") || (account.moduleAccess ? account.moduleAccess.control === "WRITE" : account.roles.some((role) => ["ADMIN", "FLEET_MANAGER"].includes(role)));
  const [editing, setEditing] = useState<Group | null>(null), [open, setOpen] = useState(false), [name, setName] = useState(""), [vehicles, setVehicles] = useState(""), [active, setActive] = useState(true), [error, setError] = useState(""), [formError, setFormError] = useState(""), [busy, setBusy] = useState(false), [revision, setRevision] = useState(0), [notice, setNotice] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (open) dialog.current?.showModal(); else dialog.current?.close(); }, [open]);
  const columns = useMemo<Column[]>(() => [{ key: "name", label: "Group" }, { key: "payload.vehicles", label: "Vehicles", render: (row) => { const values = (row.payload as Group["payload"])?.vehicles; return Array.isArray(values) && values.length ? values.join(", ") : "No vehicles assigned"; } }, { key: "active", label: "Status", render: (row) => row.active ? "Active" : "Inactive" }, { key: "updatedAt", label: "Updated", render: (row) => row.updatedAt ? new Date(String(row.updatedAt)).toLocaleDateString() : "—" }], []);
  function show(row?: DataRow) { const group = row as Group | undefined; setEditing(group ?? null); setName(group?.name ?? ""); setVehicles((group?.payload.vehicles ?? []).join(", ")); setActive(group?.active ?? true); setFormError(""); setOpen(true); }
  async function save(event: FormEvent) {
    event.preventDefault(); if (busy) return; setBusy(true); setFormError("");
    try {
      const response = await fetch(`/api/fleet-records/vehicle-group${editing ? `/${editing.id}` : ""}`, { method: editing ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: name.trim(), active, payload: { vehicles: [...new Set(vehicles.split(/[,;\n]/).map((value) => value.trim()).filter(Boolean))] } }) });
      if (!response.ok) { const body = await response.json().catch(() => null); throw Error(body?.message ?? "The group could not be saved."); }
      setOpen(false); setRevision((value) => value + 1); setNotice("Vehicle group saved.");
    } catch (cause) { setFormError(cause instanceof Error ? cause.message : "The group could not be saved."); }
    finally { setBusy(false); }
  }
  async function remove(row: DataRow) {
    if (!window.confirm(`Delete “${row.name}”? Vehicles remain registered.`)) return;
    try { const response = await fetch(`/api/fleet-records/vehicle-group/${row.id}`, { method: "DELETE" }); if (!response.ok) { const body = await response.json().catch(() => null); throw Error(body?.message ?? "The group could not be deleted."); } setRevision((value) => value + 1); setNotice("Vehicle group deleted."); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The group could not be deleted."); }
  }
  return <>
    <PageHeader page={pageById("groups")!} tenant={false} onRefresh={() => setRevision((value) => value + 1)} actions={canWrite ? <button className="st-button st-primary" onClick={() => show()}><FiPlus />Add group</button> : undefined} />
    {error && <p className="st-error" role="alert">{error}</p>}{notice && <p className={styles.notice} role="status">{notice}</p>}
    <DataTable id="vehicle-groups" endpoint="/api/fleet-records/vehicle-group" columns={columns} scoped={false} refreshKey={revision} onEdit={canWrite ? show : undefined} onDelete={canWrite ? (row) => void remove(row) : undefined} />
    <dialog ref={dialog} className={styles.dialog} onCancel={(event) => { if (busy) event.preventDefault(); else setOpen(false); }} onClose={() => setOpen(false)}>
      <header><h2>{editing ? "Edit vehicle group" : "Add vehicle group"}</h2><button className="st-icon-button" aria-label="Close group form" disabled={busy} onClick={() => setOpen(false)}><FiX /></button></header>
      <form onSubmit={save}><div className={styles.body}>{formError && <p className="st-error" role="alert">{formError}</p>}<div className="st-form-stack"><label className="st-field"><span>Group name</span><input className="st-input" autoFocus required maxLength={200} value={name} onChange={(event) => setName(event.target.value)} /></label><label className="st-field"><span>Vehicle registration numbers</span><textarea className="st-input" rows={4} maxLength={10000} value={vehicles} onChange={(event) => setVehicles(event.target.value)} placeholder="Separate registration numbers with commas or new lines" /></label><label className="st-field"><span>Status</span><select className="st-input" value={active ? "active" : "inactive"} onChange={(event) => setActive(event.target.value === "active")}><option value="active">Active</option><option value="inactive">Inactive</option></select></label></div></div><footer><button type="button" className="st-button" disabled={busy} onClick={() => setOpen(false)}>Close</button><button className="st-button st-primary" disabled={busy}>{busy ? "Saving…" : "Save group"}</button></footer></form>
    </dialog>
  </>;
}

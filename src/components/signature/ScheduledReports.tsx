"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import PageHeader from "./PageHeader";
import DataTable, { type Column } from "./DataTable";
import { pageById } from "./navigation";
import { rowsFrom, type DataRow } from "./data";
import styles from "./ScheduledReports.module.css";
import { FiX } from "react-icons/fi";

type Schedule = DataRow & { id: string; name: string; reportKind: string; reportTitle: string; frequency: string; timeZone: string; nextRunLocal: string; nextRunAt: string | null; periodDays: number; format: string; channel: string; recipients: string[]; active: boolean; version: number };
type Metadata = { reports: { kind: string; title: string; note: string }[]; emailConfigured: boolean; timeZones: string[]; canWrite: boolean };
type Run = { id: string; scheduleId: string; plannedAt: string; status: string; downloadable: boolean; fileName: string; rowCount: number | null; error: string | null };
type Draft = { name: string; reportKind: string; frequency: string; timeZone: string; nextRunLocal: string; periodDays: number; format: string; channel: string; recipients: string; active: boolean };
const dateTime = (value: unknown) => value ? new Date(String(value)).toLocaleString() : "—";
const label = (value: unknown) => String(value ?? "—").toLowerCase().replaceAll("_", " ").replace(/^./, (first) => first.toUpperCase());
async function json<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { cache: "no-store", ...init });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw Error(body?.message ?? "This action could not be completed. Please retry.");
  return body as T;
}
function initial(metadata: Metadata, row?: Schedule | null): Draft {
  const timeZone = row?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const tomorrow = new Date(Date.now() + 86400000);
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(tomorrow).map((part) => [part.type, part.value]));
  return { name: row?.name ?? "", reportKind: row?.reportKind ?? metadata.reports[0]?.kind ?? "", frequency: row?.frequency ?? "WEEKLY", timeZone, nextRunLocal: row?.nextRunLocal?.slice(0, 16) ?? `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`, periodDays: row?.periodDays ?? 7, format: row?.format ?? "xlsx", channel: row?.channel ?? "IN_APP", recipients: row?.recipients.join(", ") ?? "", active: row?.active ?? true };
}
export default function ScheduledReports({ maintenance = false }: { maintenance?: boolean }) {
  const area = maintenance ? "maintenance" : "reports";
  const page = pageById(maintenance ? "maintenance-delivery" : "delivery")!;
  const endpoint = `/api/report-schedules?area=${area}`;
  const [metadata, setMetadata] = useState<Metadata | null>(null), [error, setError] = useState(""), [notice, setNotice] = useState(""), [revision, setRevision] = useState(0), [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Schedule | null>(null), [draft, setDraft] = useState<Draft | null>(null), [saving, setSaving] = useState(false), [formError, setFormError] = useState("");
  const [history, setHistory] = useState<Schedule | null>(null), [runs, setRuns] = useState<Run[]>([]), [runPage, setRunPage] = useState(0), [runPages, setRunPages] = useState(0), [historyError, setHistoryError] = useState(""), [historyLoading, setHistoryLoading] = useState(false), [busy, setBusy] = useState("");
  const [legacy, setLegacy] = useState<DataRow[]>([]), [legacyId, setLegacyId] = useState<string | null>(null);
  const formDialog = useRef<HTMLDialogElement>(null), historyDialog = useRef<HTMLDialogElement>(null);
  const target = useCallback((path: string) => `/api/report-schedules/${path}?area=${area}`, [area]);
  useEffect(() => {
    const controller = new AbortController();
    json<Metadata>(target("metadata"), { signal: controller.signal }).then(setMetadata).catch((cause) => { if (cause.name !== "AbortError") setError(cause.message); });
    if (!maintenance) json<unknown>("/api/fleet-records/report-schedule", { signal: controller.signal }).then((body) => setLegacy(rowsFrom(body))).catch(() => {});
    return () => controller.abort();
  }, [target, maintenance, revision]);
  useEffect(() => { if (draft) formDialog.current?.showModal(); else formDialog.current?.close(); }, [draft]);
  useEffect(() => { if (history) historyDialog.current?.showModal(); else historyDialog.current?.close(); }, [history]);
  useEffect(() => {
    if (!history) return;
    const controller = new AbortController();
    const load = () => { setHistoryLoading(true); json<{ content: Run[]; totalPages: number }>(`${target(`${history.id}/runs`)}&page=${runPage}&size=10`, { signal: controller.signal }).then((body) => { setRuns(body.content); setRunPages(body.totalPages); setHistoryError(""); }).catch((cause) => { if (cause.name !== "AbortError") setHistoryError(cause.message); }).finally(() => { if (!controller.signal.aborted) setHistoryLoading(false); }); };
    load();
    const timer = setInterval(load, 5000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [history, runPage, target]);
  function edit(row?: Schedule, earlier?: DataRow) {
    if (!metadata) return;
    setEditing(row ?? null); setLegacyId(earlier ? String(earlier.id) : null); setFormError(""); setDraft({ ...initial(metadata, row), ...(earlier ? { name: String(earlier.name ?? "") } : {}) });
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (!draft || saving) return; setSaving(true); setFormError("");
    try {
      await json(editing ? target(editing.id) : endpoint, { method: editing ? "PUT" : "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...draft, recipients: draft.recipients.split(/[,;\n]/).map((value) => value.trim()).filter(Boolean), version: editing?.version, legacyRecordId: legacyId }) });
      setDraft(null); setNotice(editing ? "Schedule updated." : "Schedule created."); setRevision((value) => value + 1);
    } catch (cause) { setFormError(cause instanceof Error ? cause.message : "Schedule could not be saved."); }
    finally { setSaving(false); }
  }
  async function run(row: Schedule) {
    setBusy(row.id); setError("");
    try { await json(target(`${row.id}/run`), { method: "POST", headers: { "idempotency-key": crypto.randomUUID() } }); setRuns([]); setRunPage(0); setHistory(row); setRevision((value) => value + 1); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Report could not be queued."); }
    finally { setBusy(""); }
  }
  async function remove(row: DataRow) {
    if (!window.confirm(`Remove “${row.name}”? Existing report files will be retained.`)) return;
    try { const response = await fetch(target(String(row.id)), { method: "DELETE" }); if (!response.ok) { const body = await response.json().catch(() => null); throw Error(body?.message ?? "Schedule could not be removed."); } setRevision((value) => value + 1); setNotice("Schedule removed."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Schedule could not be removed."); }
  }
  const columns: Column[] = useMemo(() => [
    { key: "name", label: "Schedule" }, { key: "reportTitle", label: "Report" }, { key: "frequency", label: "Frequency", render: (row) => label(row.frequency) },
    { key: "nextRunAt", label: "Next run", render: (row) => <span title={String(row.timeZone)}>{dateTime(row.nextRunAt)}</span> },
    { key: "status", label: "Status", render: (row) => row.status === "COMPLETED" ? "Finished" : label(row.status) },
    { key: "lastStatus", label: "Last run", render: (row) => label(row.lastStatus) },
    { key: "actions", label: "Actions", sortable: false, render: (row) => <div className={styles.actions}><button className="st-button" onClick={(event) => { event.stopPropagation(); setRuns([]); setRunPage(0); setHistory(row as Schedule); }}>History</button>{metadata?.canWrite && <button className="st-button" disabled={busy === row.id} onClick={(event) => { event.stopPropagation(); void run(row as Schedule); }}>{busy === row.id ? "Queuing…" : "Run now"}</button>}</div> },
  // Functions operate on the current row and workspace. The table keeps query preferences separately.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [metadata?.canWrite, busy, area]);
  const field = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => current ? { ...current, [key]: value } : current);
  return <>
    <PageHeader page={page} tenant={false} onRefresh={() => { setError(""); setRevision((value) => value + 1); }} actions={metadata?.canWrite ? <button className="st-button st-primary" disabled={!metadata.reports.length} onClick={() => edit()}>Add schedule</button> : undefined} />
    {error && <p role="alert" className="st-error">{error}</p>}{notice && <p role="status" className={styles.notice}>{notice}</p>}
    <section className={styles.info}>Reports use a rolling period ending at the scheduled run. Next run times below use your browser’s time zone; recurrence follows the schedule’s selected time zone.</section>
    {!!legacy.length && <section className={styles.info}><h2>Earlier schedules need setup</h2><p>Choose a report and delivery method before these schedules can run.</p>{legacy.map((row) => <div key={String(row.id)} className={styles.legacy}><span>{String(row.name)}</span>{metadata?.canWrite && <button className="st-button" onClick={() => edit(undefined, row)}>Complete setup</button>}</div>)}</section>}
    <div className={styles.filter}><label>Status <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All schedules</option><option value="ACTIVE">Active</option><option value="PAUSED">Paused</option><option value="COMPLETED">Finished</option><option value="FAILED">Last run failed</option></select></label></div>
    <DataTable id={`${area}-report-schedules`} endpoint={`${endpoint}&status=${status}`} columns={columns} serverPaged scoped={false} refreshKey={revision} onEdit={metadata?.canWrite ? (row) => edit(row as Schedule) : undefined} onDelete={metadata?.canWrite ? (row) => void remove(row) : undefined} detailColumns={[...columns.filter((column) => column.key !== "actions"), { key: "timeZone", label: "Time zone" }, { key: "periodDays", label: "Rolling period (days)", numeric: true }, { key: "format", label: "File format" }, { key: "channel", label: "Delivery", render: (row) => row.channel === "EMAIL" ? "Email and in-app" : "In-app download" }, { key: "recipients", label: "Recipients", render: (row) => Array.isArray(row.recipients) ? row.recipients.join(", ") || "—" : "—" }]} />
    <dialog ref={formDialog} className={styles.dialog} onCancel={(event) => { event.preventDefault(); if (!saving) setDraft(null); }} onClose={() => { if (!saving) setDraft(null); }}>
      <header><h2>{editing ? "Edit schedule" : legacyId ? "Complete schedule setup" : "Add schedule"}</h2><button className="st-icon-button" aria-label="Close schedule form" disabled={saving} onClick={() => setDraft(null)}><FiX /></button></header>
      {draft && <form onSubmit={save}><div className={styles.body}>
        {formError && <p className="st-error" role="alert">{formError}</p>}
        <div className={styles.grid}>
          <label className={styles.wide}>Schedule name<input autoFocus required maxLength={200} value={draft.name} onChange={(event) => field("name", event.target.value)} /></label>
          <label className={styles.wide}>Report<select aria-label="Report" aria-describedby="schedule-report-note" required value={draft.reportKind} onChange={(event) => field("reportKind", event.target.value)}>{metadata?.reports.map((report) => <option key={report.kind} value={report.kind}>{report.title}</option>)}</select><small id="schedule-report-note">{metadata?.reports.find((report) => report.kind === draft.reportKind)?.note}</small></label>
          <label>Frequency<select aria-label="Frequency" value={draft.frequency} onChange={(event) => field("frequency", event.target.value)}>{["ONCE", "DAILY", "WEEKLY", "MONTHLY"].map((frequency) => <option key={frequency} value={frequency}>{label(frequency)}</option>)}</select></label>
          <label>Rolling period (days)<input type="number" required min={1} max={31} value={draft.periodDays} onChange={(event) => field("periodDays", Number(event.target.value))} /></label>
          <label>Next run<input type="datetime-local" required value={draft.nextRunLocal} onChange={(event) => field("nextRunLocal", event.target.value)} /></label>
          <label>Time zone<select aria-label="Time zone" required value={draft.timeZone} onChange={(event) => field("timeZone", event.target.value)}>{metadata?.timeZones.map((zone) => <option key={zone}>{zone}</option>)}</select></label>
          <label>File format<select aria-label="File format" value={draft.format} onChange={(event) => field("format", event.target.value)}><option value="xlsx">Excel (.xlsx)</option><option value="csv">CSV (.csv)</option></select></label>
          <label>Delivery<select aria-label="Delivery" value={draft.channel} onChange={(event) => field("channel", event.target.value)}><option value="IN_APP">In-app download</option><option value="EMAIL" disabled={!metadata?.emailConfigured}>Email and in-app{!metadata?.emailConfigured ? " (not configured)" : ""}</option></select></label>
          {draft.channel === "EMAIL" && <label className={styles.wide}>Recipients<textarea required value={draft.recipients} onChange={(event) => field("recipients", event.target.value)} placeholder="Separate up to 10 email addresses with commas" /></label>}
          <label className={`${styles.check} ${styles.wide}`}><input type="checkbox" checked={draft.active} onChange={(event) => field("active", event.target.checked)} /> Active schedule</label>
        </div>
        <p className={styles.help}>Monthly schedules keep the original day, using the last day in shorter months. Paused schedules can still run manually.</p>
      </div><footer><button type="button" className="st-button" disabled={saving} onClick={() => setDraft(null)}>Close</button><button className="st-button st-primary" disabled={saving}>{saving ? "Saving…" : "Save schedule"}</button></footer></form>}
    </dialog>
    <dialog ref={historyDialog} className={`${styles.dialog} ${styles.history}`} onCancel={() => setHistory(null)} onClose={() => setHistory(null)}>
      <header><div><h2>Execution history</h2><p>{history?.name}</p></div><button className="st-icon-button" aria-label="Close execution history" onClick={() => setHistory(null)}><FiX /></button></header>
      <div className={styles.body}>{historyError && <p role="alert" className="st-error">{historyError}</p>}{historyLoading && !runs.length ? <p role="status">Loading runs…</p> : !runs.length ? <p>No runs yet. Run this schedule now or wait for its next run.</p> : <div className={styles.runList}>{runs.map((run) => <article key={run.id}><div><strong>{label(run.status)}</strong><span>{dateTime(run.plannedAt)}</span><small>{run.rowCount !== null ? `${run.rowCount.toLocaleString()} rows` : ""}</small>{run.error && <p className="st-error">{run.error}</p>}</div>{run.downloadable && <a className="st-button" href={target(`${run.scheduleId}/runs/${run.id}/download`)} download>Download</a>}</article>)}</div>}</div>
      <footer><span>Page {runPage + 1} of {Math.max(1, runPages)}</span><button className="st-button" disabled={runPage === 0 || historyLoading} onClick={() => setRunPage((value) => value - 1)}>Previous</button><button className="st-button" disabled={runPage + 1 >= runPages || historyLoading} onClick={() => setRunPage((value) => value + 1)}>Next</button><button className="st-button" onClick={() => setHistory(null)}>Close</button></footer>
    </dialog>
  </>;
}

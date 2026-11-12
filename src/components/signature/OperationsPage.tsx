"use client";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { FiPlus, FiUpload, FiX, FiDownload } from "react-icons/fi";
import PageHeader from "./PageHeader";
import DataTable, { type Column } from "./DataTable";
import { pageById } from "./navigation";
import { read, rowsFrom, textOf, csvDownload, type DataRow } from "./data";
import { useWorkspace } from "./WorkspaceContext";
import RoleAssignment from "./RoleAssignment";
type Field = {
  key: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
  min: number | null;
  max: number | null;
};
type Schema = {
  id: string;
  nameLabel: string;
  addLabel: string;
  settings: boolean;
  fields: Field[];
  columns: { key: string; label: string; numeric: boolean }[];
};
type Values = Record<string, string | boolean>;
const MODULES = new Set([
  "sims",
  "job-cards",
  "downtime",
  "faults",
  "parts",
  "fuel-cards",
  "calibration",
  "camera-data",
  "storage",
  "maintenance-settings",
  "fuel-rules",
  "video-rules",
  "roles",
  "modules",
]);
export function isOperationsPage(id: string) {
  return MODULES.has(id);
}
function localTime(value: unknown) {
  if (!value) return "";
  const date = new Date(String(value));
  return Number.isFinite(date.getTime())
    ? new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16)
    : "";
}
function initial(schema: Schema, row?: DataRow | null): Values {
  const payload = row?.payload as DataRow | undefined;
  return {
    name: textOf(row?.name, schema.settings ? "Service defaults" : ""),
    ...Object.fromEntries(
      schema.fields.map((field) => {
        const value = payload?.[field.key];
        return [
          field.key,
          field.type === "checkbox"
            ? value === true
            : field.type === "datetime-local"
              ? localTime(value)
              : field.type === "calibration" && Array.isArray(value)
                ? value
                    .map((point) => (point as unknown[]).join(", "))
                    .join("\n")
                : textOf(
                    value,
                    field.type === "select" ? field.options[0] : "",
                  ),
        ];
      }),
    ),
  };
}
function requestBody(schema: Schema, values: Values) {
  const payload: DataRow = {};
  schema.fields.forEach((field) => {
    const value = values[field.key];
    if (value === "" || value === undefined) return;
    payload[field.key] =
      field.type === "number"
        ? Number(value)
        : field.type === "checkbox"
          ? Boolean(value)
          : field.type === "datetime-local"
            ? new Date(String(value)).toISOString()
            : field.type === "calibration"
              ? String(value)
                  .trim()
                  .split(/\r?\n/)
                  .filter(Boolean)
                  .map((line) =>
                    line.split(/[,;\t]/).map((cell) => Number(cell.trim())),
                  )
              : value;
  });
  return { name: String(values.name).trim(), payload, active: true };
}
function parseCsv(source: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  const text = source.replace(/^\uFEFF/, "");
  for (let index = 0; index < text.length; index++) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index++;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index++;
      row.push(cell);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += character;
  }
  if (quoted) throw Error("The CSV has an unclosed quoted field.");
  row.push(cell);
  if (row.some(Boolean)) rows.push(row);
  return rows;
}
export default function OperationsPage({ id }: { id: string }) {
  const { account, scope, tenants } = useWorkspace();
  const rootModule = ["roles", "modules"].includes(id);
  const area = pageById(id)?.hub ?? id;
  const canWrite =
    (account.moduleAccess?.[area] ?? "WRITE") === "WRITE" &&
    account.roles.some((role) =>
      ["SUPER_ADMIN", "ADMIN", "FLEET_MANAGER"].includes(role),
    );
  const [schema, setSchema] = useState<Schema | null>(null),
    [devices, setDevices] = useState<DataRow[]>([]),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [revision, setRevision] = useState(0),
    [editing, setEditing] = useState<DataRow | null | undefined>(undefined),
    [values, setValues] = useState<Values>({}),
    [saved, setSaved] = useState<Values>({}),
    [settingsRow, setSettingsRow] = useState<DataRow | null>(null),
    [settingsReady, setSettingsReady] = useState(false),
    [saving, setSaving] = useState(false),
    [pendingDelete, setPendingDelete] = useState<DataRow | null>(null),
    [loading, setLoading] = useState(true);
  const dialog = useRef<HTMLElement>(null),
    fileInput = useRef<HTMLInputElement>(null);
  const prefix = rootModule ? "/api/admin/operations" : "/api/operations";
  const base = `${prefix}/${id}`;
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`${prefix}/schema/${id}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw Error("This module could not be loaded.");
        const definition = (await response.json()) as Schema;
        if (controller.signal.aborted) return;
        setSchema(definition);
        if (definition.fields.some((field) => field.type === "device")) {
          const all: DataRow[] = [];
          let page = 0,
            total = 1;
          while (page < total) {
            const response = await fetch(`/api/devices?size=100&page=${page}`, {
              signal: controller.signal,
              cache: "no-store",
            });
            if (!response.ok)
              throw Error("Vehicle choices could not be loaded.");
            const data = await response.json();
            all.push(...rowsFrom(data));
            total = Number(data.totalPages) || 1;
            page++;
          }
          if (!controller.signal.aborted) setDevices(all);
        }
        if (definition.settings) {
          const response = await fetch(base + "?size=1", {
            signal: controller.signal,
            cache: "no-store",
          });
          if (!response.ok) throw Error("Settings could not be loaded.");
          const row = rowsFrom(await response.json())[0] ?? null;
          if (!controller.signal.aborted) {
            setSettingsRow(row);
            const fields = initial(definition, row);
            setValues(fields);
            setSaved(fields);
            setSettingsReady(true);
          }
        }
        if (!controller.signal.aborted) setError("");
      } catch (cause) {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "This module could not be loaded.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [id, base, prefix, revision]);
  useEffect(() => {
    if (editing === undefined) return;
    const previous = document.activeElement as HTMLElement | null;
    const timer = setTimeout(
      () =>
        dialog.current
          ?.querySelector<HTMLElement>("input,select,textarea,button")
          ?.focus(),
      0,
    );
    return () => {
      clearTimeout(timer);
      previous?.focus();
    };
  }, [editing]);
  const columns = useMemo<Column[]>(
    () =>
      schema?.columns.map((column) => ({
        ...column,
        render: (row) => {
          const value = read(row, column.key);
          if (column.key.endsWith(".status"))
            return (
              <span
                className={`st-status ${["ACTIVE", "COMPLETED", "SIGNED_OFF", "REPAIRED", "CLOSED"].includes(String(value)) ? "st-status-moving" : ["OPEN", "IN_PROGRESS", "WARNING", "AWAITING_PARTS"].includes(String(value)) ? "st-status-idle" : String(value) === "CRITICAL" ? "st-status-stopped" : "st-status-inactive"}`}
              >
                {textOf(value).replaceAll("_", " ")}
              </span>
            );
          if (typeof value === "boolean") return value ? "Yes" : "No";
          if (column.numeric && typeof value === "number")
            return value.toLocaleString(undefined, {
              maximumFractionDigits: 2,
            });
          return textOf(value);
        },
      })) ?? [],
    [schema],
  );
  const detailColumns = useMemo<Column[]>(
    () => [
      ...columns,
      ...(schema?.fields
        .filter(
          (field) =>
            !columns.some((column) => column.key === `payload.${field.key}`),
        )
        .map((field) => ({
          key: `payload.${field.key}`,
          label: field.label,
          render: (row: DataRow) => {
            const value = read(row, `payload.${field.key}`);
            if (typeof value === "boolean") return value ? "Yes" : "No";
            if (field.type === "organisation")
              return (
                tenants.find((tenant) => tenant.id === String(value))?.name ??
                textOf(value)
              );
            if (field.type === "device") {
              const device = devices.find(
                (device) => String(device.id) === String(value),
              );
              return device
                ? textOf(device.vehiclePlate, textOf(device.name))
                : textOf(value);
            }
            return typeof value === "object" && value !== null
              ? JSON.stringify(value)
              : textOf(value);
          },
        })) ?? []),
    ],
    [columns, schema, devices, tenants],
  );
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!schema || saving) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const row = schema.settings ? settingsRow : editing;
      const body = requestBody(schema, values);
      const response = await fetch(
        base + (row ? `/${encodeURIComponent(String(row.id))}` : ""),
        {
          method: row ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw Error(data?.message ?? "The record could not be saved.");
      setNotice(schema.settings ? "Defaults saved." : "Record saved.");
      if (schema.settings) {
        setSettingsRow(data);
        setSaved({ ...values });
      } else setEditing(undefined);
      setRevision((value) => value + 1);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "The record could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function remove() {
    if (!pendingDelete || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `${base}/${encodeURIComponent(String(pendingDelete.id))}`,
        { method: "DELETE" },
      );
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw Error(data?.message ?? "The record could not be deleted.");
      setPendingDelete(null);
      setNotice("Record deleted.");
      setRevision((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Deletion failed.");
    } finally {
      setSaving(false);
    }
  }
  async function importFile(file: File) {
    if (!schema) return;
    setSaving(true);
    setError("");
    try {
      const rows = parseCsv(await file.text());
      const headers = rows.shift() ?? [];
      const allowed = ["name", ...schema.fields.map((field) => field.key)];
      if (
        !headers.includes("name") ||
        headers.some((header) => !allowed.includes(header))
      )
        throw Error("Use the CSV template's column names.");
      const batch = rows.map((cells) => {
        const fields = initial(schema);
        headers.forEach(
          (header, index) =>
            (fields[header] =
              schema.fields.find((field) => field.key === header)?.type ===
              "checkbox"
                ? cells[index]?.toLowerCase() === "true"
                : (cells[index] ?? "")),
        );
        return requestBody(schema, fields);
      });
      if (!batch.length || batch.length > 500)
        throw Error("Import 1–500 records at a time.");
      const response = await fetch(`${base}/import`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(batch),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok)
        throw Error(result?.message ?? "Import failed. No rows were saved.");
      setNotice(`${batch.length} records imported.`);
      setRevision((value) => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Import failed.");
    } finally {
      setSaving(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  function edit(row: DataRow | null) {
    if (!schema) return;
    setError("");
    setValues(initial(schema, row));
    setEditing(row);
  }
  function formFields() {
    return (
      schema && (
        <div className="st-form-grid">
          <label className="st-field">
            <span>
              {schema.nameLabel} <span aria-hidden="true">*</span>
            </span>
            <input
              className="st-input"
              name="name"
              value={String(values.name ?? "")}
              maxLength={200}
              required
              disabled={!canWrite || saving}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </label>
          {schema.fields.map((field) => {
            const value = values[field.key] ?? "";
            const props = {
              id: `ops-${id}-${field.key}`,
              name: field.key,
              required: field.required && field.type !== "checkbox",
              disabled: !canWrite || saving,
              onChange: (
                event: React.ChangeEvent<
                  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                >,
              ) =>
                setValues((current) => ({
                  ...current,
                  [field.key]:
                    field.type === "checkbox"
                      ? (event.target as HTMLInputElement).checked
                      : event.target.value,
                })),
            };
            let choices = devices;
            if (id === "calibration")
              choices = choices.filter(
                (device) =>
                  String(device.deviceType).toLowerCase() === "fuel sensor",
              );
            if (["camera-data", "storage", "video-rules"].includes(id))
              choices = choices.filter(
                (device) =>
                  String(device.deviceType).toLowerCase() === "dashcam",
              );
            if (scope !== null)
              choices = choices.filter((device) =>
                scope.includes(String(device.organisationId)),
              );
            return (
              <label
                htmlFor={props.id}
                className={`st-field${["textarea", "calibration"].includes(field.type) ? " st-field-wide" : ""}`}
                key={field.key}
              >
                <span>
                  {field.label}
                  {field.required && field.type !== "checkbox" && (
                    <span aria-hidden="true"> *</span>
                  )}
                </span>
                {["select", "device", "organisation"].includes(field.type) ? (
                  <select {...props} className="st-input" value={String(value)}>
                    {field.type === "organisation" ? (
                      <>
                        <option value="">Choose an account</option>
                        {tenants.map((tenant) => (
                          <option value={tenant.id} key={tenant.id}>
                            {tenant.name}
                          </option>
                        ))}
                      </>
                    ) : field.type === "device" ? (
                      <>
                        <option value="">Choose a vehicle / device</option>
                        {choices.map((device) => (
                          <option
                            value={String(device.id)}
                            key={String(device.id)}
                          >
                            {textOf(device.vehiclePlate ?? device.name)} ·{" "}
                            {textOf(device.imei)}
                          </option>
                        ))}
                      </>
                    ) : (
                      field.options.map((option) => (
                        <option value={option} key={option}>
                          {option.replaceAll("_", " ")}
                        </option>
                      ))
                    )}
                  </select>
                ) : ["textarea", "calibration"].includes(field.type) ? (
                  <>
                    <textarea
                      {...props}
                      className="st-input"
                      rows={field.type === "calibration" ? 6 : 3}
                      value={String(value)}
                    />
                    {field.type === "calibration" && (
                      <small>
                        One raw level, litres pair per line. Points must
                        increase within the sensor range and tank capacity.
                      </small>
                    )}
                  </>
                ) : field.type === "checkbox" ? (
                  <input {...props} type="checkbox" checked={value === true} />
                ) : (
                  <input
                    {...props}
                    className="st-input"
                    type={field.type}
                    min={field.min ?? undefined}
                    max={field.max ?? undefined}
                    step={field.type === "number" ? "any" : undefined}
                    value={String(value)}
                  />
                )}
              </label>
            );
          })}
        </div>
      )
    );
  }
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  return (
    <>
      <PageHeader
        page={pageById(id)!}
        tenant={!schema?.settings}
        onRefresh={() => setRevision((value) => value + 1)}
        actions={
          canWrite &&
          !schema?.settings && (
            <>
              {id === "roles" && <RoleAssignment onNotice={setNotice} />}
              <button
                className="st-button st-primary"
                disabled={!schema || saving}
                onClick={() => edit(null)}
              >
                <FiPlus />
                {schema?.addLabel ?? "Add record"}
              </button>
            </>
          )
        }
      />
      {["fuel-rules", "video-rules"].includes(id) && (
        <p className="st-report-note">
          One policy per device. Changes apply within 15 seconds; deleting a
          policy restores the system defaults.{" "}
          {id === "fuel-rules"
            ? "Fuel-drop flags require review."
            : "Camera event footage remains available when alerts are disabled."}
        </p>
      )}
      {notice && (
        <p className="st-notice" role="status">
          {notice}
        </p>
      )}
      {error && editing === undefined && (
        <div className="st-error" role="alert">
          {error}
          <button
            className="st-link"
            onClick={() => setRevision((value) => value + 1)}
          >
            Retry
          </button>
        </div>
      )}
      {loading && !schema ? (
        <div className="st-card st-empty" role="status">
          Loading workspace…
        </div>
      ) : schema?.settings ? (
        <form onSubmit={save}>
          <fieldset
            disabled={!canWrite || !settingsReady || saving}
            style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
          >
            <section className="st-card">
              <div className="st-card-head">
                <h2>Service defaults</h2>
              </div>
              <div className="st-card-body">{formFields()}</div>
            </section>
          </fieldset>
          <div className="st-savebar">
            <span role="status">
              {dirty ? "Unsaved changes" : "No pending changes"}
            </span>
            <button
              className="st-button"
              type="button"
              disabled={!dirty || saving}
              onClick={() => setValues({ ...saved })}
            >
              Cancel
            </button>
            <button
              className="st-button st-primary"
              type="submit"
              disabled={!canWrite || !settingsReady || saving || !dirty}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      ) : schema ? (
        <>
          <input
            ref={fileInput}
            className="sr-only"
            type="file"
            accept=".csv,text/csv"
            aria-label="Import records CSV"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void importFile(file);
            }}
          />
          <DataTable
            key={`${id}:${revision}`}
            id={id}
            endpoint={base}
            columns={columns}
            detailColumns={detailColumns}
            serverPaged
            scoped={!rootModule}
            onEdit={canWrite ? (row) => edit(row) : undefined}
            onDelete={canWrite ? setPendingDelete : undefined}
            actions={
              canWrite ? (
                <>
                  <button
                    className="st-button st-small"
                    disabled={saving}
                    onClick={() => fileInput.current?.click()}
                  >
                    <FiUpload />
                    Import CSV
                  </button>
                  <button
                    className="st-button st-small"
                    onClick={() =>
                      csvDownload(
                        `${id}-template.csv`,
                        ["name", ...schema.fields.map((field) => field.key)],
                        [],
                      )
                    }
                  >
                    <FiDownload />
                    Template
                  </button>
                </>
              ) : undefined
            }
          />
        </>
      ) : null}
      {editing !== undefined && schema && (
        <div className="st-dialog-backdrop">
          <section
            ref={dialog}
            className="st-dialog st-ops-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={
              editing
                ? `Edit ${schema.nameLabel.toLowerCase()}`
                : schema.addLabel
            }
            onKeyDown={(event) => {
              if (event.key === "Escape" && !saving) {
                event.stopPropagation();
                setEditing(undefined);
              }
              if (event.key === "Tab") {
                const elements = Array.from(
                  event.currentTarget.querySelectorAll<HTMLElement>(
                    "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)",
                  ),
                ).filter((element) => element.offsetParent !== null);
                const first = elements[0],
                  last = elements.at(-1);
                if (event.shiftKey && document.activeElement === first) {
                  event.preventDefault();
                  last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                  event.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            <header>
              <h2>{editing ? "Edit record" : schema.addLabel}</h2>
              <button
                className="st-icon-button"
                disabled={saving}
                aria-label="Close record form"
                onClick={() => setEditing(undefined)}
              >
                <FiX />
              </button>
            </header>
            <form onSubmit={save}>
              <div className="st-dialog-body">
                {error && (
                  <p className="st-error" role="alert">
                    {error}
                  </p>
                )}
                {formFields()}
              </div>
              <footer>
                <button
                  className="st-button"
                  type="button"
                  disabled={saving}
                  onClick={() => setEditing(undefined)}
                >
                  Close
                </button>
                <button
                  className="st-button st-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save record"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
      {pendingDelete && (
        <div className="st-dialog-backdrop">
          <section
            className="st-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Delete record"
          >
            <header>
              <h2>Delete record</h2>
            </header>
            <div className="st-dialog-body">
              <p>
                Delete {textOf(pendingDelete.name)}? This record will be
                removed.
              </p>
              {error && (
                <p className="st-error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <footer>
              <button
                className="st-button"
                disabled={saving}
                autoFocus
                onClick={() => setPendingDelete(null)}
              >
                Cancel
              </button>
              <button
                className="st-button st-primary"
                disabled={saving}
                onClick={() => void remove()}
              >
                {saving ? "Deleting…" : "Delete record"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

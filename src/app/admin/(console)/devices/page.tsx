"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiX, FiTrash2, FiLink, FiSlash, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import { Device } from "@/admin/data/mockData";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Online:     { bg: "#22C55E1a", color: "#22C55E" },
  Offline:    { bg: "rgba(255,255,255,0.06)", color: "#9CA3AF" },
  Unassigned: { bg: "#F59E0B1a", color: "#F59E0B" },
};

const DEVICE_TYPES = ["GPS Tracker", "Dashcam", "Fuel Sensor"] as const;
const FIRMWARE_OPTIONS = ["v4.2.1", "v4.1.0", "v3.8.2", "v2.1.0", "v1.9.0"];

type FormMode = "single" | "bulk";

interface AddDeviceModalProps {
  onClose: () => void;
  onSuccess: (devices: Device[]) => void;
  orgs: { id: string; name: string }[];
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: "#7BBBB8" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {children}
    </select>
  );
}

function AddDeviceModal({ onClose, onSuccess, orgs }: AddDeviceModalProps) {
  const [mode, setMode] = useState<FormMode>("single");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  /* ── Single mode fields ── */
  const [imei, setImei]           = useState("");
  const [type, setType]           = useState<string>("GPS Tracker");
  const [firmware, setFirmware]   = useState("v4.2.1");
  const [simCard, setSimCard]     = useState("");
  const [serialNo, setSerialNo]   = useState("");
  const [assignOrg, setAssignOrg] = useState("");
  const [assignVehicle, setAssignVehicle] = useState("");
  const [notes, setNotes]         = useState("");

  /* ── Bulk mode fields ── */
  const [bulkImeis, setBulkImeis] = useState("");
  const [bulkType, setBulkType]   = useState<string>("GPS Tracker");
  const [bulkFirmware, setBulkFirmware] = useState("v4.2.1");
  const [bulkOrg, setBulkOrg]     = useState("");

  function validateImei(v: string) {
    return /^\d{15}$/.test(v.trim());
  }

  async function handleSingleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validateImei(imei)) { setError("IMEI must be exactly 15 digits."); return; }

    setLoading(true);
    try {
      const resp = await fetch("/api/admin/devices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imeis: [imei.trim()], type, firmware, simCard, serialNo, orgId: assignOrg, vehicle: assignVehicle, notes }),
      });
      if (!resp.ok) {
        const d = await resp.json().catch(() => null) as { message?: string } | null;
        setError(d?.message ?? "Failed to add device.");
        return;
      }
      const org = orgs.find(o => o.id === assignOrg);
      const newDevice: Device = {
        id: `d${Date.now()}`,
        imei: imei.trim(),
        type: type as Device["type"],
        firmware,
        vehicle: assignVehicle || "—",
        orgId: assignOrg || null,
        orgName: org?.name ?? "Unassigned",
        status: "Unassigned",
        lastPing: "Never",
      };
      setSuccess(true);
      onSuccess([newDevice]);
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const lines = bulkImeis.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) { setError("Enter at least one IMEI."); return; }
    const invalid = lines.filter(l => !validateImei(l));
    if (invalid.length > 0) { setError(`Invalid IMEI(s): ${invalid.slice(0, 3).join(", ")}${invalid.length > 3 ? "…" : ""}`); return; }

    setLoading(true);
    try {
      const resp = await fetch("/api/admin/devices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imeis: lines, type: bulkType, firmware: bulkFirmware, orgId: bulkOrg }),
      });
      if (!resp.ok) {
        const d = await resp.json().catch(() => null) as { message?: string } | null;
        setError(d?.message ?? "Failed to add devices.");
        return;
      }
      const org = orgs.find(o => o.id === bulkOrg);
      const newDevices: Device[] = lines.map((im, i) => ({
        id: `d${Date.now()}${i}`,
        imei: im,
        type: bulkType as Device["type"],
        firmware: bulkFirmware,
        vehicle: "—",
        orgId: bulkOrg || null,
        orgName: org?.name ?? "Unassigned",
        status: "Unassigned" as const,
        lastPing: "Never",
      }));
      setSuccess(true);
      onSuccess(newDevices);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-lg rounded-3xl" style={{ background: "#071E1C", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "90vh", overflowY: "auto" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <h2 className="text-base font-bold text-white">Add Device(s)</h2>
            <p className="text-xs mt-0.5" style={{ color: "#4A8A87" }}>Register new hardware to the platform inventory</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "#7BBBB8" }}>
            <FiX size={15} />
          </button>
        </div>

        {success ? (
          <div className="p-8 flex flex-col items-center gap-4 text-center">
            <FiCheckCircle size={40} style={{ color: "#22C55E" }} />
            <div className="text-white font-bold text-base">Device(s) added successfully!</div>
            <p className="text-xs" style={{ color: "#4A8A87" }}>They appear as <strong style={{ color: "#F59E0B" }}>Unassigned</strong> in the table until linked to a vehicle.</p>
            <button onClick={onClose} className="h-9 px-6 rounded-xl text-sm font-bold text-white" style={{ background: "#F97316" }}>Done</button>
          </div>
        ) : (
          <>
            {/* Mode tabs */}
            <div className="flex gap-1 mx-6 mt-5 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.04)", width: "fit-content" }}>
              {(["single", "bulk"] as FormMode[]).map(m => (
                <button key={m} onClick={() => { setMode(m); setError(""); }}
                  className="h-8 px-5 rounded-lg text-xs font-semibold capitalize transition-colors"
                  style={{ background: mode === m ? "#0D4A47" : "transparent", color: mode === m ? "#fff" : "#7BBBB8" }}>
                  {m === "single" ? "Single Device" : "Bulk Import"}
                </button>
              ))}
            </div>

            {error && (
              <div className="mx-6 mt-4 rounded-xl px-4 py-3 text-xs font-semibold" style={{ background: "#EF44441a", color: "#EF4444", border: "1px solid #EF444433" }}>
                {error}
              </div>
            )}

            {/* ── SINGLE FORM ── */}
            {mode === "single" && (
              <form onSubmit={handleSingleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Field label="IMEI Number *">
                      <Input required placeholder="352749081299010" value={imei} onChange={e => setImei(e.target.value)} maxLength={15} />
                    </Field>
                  </div>
                  <Field label="Device Type *">
                    <Select value={type} onChange={e => setType(e.target.value)}>
                      {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </Field>
                  <Field label="Firmware Version">
                    <Select value={firmware} onChange={e => setFirmware(e.target.value)}>
                      {FIRMWARE_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </Select>
                  </Field>
                  <Field label="SIM Card Number">
                    <Input placeholder="e.g. 08012345678" value={simCard} onChange={e => setSimCard(e.target.value)} />
                  </Field>
                  <Field label="Serial Number">
                    <Input placeholder="e.g. SN-00123456" value={serialNo} onChange={e => setSerialNo(e.target.value)} />
                  </Field>
                </div>

                <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "1rem" }}>
                  <div className="text-xs font-bold mb-3" style={{ color: "#4A8A87" }}>ASSIGNMENT (optional — can be done later)</div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Assign to Organisation">
                      <Select value={assignOrg} onChange={e => setAssignOrg(e.target.value)}>
                        <option value="">— Unassigned —</option>
                        {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </Select>
                    </Field>
                    <Field label="Vehicle Plate / Name">
                      <Input placeholder="e.g. LAS-001-AA" value={assignVehicle} onChange={e => setAssignVehicle(e.target.value)} />
                    </Field>
                  </div>
                </div>

                <Field label="Notes">
                  <textarea
                    rows={2}
                    placeholder="Any additional notes about this device…"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", resize: "none" }}
                  />
                </Field>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl text-sm font-semibold" style={{ background: "rgba(255,255,255,0.06)", color: "#9CA3AF" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 h-10 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                    style={{ background: "#F97316" }}>
                    {loading ? "Adding…" : "Add Device"}
                  </button>
                </div>
              </form>
            )}

            {/* ── BULK FORM ── */}
            {mode === "bulk" && (
              <form onSubmit={handleBulkSubmit} className="p-6 space-y-4">
                <Field label="IMEI Numbers — one per line *">
                  <textarea
                    rows={7}
                    required
                    value={bulkImeis}
                    onChange={e => setBulkImeis(e.target.value)}
                    placeholder={"352749081299010\n352749081299011\n352749081299012"}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none font-mono"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", resize: "vertical" }}
                  />
                  <div className="mt-1 text-[10px]" style={{ color: "#4A8A87" }}>
                    {bulkImeis.split("\n").filter(l => l.trim()).length} IMEI(s) entered
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Device Type">
                    <Select value={bulkType} onChange={e => setBulkType(e.target.value)}>
                      {DEVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </Field>
                  <Field label="Firmware Version">
                    <Select value={bulkFirmware} onChange={e => setBulkFirmware(e.target.value)}>
                      {FIRMWARE_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                    </Select>
                  </Field>
                </div>

                <Field label="Assign all to Organisation (optional)">
                  <Select value={bulkOrg} onChange={e => setBulkOrg(e.target.value)}>
                    <option value="">— Unassigned —</option>
                    {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </Select>
                </Field>

                <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "rgba(249,115,22,0.08)", border: "1px solid rgba(249,115,22,0.2)", color: "#F97316" }}>
                  All devices will be added as <strong>Unassigned</strong> unless an organisation is selected. Vehicle assignment must be done individually after import.
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl text-sm font-semibold" style={{ background: "rgba(255,255,255,0.06)", color: "#9CA3AF" }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={loading}
                    className="flex-1 h-10 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                    style={{ background: "#F97316" }}>
                    {loading ? "Importing…" : `Import ${bulkImeis.split("\n").filter(l => l.trim()).length || 0} Device(s)`}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

type DeviceEx = Device & { ownerId?: string | null; ownerName?: string | null };

// Map backend AdminDeviceDto → local Device shape
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromApiDto(d: any): DeviceEx {
  return {
    id: d.id,
    imei: d.imei ?? d.name ?? "—",
    type: (d.deviceType as Device["type"]) ?? "GPS Tracker",
    firmware: d.firmware ?? "—",
    vehicle: d.vehiclePlate ?? "—",
    orgId: d.organisationId ?? null,
    orgName: d.organisationName ?? (d.organisationId ? d.organisationId : "—"),
    ownerId: d.ownerId ?? null,
    ownerName: d.ownerName ?? null,
    status: (d.status === "Assigned" ? "Online" : d.status) as Device["status"],
    lastPing: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "Never",
  };
}

export default function DeviceManagerPage() {
  const [devices, setDevices] = useState<DeviceEx[]>([]);
  const [orgs, setOrgs] = useState<{ id: string; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: string; displayName: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiAvailable, setApiAvailable] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignMode, setAssignMode] = useState<Record<string, "org" | "user">>({});

  async function loadDevices() {
    setLoading(true);
    try {
      const [dRes, oRes, uRes] = await Promise.allSettled([
        fetch("/api/admin/devices?size=500"),
        fetch("/api/admin/organisations?size=100"),
        fetch("/api/admin/users?size=200"),
      ]);
      if (dRes.status === "fulfilled" && dRes.value.ok) {
        const data = await dRes.value.json();
        const list = data?.content ?? data ?? [];
        setDevices(Array.isArray(list) ? list.map(fromApiDto) : []);
        setApiAvailable(true);
      }
      if (oRes.status === "fulfilled" && oRes.value.ok) {
        const data = await oRes.value.json();
        setOrgs((data?.content ?? data ?? []).map((o: { id: string; name: string }) => ({ id: o.id, name: o.name })));
      }
      if (uRes.status === "fulfilled" && uRes.value.ok) {
        const data = await uRes.value.json();
        setUsers((data?.content ?? data ?? []).map((u: { id: string; displayName: string; email: string }) => ({ id: u.id, displayName: u.displayName, email: u.email })));
      }
    } catch {
      // silently stay empty
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDevices(); }, []);

  const filtered = devices.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = d.imei.includes(q) || d.vehicle.toLowerCase().includes(q) || d.orgName.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All" || d.status === filterStatus;
    return matchSearch && matchStatus;
  });

  function handleSuccess(newDevices: Device[]) {
    if (apiAvailable) {
      loadDevices();
    } else {
      setDevices(prev => [...newDevices, ...prev]);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this device from inventory?")) return;
    if (apiAvailable) {
      await fetch(`/api/admin/devices/${id}`, { method: "DELETE" });
      setDevices(prev => prev.filter(d => d.id !== id));
    } else {
      setDevices(prev => prev.filter(d => d.id !== id));
    }
  }

  async function handleUnassign(id: string) {
    if (apiAvailable) {
      setAssigningId(id);
      try {
        const res = await fetch(`/api/admin/devices/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({}),
        });
        if (res.ok) await loadDevices();
      } finally {
        setAssigningId(null);
      }
    } else {
      setDevices(prev => prev.map(d => d.id === id ? { ...d, orgId: null, orgName: "—", vehicle: "—", status: "Unassigned" } : d));
    }
  }

  async function handleAssign(id: string, orgId: string) {
    if (apiAvailable) {
      setAssigningId(id);
      try {
        const res = await fetch(`/api/admin/devices/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ organisationId: orgId }),
        });
        if (res.ok) await loadDevices();
      } finally {
        setAssigningId(null);
      }
    }
  }

  async function handleAssignUser(id: string, userId: string) {
    if (apiAvailable) {
      setAssigningId(id);
      try {
        const res = await fetch(`/api/admin/devices/${id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        if (res.ok) await loadDevices();
      } finally {
        setAssigningId(null);
      }
    }
  }

  return (
    <div className="space-y-4">
      {showModal && (
        <AddDeviceModal
          onClose={() => setShowModal(false)}
          onSuccess={(d) => { handleSuccess(d); setShowModal(false); }}
          orgs={orgs}
        />
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4A8A87" }} />
          <input
            placeholder="Search by IMEI, vehicle, org…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </div>
        {["All", "Online", "Offline", "Unassigned"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="h-9 px-3 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: filterStatus === s ? "#0D4A47" : "rgba(255,255,255,0.06)", color: filterStatus === s ? "#fff" : "#7BBBB8" }}>
            {s}
          </button>
        ))}

        {/* Stats pills + API indicator */}
        <div className="flex gap-2 ml-auto items-center">
          <span className="hidden sm:flex items-center gap-1 text-[10px] px-2 h-6 rounded-lg font-semibold"
            style={{ background: apiAvailable ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", color: apiAvailable ? "#22C55E" : "#F59E0B" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: apiAvailable ? "#22C55E" : "#F59E0B" }} />
            {apiAvailable ? "Live" : "Demo"}
          </span>
          {[
            { label: "Online", color: "#22C55E" },
            { label: "Offline", color: "#9CA3AF" },
            { label: "Unassigned", color: "#F59E0B" },
          ].map(({ label, color }) => (
            <span key={label} className="hidden sm:flex items-center gap-1.5 text-[10px] font-semibold px-2 h-7 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
              {devices.filter(d => d.status === label).length} {label}
            </span>
          ))}
          <button onClick={loadDevices} title="Refresh"
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10"
            style={{ color: "#7BBBB8" }}>
            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-white"
          style={{ background: "#F97316" }}>
          <FiPlus size={13} /> Add Device(s)
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
                {["IMEI", "Type", "Firmware", "Assigned Vehicle", "Organisation", "Owner", "Status", "Last Ping", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-xs" style={{ color: "#4A8A87" }}>
                    No devices match your search.
                  </td>
                </tr>
              ) : filtered.map(d => {
                const sc = STATUS_COLORS[d.status] ?? STATUS_COLORS.Offline;
                return (
                  <tr key={d.id} className="hover:bg-white/[0.03] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-4 py-3 font-mono text-white">{d.imei}</td>
                    <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{d.type}</td>
                    <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{d.firmware}</td>
                    <td className="px-4 py-3 text-white">{d.vehicle}</td>
                    <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{d.orgName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: sc.bg, color: sc.color }}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{d.ownerName ?? "—"}</td>
                    <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{d.lastPing}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {(d.orgId || d.ownerId) ? (
                          <button
                            title="Unassign"
                            disabled={assigningId === d.id}
                            onClick={() => handleUnassign(d.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-40"
                            style={{ color: "#F59E0B" }}>
                            <FiSlash size={12} />
                          </button>
                        ) : (
                          <div className="flex items-center gap-1">
                            {/* Toggle assign mode */}
                            <button
                              title={assignMode[d.id] === "user" ? "Switch to org" : "Switch to user"}
                              onClick={() => setAssignMode(m => ({ ...m, [d.id]: m[d.id] === "user" ? "org" : "user" }))}
                              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-[9px] font-bold"
                              style={{ color: "#7BBBB8", border: "1px solid rgba(255,255,255,0.1)" }}>
                              {assignMode[d.id] === "user" ? "U" : "O"}
                            </button>
                            {assignMode[d.id] === "user" ? (
                              <select
                                disabled={assigningId === d.id}
                                defaultValue=""
                                onChange={e => e.target.value && handleAssignUser(d.id, e.target.value)}
                                className="h-7 rounded-lg text-[10px] px-1 outline-none disabled:opacity-40"
                                style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", color: "#818CF8" }}
                                title="Assign to user">
                                <option value="">→ User…</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.displayName} ({u.email})</option>)}
                              </select>
                            ) : (
                              <select
                                disabled={assigningId === d.id}
                                defaultValue=""
                                onChange={e => e.target.value && handleAssign(d.id, e.target.value)}
                                className="h-7 rounded-lg text-[10px] px-1 outline-none disabled:opacity-40"
                                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22C55E" }}
                                title="Assign to organisation">
                                <option value="">→ Org…</option>
                                {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                              </select>
                            )}
                          </div>
                        )}
                        <button
                          title="Delete device"
                          onClick={() => handleDelete(d.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                          style={{ color: "#EF4444" }}>
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs flex items-center justify-between" style={{ color: "#4A8A87", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span>{filtered.length} of {devices.length} devices</span>
          <span>{devices.filter(d => d.status === "Unassigned").length} unassigned</span>
        </div>
      </div>
    </div>
  );
}

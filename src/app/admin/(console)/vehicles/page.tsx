"use client";

import { useState, useEffect, useMemo } from "react";
import { FiSearch, FiX, FiRefreshCw, FiCpu } from "react-icons/fi";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Moving:     { bg: "#22C55E1a", color: "#22C55E" },
  Idle:       { bg: "#F59E0B1a", color: "#F59E0B" },
  Stopped:    { bg: "#F974161a", color: "#F97316" },
  Offline:    { bg: "rgba(255,255,255,0.06)", color: "#9CA3AF" },
  Assigned:   { bg: "#22C55E1a", color: "#22C55E" },
  Unassigned: { bg: "#F59E0B1a", color: "#F59E0B" },
  Online:     { bg: "#22C55E1a", color: "#22C55E" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VehicleRow = Record<string, any>;

// Derive a "vehicle" view from an AdminDeviceDto
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toVehicle(d: any): VehicleRow {
  return {
    id: d.id,
    plate: d.vehiclePlate ?? d.imei ?? "—",
    orgId: d.organisationId ?? null,
    orgName: d.organisationName ?? "—",
    driver: d.ownerName ?? "—",
    status: d.status ?? "Offline",
    imei: d.imei ?? "—",
    deviceType: d.deviceType ?? "GPS Tracker",
    firmware: d.firmware ?? "—",
    lastSeen: d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—",
  };
}

export default function GlobalVehiclesPage() {
  const [devices, setDevices]   = useState<VehicleRow[]>([]);
  const [orgs, setOrgs]         = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterOrg, setFilterOrg] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selected, setSelected] = useState<VehicleRow | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [dRes, oRes] = await Promise.allSettled([
        fetch("/api/admin/devices?size=500"),
        fetch("/api/admin/organisations?size=100"),
      ]);
      if (dRes.status === "fulfilled" && dRes.value.ok) {
        const data = await dRes.value.json();
        const list: VehicleRow[] = (data?.content ?? data ?? []).map(toVehicle);
        setDevices(list);
      }
      if (oRes.status === "fulfilled" && oRes.value.ok) {
        const data = await oRes.value.json();
        setOrgs((data?.content ?? data ?? []).map((o: { id: string; name: string }) => ({ id: o.id, name: o.name })));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Only show devices that have a vehicle plate ("assigned" vehicles)
  const vehicles = useMemo(() =>
    devices.filter(d => d.plate && d.plate !== d.imei && d.plate !== "—"),
  [devices]);

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = v.plate.toLowerCase().includes(q) || v.driver.toLowerCase().includes(q) || v.imei.includes(q) || v.orgName.toLowerCase().includes(q);
    const matchOrg = filterOrg === "All" || v.orgId === filterOrg;
    const matchStatus = filterStatus === "All" || v.status === filterStatus;
    return matchSearch && matchOrg && matchStatus;
  });

  return (
    <div className="flex gap-5 h-full">
      <div className="flex-1 min-w-0 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4A8A87" }} />
            <input placeholder="Search by plate, driver, IMEI…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-9 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }} />
          </div>
          <select value={filterOrg} onChange={e => setFilterOrg(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <option value="All">All Organisations</option>
            {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          {["All", "Assigned", "Online", "Offline", "Unassigned"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="h-9 px-3 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap"
              style={{ background: filterStatus === s ? "#0D4A47" : "rgba(255,255,255,0.06)", color: filterStatus === s ? "#fff" : "#7BBBB8" }}>
              {s}
            </button>
          ))}
          <button onClick={load} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10" style={{ color: "#7BBBB8" }}>
            <FiRefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
                  {["Plate Number", "Organisation", "Driver", "Status", "IMEI", "Device Type", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: "#4A8A87" }}>Loading vehicles…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-center" style={{ color: "#4A8A87" }}>
                    {vehicles.length === 0 ? "No vehicles with assigned plates found" : "No vehicles match your filter"}
                  </td></tr>
                ) : filtered.map(v => {
                  const sc = STATUS_COLORS[v.status] ?? STATUS_COLORS.Offline;
                  return (
                    <tr key={v.id} className="hover:bg-white/[0.03] cursor-pointer transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      onClick={() => setSelected(v)}>
                      <td className="px-4 py-3 text-white font-semibold">{v.plate}</td>
                      <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{v.orgName}</td>
                      <td className="px-4 py-3 text-white">{v.driver}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: sc.bg, color: sc.color }}>{v.status}</span>
                      </td>
                      <td className="px-4 py-3 font-mono" style={{ color: "#4A8A87" }}>{v.imei}</td>
                      <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{v.deviceType}</td>
                      <td className="px-4 py-3">
                        <button className="text-[10px] font-semibold px-2 py-1 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "#7BBBB8" }}>Details</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 text-xs" style={{ color: "#4A8A87", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {filtered.length} of {vehicles.length} vehicles
          </div>
        </div>
      </div>

      {/* Slide-over panel */}
      {selected && (
        <div className="w-72 flex-shrink-0 rounded-2xl p-5 space-y-4" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white">{selected.plate}</div>
            <button onClick={() => setSelected(null)} style={{ color: "#7BBBB8" }}><FiX size={15} /></button>
          </div>
          <div className="rounded-xl flex items-center justify-center gap-2 text-xs font-semibold"
            style={{ height: 100, background: "rgba(13,74,71,0.4)", border: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
            <FiCpu size={16} />
            {selected.status} — {selected.deviceType}
          </div>
          <div className="space-y-2.5">
            {[
              { label: "Organisation", value: selected.orgName },
              { label: "Driver", value: selected.driver },
              { label: "Status", value: selected.status },
              { label: "IMEI", value: selected.imei },
              { label: "Device Type", value: selected.deviceType },
              { label: "Firmware", value: selected.firmware },
              { label: "Added", value: selected.lastSeen },
            ].map(r => (
              <div key={r.label} className="flex justify-between text-xs">
                <span style={{ color: "#4A8A87" }}>{r.label}</span>
                <span className="text-white font-medium">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

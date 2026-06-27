"use client";
import { useState, useRef } from "react";

const VEHICLE_ICONS = [
  { label: "Truck", svg: <svg viewBox="0 0 36 20" fill="none" className="w-8 h-5"><rect x="1" y="4" width="22" height="12" rx="2" fill="#3b82f6"/><rect x="23" y="7" width="10" height="9" rx="1.5" fill="#60a5fa"/><circle cx="7" cy="17" r="2.5" fill="#1e3a5f"/><circle cx="27" cy="17" r="2.5" fill="#1e3a5f"/></svg> },
  { label: "Van",   svg: <svg viewBox="0 0 36 20" fill="none" className="w-8 h-5"><rect x="1" y="5" width="32" height="11" rx="2" fill="#10b981"/><rect x="2" y="6" width="14" height="6" rx="1" fill="#6ee7b7"/><circle cx="8" cy="17" r="2.5" fill="#065f46"/><circle cx="28" cy="17" r="2.5" fill="#065f46"/></svg> },
  { label: "Car",   svg: <svg viewBox="0 0 36 20" fill="none" className="w-8 h-5"><rect x="4" y="7" width="28" height="9" rx="2" fill="#f59e0b"/><rect x="8" y="5" width="18" height="6" rx="1.5" fill="#fcd34d"/><circle cx="10" cy="17" r="2.5" fill="#78350f"/><circle cx="26" cy="17" r="2.5" fill="#78350f"/></svg> },
  { label: "Bus",   svg: <svg viewBox="0 0 36 20" fill="none" className="w-8 h-5"><rect x="1" y="3" width="34" height="13" rx="2" fill="#8b5cf6"/><rect x="3" y="5" width="6" height="5" rx="1" fill="#c4b5fd"/><rect x="11" y="5" width="6" height="5" rx="1" fill="#c4b5fd"/><circle cx="8" cy="17" r="2.5" fill="#4c1d95"/><circle cx="28" cy="17" r="2.5" fill="#4c1d95"/></svg> },
];

const VEHICLE_TYPES = ["HCV", "LCV", "Sedan", "SUV", "Bus", "Motorcycle", "Other"];
const FUEL_TYPES = ["Petrol", "Diesel", "Electric", "CNG", "Hybrid"];

const EMPTY_FORM = { reg: "", icon: 0, displayName: "", odometer: "", make: "", year: "", vehicleType: "", vin: "", fuelType: "", mileage: "", color: "#3949ab" };

function AddVehicleModal({ onClose, onAdd }: { onClose: () => void; onAdd: (v: typeof EMPTY_FORM) => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<{ reg?: string }>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof typeof EMPTY_FORM, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.reg.trim()) { setErrors({ reg: "Registration number is required" }); return; }
    onAdd(form);
    onClose();
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={(e) => e.target === overlayRef.current && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add Vehicle</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Registration Number */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Registration Number <span className="text-red-500">*</span></label>
            <input value={form.reg} onChange={(e) => { set("reg", e.target.value); setErrors({}); }}
              placeholder="Enter Registration Number"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3949ab]/30 ${errors.reg ? "border-red-400" : "border-gray-200"}`} />
            {errors.reg && <p className="mt-1 text-xs text-red-500">{errors.reg}</p>}
          </div>

          {/* Vehicle Icon */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Choose Vehicle Icon</label>
            <div className="flex gap-3">
              {VEHICLE_ICONS.map((ic, idx) => (
                <button key={ic.label} type="button" onClick={() => set("icon", idx)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 transition-all ${form.icon === idx ? "border-[#3949ab] bg-[#e8eaf6]" : "border-gray-200 hover:border-[#3949ab]/40"}`}>
                  {ic.svg}
                  <span className="text-[10px] text-gray-500">{ic.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Display Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Display Number</label>
            <input value={form.displayName} onChange={(e) => set("displayName", e.target.value)}
              placeholder="Enter Display Number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3949ab]/30" />
          </div>

          {/* Odometer */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Odometer Reading</label>
            <input value={form.odometer} onChange={(e) => set("odometer", e.target.value)}
              placeholder="Enter Odometer Reading"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3949ab]/30" />
          </div>

          {/* Make */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Make</label>
            <input value={form.make} onChange={(e) => set("make", e.target.value)}
              placeholder="Enter Vehicle Make"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3949ab]/30" />
          </div>

          {/* Model Year */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Model Year</label>
            <input value={form.year} onChange={(e) => set("year", e.target.value)}
              placeholder="Model Year" type="number" min="1990" max="2030"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3949ab]/30" />
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicle Type</label>
            <select value={form.vehicleType} onChange={(e) => set("vehicleType", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3949ab]/30 bg-white text-gray-500">
              <option value="">Choose from the below</option>
              {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* VIN */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">VIN / Chassis Number</label>
            <input value={form.vin} onChange={(e) => set("vin", e.target.value)}
              placeholder="Identification Number / Chassis Number"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3949ab]/30" />
          </div>

          {/* Divider */}
          <div className="sm:col-span-2 border-t border-gray-100 pt-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fuel Type &amp; Expected Mileage</p>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Fuel Type</label>
            <select value={form.fuelType} onChange={(e) => set("fuelType", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3949ab]/30 bg-white text-gray-500">
              <option value="">Fuel Type</option>
              {FUEL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Expected Mileage</label>
            <div className="flex items-center gap-2">
              <input value={form.mileage} onChange={(e) => set("mileage", e.target.value)}
                placeholder="Expected Mileage" type="number" min="0"
                className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3949ab]/30" />
              <span className="text-sm text-gray-500 shrink-0">km/L</span>
            </div>
          </div>

          {/* Vehicle Color */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Vehicle Color</label>
            <div className="flex items-center gap-3">
              {["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#1e293b"].map((c) => (
                <button key={c} type="button" onClick={() => set("color", c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? "border-gray-800 scale-110" : "border-transparent"}`}
                  style={{ background: c }} />
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="color" value={form.color} onChange={(e) => set("color", e.target.value)} className="sr-only" />
                <span className="w-7 h-7 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs hover:border-[#3949ab]"
                  style={{ background: !["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#1e293b"].includes(form.color) ? form.color : "transparent" }}>
                  {["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#1e293b"].includes(form.color) ? "+" : ""}
                </span>
                <span className="text-xs text-gray-500">Pick Custom Color</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#3949ab" }}>
              Add Vehicle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const MOCK_VEHICLES = [
  { id: 1, displayName: "R7_Binder Singh_PB10...", reg: "PB10GK1292", odometer: "Not Added", make: "N/A", year: "N/A", vin: "N/A" },
  { id: 2, displayName: "Truck 12", reg: "PB10GK1234", odometer: "45,200 km", make: "Tata", year: "2021", vin: "1HGBH41JXMN109186" },
  { id: 3, displayName: "Van 3", reg: "PB07CA5678", odometer: "22,100 km", make: "Mahindra", year: "2022", vin: "2T1BURHE0JC034781" },
  { id: 4, displayName: "Car 5", reg: "PB08AB9012", odometer: "11,300 km", make: "Maruti", year: "2020", vin: "3VWFE21C04M000001" },
];

const PAGE_SIZE = 10;

export default function VehicleDirectoryPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);

  const handleAdd = (form: typeof EMPTY_FORM) => {
    setVehicles((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        displayName: form.displayName || form.reg,
        reg: form.reg,
        odometer: form.odometer || "Not Added",
        make: form.make || "N/A",
        year: form.year || "N/A",
        vin: form.vin || "N/A",
      },
    ]);
  };

  const filtered = vehicles.filter(
    (v) =>
      v.displayName.toLowerCase().includes(search.toLowerCase()) ||
      v.reg.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: number) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () =>
    setSelected(selected.length === paged.length ? [] : paged.map((v) => v.id));

  return (
    <div className="p-6 flex flex-col gap-4">
      {showModal && <AddVehicleModal onClose={() => setShowModal(false)} onAdd={handleAdd} />}
      {/* Header */}
      <div>
        <p className="text-xs text-muted">Vehicles</p>
        <h1 className="text-xl font-bold text-foreground">Vehicle Directory</h1>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg border border-divider bg-surface px-3 py-2 w-60">
          <svg className="w-4 h-4 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search Vehicle"
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted text-foreground"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Filter icon */}
          <button className="flex items-center gap-1.5 rounded-lg border border-divider bg-surface px-3 py-2 text-sm text-foreground hover:bg-divider">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M3 6h18M7 12h10M11 18h2" />
            </svg>
          </button>

          {/* Bulk Action */}
          <button className="flex items-center gap-1.5 rounded-lg border border-divider bg-surface px-3 py-2 text-sm text-foreground hover:bg-divider">
            Bulk Action
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
            </svg>
          </button>

          {/* Add Vehicle */}
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: '#3949ab' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Vehicle
          </button>

          {/* Download */}
          <button className="flex items-center rounded-lg border border-divider bg-surface p-2 hover:bg-divider">
            <svg className="w-4 h-4 text-foreground" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-divider bg-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-divider bg-[#f5f7fa]">
              <th className="px-4 py-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={selected.length === paged.length && paged.length > 0}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-muted whitespace-nowrap">Display Number</th>
              <th className="px-4 py-3 text-left font-semibold text-muted whitespace-nowrap">Registration number</th>
              <th className="px-4 py-3 text-left font-semibold text-muted whitespace-nowrap">Vehicle Icon</th>
              <th className="px-4 py-3 text-left font-semibold text-muted whitespace-nowrap">Vehicle Odometer<br />Reading</th>
              <th className="px-4 py-3 text-left font-semibold text-muted whitespace-nowrap">Vehicle Make</th>
              <th className="px-4 py-3 text-left font-semibold text-muted whitespace-nowrap">Model Year</th>
              <th className="px-4 py-3 text-left font-semibold text-muted whitespace-nowrap">VIN / Cl</th>
              <th className="px-4 py-3 text-left font-semibold text-muted whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted text-sm">No vehicles found.</td>
              </tr>
            ) : (
              paged.map((v, i) => (
                <tr key={v.id} className={`border-b border-divider last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-[#fafbfc]"} hover:bg-[#f0f4ff] transition-colors`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(v.id)}
                      onChange={() => toggleSelect(v.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{v.displayName}</td>
                  <td className="px-4 py-3 text-foreground whitespace-nowrap">{v.reg}</td>
                  <td className="px-4 py-3">
                    {/* Vehicle icon — a small coloured truck SVG */}
                    <span className="inline-flex items-center justify-center w-9 h-6 rounded" style={{ background: '#e3f0fd' }}>
                      <svg className="w-6 h-4" viewBox="0 0 36 20" fill="none">
                        <rect x="1" y="4" width="22" height="12" rx="2" fill="#3b82f6" />
                        <rect x="23" y="7" width="10" height="9" rx="1.5" fill="#60a5fa" />
                        <rect x="24" y="8" width="8" height="5" rx="1" fill="#bfdbfe" />
                        <circle cx="7" cy="17" r="2.5" fill="#1e3a5f" />
                        <circle cx="7" cy="17" r="1" fill="#93c5fd" />
                        <circle cx="27" cy="17" r="2.5" fill="#1e3a5f" />
                        <circle cx="27" cy="17" r="1" fill="#93c5fd" />
                      </svg>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{v.odometer}</td>
                  <td className="px-4 py-3 text-muted">{v.make}</td>
                  <td className="px-4 py-3 text-muted">{v.year}</td>
                  <td className="px-4 py-3 text-muted">{v.vin === "N/A" ? "N/A" : v.vin.slice(0, 8) + "..."}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded hover:bg-[#e8f0fe] text-muted hover:text-[#3949ab] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="p-1.5 rounded hover:bg-[#e8f0fe] text-muted hover:text-[#3949ab] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2 text-sm text-muted">
        <span>Showing {filtered.length === 0 ? "0" : `${(page - 1) * PAGE_SIZE + 1} - ${Math.min(page * PAGE_SIZE, filtered.length)}`} of {filtered.length}</span>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="p-1.5 rounded border border-divider hover:bg-divider disabled:opacity-40"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <span className="px-2 py-1 rounded border border-divider text-foreground">{page}</span>
        <span>/ {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="p-1.5 rounded border border-divider hover:bg-divider disabled:opacity-40"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="m9 18 6-6-6-6" /></svg>
        </button>
      </div>
    </div>
  );
}

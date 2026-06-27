"use client";
import { useState } from "react";

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

  const filtered = MOCK_VEHICLES.filter(
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
          <button className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: '#3949ab' }}>
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

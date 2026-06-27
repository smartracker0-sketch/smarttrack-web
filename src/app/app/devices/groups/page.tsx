"use client";
import { useState, useRef } from "react";

type Group = { id: number; name: string; vehicles: string };

const MOCK_GROUPS: Group[] = [
  { id: 1, name: "route no. 7(khanna route)", vehicles: "R7_Binder Singh_PB10GK1292" },
  { id: 2, name: "North Zone", vehicles: "Truck 12, Van 3" },
  { id: 3, name: "South Zone", vehicles: "Car 5" },
];

const PAGE_SIZE = 10;

function GroupFormModal({
  initial,
  title,
  onClose,
  onSave,
}: {
  initial: { name: string; vehicles: string };
  title: string;
  onClose: () => void;
  onSave: (data: { name: string; vehicles: string }) => void;
}) {
  const [name, setName] = useState(initial.name);
  const [vehicles, setVehicles] = useState(initial.vehicles);
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Group name is required"); return; }
    onSave({ name, vehicles });
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Group Name <span className="text-red-500">*</span></label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="Enter group name"
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00bcd4]/30 ${error ? "border-red-400" : "border-gray-200"}`}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Vehicles</label>
            <input
              value={vehicles}
              onChange={(e) => setVehicles(e.target.value)}
              placeholder="e.g. R7_Binder Singh_PB10GK1292"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00bcd4]/30"
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#00bcd4" }}>{title}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function VehicleGroupsPage() {
  const [groups, setGroups] = useState<Group[]>(MOCK_GROUPS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);

  const filtered = groups.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.vehicles.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAdd = (data: { name: string; vehicles: string }) => {
    setGroups((prev) => [...prev, { id: Date.now(), ...data }]);
  };

  const handleEdit = (id: number, data: { name: string; vehicles: string }) => {
    setGroups((prev) => prev.map((g) => g.id === id ? { ...g, ...data } : g));
  };

  const handleDelete = (id: number) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      {showAdd && (
        <GroupFormModal
          initial={{ name: "", vehicles: "" }}
          title="Add Vehicle Group"
          onClose={() => setShowAdd(false)}
          onSave={handleAdd}
        />
      )}
      {editGroup && (
        <GroupFormModal
          initial={{ name: editGroup.name, vehicles: editGroup.vehicles }}
          title="Edit Vehicle Group"
          onClose={() => setEditGroup(null)}
          onSave={(data) => { handleEdit(editGroup.id, data); setEditGroup(null); }}
        />
      )}

      {/* Header */}
      <div>
        <p className="text-xs text-muted">Vehicles</p>
        <h1 className="text-xl font-bold text-foreground">My Vehicle Groups</h1>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg border border-divider bg-surface px-3 py-2 w-72">
          <svg className="w-4 h-4 text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search vehicle group or vehicle number"
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted text-foreground"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Bulk Upload */}
          <button className="px-4 py-2 rounded-lg border border-divider bg-surface text-sm font-semibold text-foreground hover:bg-divider">
            Bulk Upload
          </button>

          {/* Add Vehicle Group */}
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "#00bcd4" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Vehicle Group
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-divider bg-surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-divider bg-[#f0f4f8]">
              <th className="px-5 py-3 text-left font-semibold text-muted whitespace-nowrap">Vehicle Group Name</th>
              <th className="px-5 py-3 text-left font-semibold text-muted whitespace-nowrap">Vehicles</th>
              <th className="px-5 py-3 text-right font-semibold text-muted whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-muted text-sm">No vehicle groups found.</td>
              </tr>
            ) : (
              paged.map((g) => (
                <tr key={g.id} className="border-b border-divider last:border-0 hover:bg-[#f5f9ff] transition-colors">
                  <td className="px-5 py-3 text-foreground">{g.name}</td>
                  <td className="px-5 py-3 text-[#00bcd4]">{g.vehicles}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditGroup(g)}
                        title="Edit"
                        className="p-1.5 rounded hover:bg-[#e0f7fa] text-muted hover:text-[#00bcd4] transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        title="Delete"
                        className="p-1.5 rounded hover:bg-red-50 text-muted hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
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
        <span>
          Showing {filtered.length === 0 ? "0" : `${(page - 1) * PAGE_SIZE + 1} - ${Math.min(page * PAGE_SIZE, filtered.length)}`} of {filtered.length}
        </span>
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

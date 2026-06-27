"use client";

import { useState, useEffect } from "react";
import { FiSearch, FiPlus, FiSlash, FiTrash2 } from "react-icons/fi";

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  "SUPER_ADMIN": { bg: "#F974161a", color: "#F97316" },
  "ADMIN":       { bg: "#1A7A751a", color: "#1A7A75" },
  "FLEET_MANAGER": { bg: "#F59E0B1a", color: "#F59E0B" },
  "VIEWER":      { bg: "rgba(255,255,255,0.06)", color: "#9CA3AF" },
};

type UserRow = { id: string; displayName: string; email: string; roles?: string[]; enabled?: boolean; organisationName?: string | null; createdAt?: string };

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ displayName: "", email: "", password: "", role: "ADMIN" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: form.displayName, email: form.email, password: form.password, role: form.role }),
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok) { setError(data?.message ?? "Failed to create user"); return; }
      onCreated();
      onClose();
    } catch { setError("Network error"); } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-md rounded-3xl p-6" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.1)" }}>
        <h2 className="text-base font-bold text-white mb-5">New User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
          {[
            { label: "Full Name", key: "displayName", type: "text", placeholder: "Jane Smith" },
            { label: "Email", key: "email", type: "email", placeholder: "jane@example.com" },
            { label: "Password", key: "password", type: "password", placeholder: "Min 8 characters" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#7BBBB8" }}>{label}</label>
              <input type={type} required placeholder={placeholder}
                value={String(form[key as keyof typeof form])}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#7BBBB8" }}>Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              {["SUPER_ADMIN", "ADMIN", "FLEET_MANAGER", "DRIVER", "VIEWER"].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl text-sm font-semibold" style={{ background: "rgba(255,255,255,0.06)", color: "#9CA3AF" }}>Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl text-sm font-bold text-white" style={{ background: "#F97316", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating…" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GlobalUsersPage() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  async function loadUsers() {
    setLoadingUsers(true);
    try {
      const resp = await fetch("/api/admin/users?size=100");
      if (resp.ok) {
        const data = await resp.json();
        setUsers(data?.content ?? data ?? []);
      }
    } finally { setLoadingUsers(false); }
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleToggleEnabled(u: UserRow) {
    const newEnabled = u.enabled === false ? true : false;
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ enabled: newEnabled }),
    });
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, enabled: newEnabled } : x));
  }

  async function handleDelete(u: UserRow) {
    if (!confirm(`Delete user "${u.displayName}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    setUsers(prev => prev.filter(x => x.id !== u.id));
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const primaryRole = u.roles?.[0] ?? "";
    const matchRole = filterRole === "All" || primaryRole === filterRole;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-4">
      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onCreated={loadUsers} />}
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4A8A87" }} />
          <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }} />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="h-9 px-3 rounded-xl text-xs text-white outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <option value="All">All Roles</option>
          {["SUPER_ADMIN", "ADMIN", "FLEET_MANAGER", "DRIVER", "VIEWER"].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button onClick={() => setShowCreate(true)} className="ml-auto flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-white" style={{ background: "#F97316" }}>
          <FiPlus size={13} /> New User
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
                {["Name", "Email", "Organisation", "Role", "Status", "Last Login", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center" style={{ color: "#4A8A87" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center" style={{ color: "#4A8A87" }}>No users found.</td></tr>
              ) : filtered.map(u => {
                const primaryRole = u.roles?.[0] ?? "VIEWER";
                const rc = ROLE_COLORS[primaryRole] ?? ROLE_COLORS["VIEWER"];
                return (
                  <tr key={u.id} className="hover:bg-white/[0.03] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ background: !u.organisationName ? "#F97316" : "#0D4A47" }}>
                          {u.displayName[0]}
                        </div>
                        <span className="text-white font-medium">{u.displayName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{u.email}</td>
                    <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{u.organisationName ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: rc.bg, color: rc.color }}>{primaryRole}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold"
                        style={{ background: u.enabled !== false ? "#22C55E1a" : "rgba(255,255,255,0.06)", color: u.enabled !== false ? "#22C55E" : "#9CA3AF" }}>
                        {u.enabled !== false ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button title={u.enabled === false ? "Activate" : "Deactivate"}
                          onClick={() => handleToggleEnabled(u)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10"
                          style={{ color: u.enabled === false ? "#22C55E" : "#F59E0B" }}>
                          <FiSlash size={12} />
                        </button>
                        <button title="Delete" onClick={() => handleDelete(u)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10"
                          style={{ color: "#EF4444" }}><FiTrash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs" style={{ color: "#4A8A87", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {filtered.length} of {users.length} users
        </div>
      </div>
    </div>
  );
}

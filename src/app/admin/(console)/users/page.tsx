"use client";

import { useState } from "react";
import { FiSearch, FiPlus, FiRefreshCw, FiSlash, FiTrash2 } from "react-icons/fi";
import { USERS, ORGS } from "@/admin/data/mockData";

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  "Super Admin": { bg: "#F974161a", color: "#F97316" },
  "Admin":       { bg: "#1A7A751a", color: "#1A7A75" },
  "Manager":     { bg: "#F59E0B1a", color: "#F59E0B" },
  "Viewer":      { bg: "rgba(255,255,255,0.06)", color: "#9CA3AF" },
};

export default function GlobalUsersPage() {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");
  const [filterOrg, setFilterOrg] = useState("All");

  const filtered = USERS.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = filterRole === "All" || u.role === filterRole;
    const matchOrg = filterOrg === "All" || (filterOrg === "super" ? u.orgId === null : u.orgId === filterOrg);
    return matchSearch && matchRole && matchOrg;
  });

  return (
    <div className="space-y-4">
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
          {["Super Admin", "Admin", "Manager", "Viewer"].map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterOrg} onChange={e => setFilterOrg(e.target.value)}
          className="h-9 px-3 rounded-xl text-xs text-white outline-none"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <option value="All">All Organisations</option>
          <option value="super">Super Admins only</option>
          {ORGS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <button className="ml-auto flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold text-white" style={{ background: "#F97316" }}>
          <FiPlus size={13} /> New Super Admin
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
              {filtered.map(u => {
                const rc = ROLE_COLORS[u.role] ?? ROLE_COLORS.Viewer;
                return (
                  <tr key={u.id} className="hover:bg-white/[0.03] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ background: u.orgId === null ? "#F97316" : "#0D4A47" }}>
                          {u.name[0]}
                        </div>
                        <span className="text-white font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{u.email}</td>
                    <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{u.orgName}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: rc.bg, color: rc.color }}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold"
                        style={{ background: u.status === "Active" ? "#22C55E1a" : "rgba(255,255,255,0.06)", color: u.status === "Active" ? "#22C55E" : "#9CA3AF" }}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{u.lastLogin}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button title="Reset Password" className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "#7BBBB8" }}><FiRefreshCw size={12} /></button>
                        <button title="Deactivate" className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "#F59E0B" }}><FiSlash size={12} /></button>
                        <button title="Delete" className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10" style={{ color: "#EF4444" }}><FiTrash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs" style={{ color: "#4A8A87", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {filtered.length} of {USERS.length} users
        </div>
      </div>
    </div>
  );
}

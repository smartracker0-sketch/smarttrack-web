"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiSearch, FiEye, FiSlash, FiTrash2, FiLogIn } from "react-icons/fi";
import { OrgPlan, OrgStatus } from "@/admin/data/mockData";
import { useAdminAuthStore } from "@/admin/store/useAdminAuthStore";

function StatusBadge({ status }: { status: OrgStatus }) {
  const map: Record<OrgStatus, { bg: string; color: string }> = {
    Active:    { bg: "#22C55E1a", color: "#22C55E" },
    Trial:     { bg: "#F59E0B1a", color: "#F59E0B" },
    Suspended: { bg: "#EF44441a", color: "#EF4444" },
    Churned:   { bg: "rgba(255,255,255,0.06)", color: "#9CA3AF" },
  };
  const s = map[status];
  return <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: s.bg, color: s.color }}>{status}</span>;
}

function PlanBadge({ plan }: { plan: OrgPlan }) {
  const map: Record<OrgPlan, { bg: string; color: string }> = {
    Starter:    { bg: "rgba(255,255,255,0.06)", color: "#9CA3AF" },
    Pro:        { bg: "#1A7A751a", color: "#1A7A75" },
    Enterprise: { bg: "#F974161a", color: "#F97316" },
  };
  const s = map[plan];
  return <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: s.bg, color: s.color }}>{plan}</span>;
}

type OrgRow = { id: string; name: string; adminEmail?: string; status: OrgStatus; plan?: OrgPlan; vehicles?: number; users?: number; createdAt?: string };

function CreateOrgModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", slug: "", adminEmail: "", plan: "Pro", vehicleLimit: 20 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const resp = await fetch("/api/admin/organisations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: form.name, slug: form.slug, adminEmail: form.adminEmail, plan: form.plan, vehicleLimit: form.vehicleLimit }),
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        setError(data?.message ?? "Failed to create organisation");
        return;
      }
      onCreated();
      onClose();
    } catch {
      setError("Network error — is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-md rounded-3xl p-6" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.1)" }}>
        <h2 className="text-base font-bold text-white mb-5">New Organisation</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>}
          {[
            { label: "Organisation Name", key: "name", type: "text", placeholder: "Acme Logistics" },
            { label: "Slug", key: "slug", type: "text", placeholder: "acme-logistics" },
            { label: "Admin Email", key: "adminEmail", type: "email", placeholder: "admin@acme.com" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold mb-1" style={{ color: "#7BBBB8" }}>{label}</label>
              <input
                type={type}
                required
                placeholder={placeholder}
                value={String(form[key as keyof typeof form])}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "#7BBBB8" }}>Vehicle Limit</label>
            <input type="number" value={form.vehicleLimit} onChange={e => setForm(f => ({ ...f, vehicleLimit: +e.target.value }))}
              className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 h-10 rounded-xl text-sm font-semibold" style={{ background: "rgba(255,255,255,0.06)", color: "#9CA3AF" }}>Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 h-10 rounded-xl text-sm font-bold text-white" style={{ background: "#F97316", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating…" : "Create Organisation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function OrganisationsPage() {
  const router = useRouter();
  const { startImpersonation } = useAdminAuthStore();
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  async function loadOrgs() {
    setLoadingOrgs(true);
    try {
      const resp = await fetch("/api/admin/organisations?size=100");
      if (resp.ok) {
        const data = await resp.json();
        setOrgs(data?.content ?? data ?? []);
      }
    } finally {
      setLoadingOrgs(false);
    }
  }

  useEffect(() => { loadOrgs(); }, []);

  const filtered = orgs.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = o.name.toLowerCase().includes(q) || (o.adminEmail ?? "").toLowerCase().includes(q);
    const matchPlan = filterPlan === "All" || o.plan === filterPlan;
    const matchStatus = filterStatus === "All" || o.status === filterStatus;
    return matchSearch && matchPlan && matchStatus;
  });

  function handleImpersonate(o: OrgRow) {
    if (confirm(`You are about to view the platform as "${o.name}". This action will be logged.`)) {
      startImpersonation({ orgId: o.id, orgName: o.name });
      router.push("/app");
    }
  }

  async function handleSuspend(o: OrgRow) {
    const newStatus = o.status === "Suspended" ? "Active" : "Suspended";
    if (!confirm(`${newStatus === "Suspended" ? "Suspend" : "Reactivate"} "${o.name}"?`)) return;
    const res = await fetch(`/api/admin/organisations/${o.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) loadOrgs();
  }

  async function handleDelete(o: OrgRow) {
    if (!confirm(`Permanently delete "${o.name}" and all its data? This cannot be undone.`)) return;
    await fetch(`/api/admin/organisations/${o.id}`, { method: "DELETE" });
    loadOrgs();
  }

  return (
    <div className="space-y-5">
      {showCreate && <CreateOrgModal onClose={() => setShowCreate(false)} onCreated={loadOrgs} />}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#4A8A87" }} />
          <input
            placeholder="Search organisations…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-9 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
          />
        </div>
        {["All", "Starter", "Pro", "Enterprise"].map(p => (
          <button key={p} onClick={() => setFilterPlan(p)}
            className="h-9 px-3 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: filterPlan === p ? "#0D4A47" : "rgba(255,255,255,0.06)", color: filterPlan === p ? "#fff" : "#7BBBB8" }}>
            {p}
          </button>
        ))}
        {["All", "Active", "Trial", "Suspended", "Churned"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="h-9 px-3 rounded-xl text-xs font-semibold transition-colors"
            style={{ background: filterStatus === s ? "#0D4A47" : "rgba(255,255,255,0.06)", color: filterStatus === s ? "#fff" : "#7BBBB8" }}>
            {s}
          </button>
        ))}
        <button onClick={() => setShowCreate(true)}
          className="ml-auto flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-bold text-white"
          style={{ background: "#F97316" }}>
          <FiPlus size={14} /> New Organisation
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
                {["Organisation", "Plan", "Vehicles", "Users", "Status", "Onboarded", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingOrgs ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center" style={{ color: "#4A8A87" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-6 text-center" style={{ color: "#4A8A87" }}>No organisations found.</td></tr>
              ) : filtered.map((o) => (
                <tr key={o.id} className="hover:bg-white/[0.03] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-4 py-3">
                    <div className="text-white font-semibold">{o.name}</div>
                    <div style={{ color: "#4A8A87" }}>{o.adminEmail ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3">{o.plan ? <PlanBadge plan={o.plan} /> : "—"}</td>
                  <td className="px-4 py-3 text-white">{o.vehicles ?? "—"}</td>
                  <td className="px-4 py-3 text-white">{o.users ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status ?? "Active"} /></td>
                  <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => router.push(`/admin/organisations/${o.id}`)} title="View Details"
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ color: "#7BBBB8" }}><FiEye size={13} /></button>
                      <button onClick={() => handleImpersonate(o)} title="Impersonate"
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ color: "#F97316" }}><FiLogIn size={13} /></button>
                      <button title={o.status === "Suspended" ? "Reactivate" : "Suspend"}
                        onClick={() => handleSuspend(o)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ color: o.status === "Suspended" ? "#22C55E" : "#F59E0B" }}><FiSlash size={13} /></button>
                      <button title="Delete" onClick={() => handleDelete(o)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ color: "#EF4444" }}><FiTrash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 text-xs" style={{ color: "#4A8A87", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {filtered.length} of {orgs.length} organisations
        </div>
      </div>
    </div>
  );
}

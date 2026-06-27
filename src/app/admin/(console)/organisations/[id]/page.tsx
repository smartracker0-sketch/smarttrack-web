"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiLogIn, FiSlash, FiRefreshCw } from "react-icons/fi";
import { useAdminAuthStore } from "@/admin/store/useAdminAuthStore";

type Tab = "overview" | "devices" | "users";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Active:    { bg: "#22C55E1a", color: "#22C55E" },
    Trial:     { bg: "#F59E0B1a", color: "#F59E0B" },
    Suspended: { bg: "#EF44441a", color: "#EF4444" },
    Churned:   { bg: "rgba(255,255,255,0.06)", color: "#9CA3AF" },
  };
  const s = map[status] ?? map.Churned;
  return <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold" style={{ background: s.bg, color: s.color }}>{status}</span>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

export default function OrgDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { startImpersonation } = useAdminAuthStore();
  const [tab, setTab] = useState<Tab>("overview");

  const [org, setOrg]         = useState<AnyRow | null>(null);
  const [devices, setDevices] = useState<AnyRow[]>([]);
  const [users, setUsers]     = useState<AnyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [oRes, dRes, uRes] = await Promise.allSettled([
        fetch(`/api/admin/organisations/${id}`),
        fetch(`/api/admin/devices?size=500`),
        fetch(`/api/admin/users?size=500`),
      ]);
      if (oRes.status === "fulfilled") {
        if (oRes.value.status === 404) { setNotFound(true); return; }
        if (oRes.value.ok) setOrg(await oRes.value.json());
      }
      if (dRes.status === "fulfilled" && dRes.value.ok) {
        const data = await dRes.value.json();
        const all: AnyRow[] = data?.content ?? data ?? [];
        setDevices(all.filter((d: AnyRow) => d.organisationId === id));
      }
      if (uRes.status === "fulfilled" && uRes.value.ok) {
        const data = await uRes.value.json();
        const all: AnyRow[] = data?.content ?? data ?? [];
        setUsers(all.filter((u: AnyRow) => u.organisationId === id));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "devices",  label: `Devices (${devices.length})` },
    { key: "users",    label: `Users (${users.length})` },
  ];

  if (loading) return <div className="text-center py-16 text-xs" style={{ color: "#4A8A87" }}>Loading…</div>;
  if (notFound || !org) return <div className="text-white p-8">Organisation not found.</div>;

  function handleImpersonate() {
    if (confirm(`You are about to view the platform as "${org!.name}". This action will be logged.`)) {
      startImpersonation({ orgId: org!.id, orgName: org!.name });
      router.push("/app");
    }
  }

  async function handleSuspend() {
    const newStatus = org!.status === "Suspended" ? "Active" : "Suspended";
    if (!confirm(`${newStatus === "Suspended" ? "Suspend" : "Reactivate"} "${org!.name}"?`)) return;
    await fetch(`/api/admin/organisations/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    load();
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", color: "#7BBBB8" }}>
            <FiArrowLeft size={15} />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-white">{org.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={org.status} />
              <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "#0D4A471a", color: "#1A7A75" }}>{org.plan}</span>
              <span className="text-xs" style={{ color: "#4A8A87" }}>{org.adminEmail}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10" style={{ color: "#7BBBB8" }}>
            <FiRefreshCw size={13} />
          </button>
          <button onClick={handleImpersonate} className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold" style={{ background: "#F974161a", color: "#F97316", border: "1px solid #F9741633" }}>
            <FiLogIn size={13} /> Impersonate
          </button>
          <button onClick={handleSuspend} className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold" style={{ background: "#EF44441a", color: org?.status === "Suspended" ? "#22C55E" : "#EF4444", border: "1px solid #EF444433" }}>
            <FiSlash size={13} /> {org?.status === "Suspended" ? "Reactivate" : "Suspend"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.04)", width: "fit-content" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="h-8 px-4 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: tab === t.key ? "#0D4A47" : "transparent", color: tab === t.key ? "#fff" : "#7BBBB8" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              { label: "Devices",  value: devices.length },
              { label: "Users",    value: users.length },
              { label: "Status",   value: org.status ?? "Active" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs mt-1" style={{ color: "#4A8A87" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-5" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-sm font-bold text-white mb-3">Organisation Details</div>
            <div className="space-y-2">
              {[
                { label: "Created",  value: org.createdAt ? new Date(org.createdAt).toLocaleDateString() : "—" },
                { label: "Slug",     value: org.slug ?? "—" },
                { label: "Plan",     value: org.plan ?? "—" },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-xs py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span style={{ color: "#4A8A87" }}>{r.label}</span>
                  <span className="text-white font-medium">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "devices" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
                {["IMEI", "Type", "Vehicle Plate", "Status", "Added"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {devices.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: "#4A8A87" }}>No devices assigned to this organisation</td></tr>
              ) : devices.map(d => (
                <tr key={d.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-4 py-3 font-mono text-white">{d.imei}</td>
                  <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{d.deviceType ?? "—"}</td>
                  <td className="px-4 py-3 text-white">{d.vehiclePlate ?? "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status ?? "Unknown"} /></td>
                  <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "users" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
                {["Name", "Email", "Role", "Status", "Joined"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center" style={{ color: "#4A8A87" }}>No users in this organisation</td></tr>
              ) : users.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-4 py-3 text-white font-semibold">{u.displayName ?? u.name ?? "—"}</td>
                  <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{u.email}</td>
                  <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{(u.roles ?? []).join(", ") || "—"}</td>
                  <td className="px-4 py-3"><StatusBadge status={u.enabled !== false ? "Active" : "Suspended"} /></td>
                  <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

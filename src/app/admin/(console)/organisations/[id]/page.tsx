"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FiArrowLeft, FiLogIn, FiSlash } from "react-icons/fi";
import { ORGS, VEHICLES, USERS, ALERTS } from "@/admin/data/mockData";
import { useAdminAuthStore } from "@/admin/store/useAdminAuthStore";

type Tab = "overview" | "vehicles" | "users" | "billing" | "activity";

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

export default function OrgDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { startImpersonation } = useAdminAuthStore();
  const [tab, setTab] = useState<Tab>("overview");

  const org = ORGS.find(o => o.id === id);
  const orgVehicles = VEHICLES.filter(v => v.orgId === id);
  const orgUsers = USERS.filter(u => u.orgId === id);
  const orgAlerts = ALERTS.filter(a => a.orgId === id);

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "vehicles", label: `Vehicles (${orgVehicles.length})` },
    { key: "users", label: `Users (${orgUsers.length})` },
    { key: "billing", label: "Billing" },
    { key: "activity", label: "Activity Log" },
  ];

  if (!org) return <div className="text-white p-8">Organisation not found.</div>;

  function handleImpersonate() {
    if (confirm(`You are about to view the platform as "${org!.name}". This action will be logged.`)) {
      startImpersonation({ orgId: org!.id, orgName: org!.name });
      router.push("/app");
    }
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
          <button onClick={handleImpersonate} className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold" style={{ background: "#F974161a", color: "#F97316", border: "1px solid #F9741633" }}>
            <FiLogIn size={13} /> Impersonate
          </button>
          <button className="flex items-center gap-2 h-9 px-4 rounded-xl text-xs font-bold" style={{ background: "#EF44441a", color: "#EF4444", border: "1px solid #EF444433" }}>
            <FiSlash size={13} /> Suspend
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Vehicles", value: org.vehicles },
              { label: "Users", value: org.users },
              { label: "Alerts This Month", value: orgAlerts.length },
              { label: "MRR (₦)", value: org.mrr.toLocaleString() },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-4" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs mt-1" style={{ color: "#4A8A87" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl p-5" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-sm font-bold text-white mb-3">Recent Activity</div>
            <div className="space-y-3">
              {["Org created", "First device assigned", "Admin user invited", "First trip recorded"].map((e, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#1A7A75" }} />
                  <span className="text-white">{e}</span>
                  <span style={{ color: "#4A8A87" }} className="ml-auto">{org.onboarded}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "vehicles" && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
                {["Plate", "Driver", "Status", "IMEI", "Last Seen"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orgVehicles.map(v => (
                <tr key={v.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-4 py-3 text-white font-semibold">{v.plate}</td>
                  <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{v.driver}</td>
                  <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                  <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{v.imei}</td>
                  <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{v.lastSeen}</td>
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
                {["Name", "Email", "Role", "Status", "Last Login"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orgUsers.map(u => (
                <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td className="px-4 py-3 text-white font-semibold">{u.name}</td>
                  <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{u.email}</td>
                  <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{u.role}</td>
                  <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                  <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{u.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "billing" && (
        <div className="rounded-2xl p-5" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-sm font-bold text-white mb-4">Billing Details</div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Current Plan", value: org.plan },
              { label: "MRR", value: `₦${org.mrr.toLocaleString()}` },
              { label: "Vehicle Limit", value: org.vehicleLimit },
              { label: "Payment Method", value: "•••• 4242 (Visa)" },
            ].map(i => (
              <div key={i.label} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-xs" style={{ color: "#4A8A87" }}>{i.label}</div>
                <div className="text-white font-bold mt-1">{i.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div className="rounded-2xl p-5 space-y-3" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-sm font-bold text-white mb-2">Activity Log</div>
          {["Org onboarded", "Admin invited", "First vehicle added", "First trip recorded", "Monthly report generated"].map((e, i) => (
            <div key={i} className="flex items-center gap-3 text-xs py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#F97316" }} />
              <span className="text-white">{e}</span>
              <span className="ml-auto" style={{ color: "#4A8A87" }}>{org.onboarded}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

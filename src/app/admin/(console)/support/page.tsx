"use client";

import { useState } from "react";
import { FiX } from "react-icons/fi";
import { SUPPORT_TICKETS, SupportTicket } from "@/admin/data/mockData";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  "Open":        { bg: "#EF44441a", color: "#EF4444" },
  "In Progress": { bg: "#F59E0B1a", color: "#F59E0B" },
  "Resolved":    { bg: "#22C55E1a", color: "#22C55E" },
};

const PRIORITY_COLORS: Record<string, { bg: string; color: string }> = {
  Low:    { bg: "rgba(255,255,255,0.06)", color: "#9CA3AF" },
  Medium: { bg: "#1A7A751a", color: "#1A7A75" },
  High:   { bg: "#F974161a", color: "#F97316" },
  Urgent: { bg: "#EF44441a", color: "#EF4444" },
};

const MOCK_THREAD = [
  { author: "Metro Deliveries Admin", time: "Jun 20 08:00", msg: "Our vehicle MET-009-BB is not appearing on the map even though the GPS is powered on and the app shows it is online." },
  { author: "Emeka Okonkwo (Admin)", time: "Jun 20 08:45", msg: "Hi, thank you for reporting this. We can see the device is sending pings. This appears to be a rendering issue on the map layer. We're investigating and will update you shortly." },
  { author: "Metro Deliveries Admin", time: "Jun 20 09:15", msg: "Thank you. Please escalate — this is affecting our dispatch operations." },
];

function TicketDetail({ ticket, onClose }: { ticket: SupportTicket; onClose: () => void }) {
  const sc = STATUS_COLORS[ticket.status] ?? STATUS_COLORS.Open;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="w-full max-w-lg rounded-3xl p-6 space-y-4" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono" style={{ color: "#4A8A87" }}>{ticket.id}</span>
              <span className="inline-flex h-5 px-2 rounded text-[10px] font-bold" style={{ background: sc.bg, color: sc.color }}>{ticket.status}</span>
            </div>
            <h2 className="text-base font-bold text-white">{ticket.subject}</h2>
            <div className="text-xs mt-1" style={{ color: "#4A8A87" }}>{ticket.orgName} · {ticket.created}</div>
          </div>
          <button onClick={onClose} style={{ color: "#7BBBB8" }}><FiX size={16} /></button>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto">
          {MOCK_THREAD.map((m, i) => (
            <div key={i} className="rounded-xl p-3" style={{ background: m.author.includes("Admin)") ? "rgba(249,115,22,0.08)" : "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-xs font-semibold mb-1" style={{ color: m.author.includes("Admin)") ? "#F97316" : "#7BBBB8" }}>{m.author} · {m.time}</div>
              <div className="text-xs text-white leading-relaxed">{m.msg}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <input placeholder="Reply…" className="flex-1 h-9 px-3 rounded-xl text-sm text-white outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
          <button className="h-9 px-4 rounded-xl text-xs font-bold text-white" style={{ background: "#F97316" }}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default function SupportTicketsPage() {
  const [selected, setSelected] = useState<SupportTicket | null>(null);

  return (
    <div className="space-y-4">
      {selected && <TicketDetail ticket={selected} onClose={() => setSelected(null)} />}

      <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#4A8A87" }}>
                {["Ticket #", "Organisation", "Subject", "Priority", "Status", "Created", "Assigned To"].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUPPORT_TICKETS.map(t => {
                const sc = STATUS_COLORS[t.status] ?? STATUS_COLORS.Open;
                const pc = PRIORITY_COLORS[t.priority] ?? PRIORITY_COLORS.Low;
                return (
                  <tr key={t.id} className="hover:bg-white/[0.03] cursor-pointer transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                    onClick={() => setSelected(t)}>
                    <td className="px-4 py-3 font-mono text-white font-semibold">{t.id}</td>
                    <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{t.orgName}</td>
                    <td className="px-4 py-3 text-white max-w-xs truncate">{t.subject}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex h-5 px-2 rounded text-[10px] font-bold" style={{ background: pc.bg, color: pc.color }}>{t.priority}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex h-5 px-2 rounded text-[10px] font-bold" style={{ background: sc.bg, color: sc.color }}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#4A8A87" }}>{t.created}</td>
                    <td className="px-4 py-3" style={{ color: "#7BBBB8" }}>{t.assignedTo}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

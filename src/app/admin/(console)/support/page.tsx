"use client";

import { FiHeadphones } from "react-icons/fi";

export default function SupportTicketsPage() {
  return (
    <div className="space-y-4">
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
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <FiHeadphones size={28} style={{ color: "#4A8A87" }} />
                    <div className="text-xs font-semibold" style={{ color: "#4A8A87" }}>No support tickets yet</div>
                    <div className="text-[10px] max-w-xs" style={{ color: "#2A5A57" }}>
                      Support tickets submitted by organisations will appear here once the support module is connected to a backend.
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

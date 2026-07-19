"use client";

import { useState, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import { Vehicle, VehicleStatus } from "../data/mockVehicles";
import VehicleCard from "./VehicleCard";

interface Props {
  vehicles: Vehicle[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

type Tab = "all" | VehicleStatus;

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "moving", label: "Moving" },
  { key: "stopped", label: "Stopped" },
  { key: "idle", label: "Idle" },
  { key: "offline", label: "Offline" },
];

export default function VehicleSidebar({ vehicles, selectedId, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Tab>("all");

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchTab = tab === "all" || v.status === tab;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        v.plate.toLowerCase().includes(q) ||
        v.driver.toLowerCase().includes(q);
      return matchTab && matchSearch;
    });
  }, [vehicles, tab, search]);

  const countOf = (t: Tab) =>
    t === "all" ? vehicles.length : vehicles.filter((v) => v.status === t).length;

  return (
    <div
      className="flex flex-col h-full w-80 flex-shrink-0"
      style={{ background: "#0D4A47", borderRight: "1px solid rgba(26,122,117,0.35)" }}
    >
      {/* Search */}
      <div className="p-3 border-b" style={{ borderColor: "rgba(26,122,117,0.3)" }}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B2D4D2]" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicles or drivers..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg text-white outline-none focus:ring-1 focus:ring-[#00bcd4]"
            style={{ background: "#072E2C", border: "1px solid rgba(26,122,117,0.3)", caretColor: '#00bcd4' }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div
        className="flex overflow-x-auto gap-1 px-3 py-2 border-b"
        style={{ borderColor: "rgba(26,122,117,0.3)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              tab === t.key
                ? "text-[#0A3835]"
                : "hover:text-white hover:bg-white/10"
            }`}
            style={tab === t.key ? { background: '#00bcd4' } : { color: '#B2D4D2' }}
          >
            {t.label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                tab === t.key ? "bg-black/10" : "bg-white/10"
              }`}
            >
              {countOf(t.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Vehicle list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">No vehicles found</div>
        ) : (
          filtered.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              selected={v.id === selectedId}
              onClick={() => onSelect(v.id)}
            />
          ))
        )}
      </div>

      {/* Footer summary */}
      <div
        className="px-4 py-3 border-t text-xs"
        style={{ borderColor: "rgba(26,122,117,0.3)", color: '#B2D4D2', background: "#072E2C" }}
      >
        Total: <span className="text-white font-semibold">{vehicles.length} vehicles</span>
      </div>
    </div>
  );
}

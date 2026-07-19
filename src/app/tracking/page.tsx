"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useVehicleSimulator } from "./hooks/useVehicleSimulator";
import VehicleSidebar from "./components/VehicleSidebar";
import TrackingTopBar from "./components/TrackingTopBar";

const LiveMap = dynamic(() => import("./components/LiveMap"), { ssr: false });

export default function TrackingPage() {
  const { vehicles, refresh } = useVehicleSimulator();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [followId, setFollowId] = useState<string | null>(null);
  const [interval, setInterval] = useState(5000);
  const [lastRefresh, setLastRefresh] = useState(() =>
    new Date().toLocaleTimeString()
  );

  const handleRefresh = useCallback(() => {
    refresh();
    setLastRefresh(new Date().toLocaleTimeString());
  }, [refresh]);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (followId && followId !== id) setFollowId(null);
  }, [followId]);

  const handleFollowToggle = useCallback((id: string | null) => {
    setFollowId(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedId(null);
        setFollowId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ background: "#072E2C" }}
    >
      <TrackingTopBar
        vehicles={vehicles}
        lastRefresh={lastRefresh}
        onRefresh={handleRefresh}
      />

      <div className="flex flex-1 overflow-hidden">
        <VehicleSidebar
          vehicles={vehicles}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
        <LiveMap
          vehicles={vehicles}
          selectedId={selectedId}
          onSelect={handleSelect}
          followId={followId}
          onFollowToggle={handleFollowToggle}
          interval={interval}
          onIntervalChange={setInterval}
        />
      </div>
    </div>
  );
}

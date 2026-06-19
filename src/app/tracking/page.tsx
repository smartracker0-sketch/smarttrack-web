"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useVehicleSimulator } from "./hooks/useVehicleSimulator";
import VehicleSidebar from "./components/VehicleSidebar";
import TrackingTopBar from "./components/TrackingTopBar";

// Leaflet must only run client-side — dynamic import with no SSR
const LiveMap = dynamic(() => import("./components/LiveMap"), { ssr: false });

export default function TrackingPage() {
  const vehicles = useVehicleSimulator();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [interval, setInterval] = useState(5000);
  const [lastRefresh, setLastRefresh] = useState(() =>
    new Date().toLocaleTimeString()
  );

  const handleRefresh = useCallback(() => {
    setLastRefresh(new Date().toLocaleTimeString());
  }, []);

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{ background: "#072E2C" }}
    >
      {/* Top bar */}
      <TrackingTopBar
        vehicles={vehicles}
        lastRefresh={lastRefresh}
        onRefresh={handleRefresh}
      />

      {/* Body: sidebar + map */}
      <div className="flex flex-1 overflow-hidden">
        <VehicleSidebar
          vehicles={vehicles}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <LiveMap
          vehicles={vehicles}
          selectedId={selectedId}
          onSelect={setSelectedId}
          interval={interval}
          onIntervalChange={setInterval}
        />
      </div>
    </div>
  );
}

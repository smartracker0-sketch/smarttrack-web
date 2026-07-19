"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MOCK_VEHICLES, Vehicle, VehicleStatus } from "../data/mockVehicles";

const TICK_MS = 5000;
const DELTA = 0.002;

function nudge(val: number, maxDelta: number) {
  return val + (Math.random() - 0.5) * 2 * maxDelta;
}

function deriveStatus(speed: number, ignition: boolean): VehicleStatus {
  if (speed < 1) return ignition ? "idle" : "stopped";
  return "moving";
}

function formatUpdate(ts: Date) {
  return ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function useVehicleSimulator() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    const now = new Date();
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.status === "offline") return { ...v, lastUpdate: formatUpdate(now) };
        const speed = v.status === "moving"
          ? Math.max(0, Math.min(120, nudge(v.speed, 8)))
          : v.speed;
        const status = deriveStatus(speed, v.ignition);
        return {
          ...v,
          lat: status === "moving" ? nudge(v.lat, DELTA) : v.lat,
          lng: status === "moving" ? nudge(v.lng, DELTA) : v.lng,
          speed,
          status,
          heading: (v.heading + (Math.random() - 0.5) * 30 + 360) % 360,
          lastUpdate: formatUpdate(now),
        };
      })
    );
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(tick, TICK_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [tick]);

  const refresh = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    tick();
    intervalRef.current = setInterval(tick, TICK_MS);
  }, [tick]);

  return { vehicles, refresh };
}

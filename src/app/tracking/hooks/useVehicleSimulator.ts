"use client";

import { useEffect, useRef, useState } from "react";
import { MOCK_VEHICLES, Vehicle } from "../data/mockVehicles";

const TICK_MS = 5000;
const DELTA = 0.002;

function nudge(val: number, maxDelta: number) {
  return val + (Math.random() - 0.5) * 2 * maxDelta;
}

export function useVehicleSimulator() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.status !== "moving") return v;
          return {
            ...v,
            lat: nudge(v.lat, DELTA),
            lng: nudge(v.lng, DELTA),
            speed: Math.max(10, Math.min(120, nudge(v.speed, 8))),
            heading: (v.heading + (Math.random() - 0.5) * 30 + 360) % 360,
            lastUpdate: "Just now",
          };
        })
      );
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return vehicles;
}

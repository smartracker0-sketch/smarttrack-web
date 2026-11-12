"use client";
import { useEffect, useState } from "react";
import { rowsFrom, numeric, textOf, type DataRow } from "./data";
export default function MapFuelPanel({
  deviceId,
  latest,
}: {
  deviceId: string;
  latest: DataRow | null;
}) {
  const [period, setPeriod] = useState("24h"),
    [rows, setRows] = useState<DataRow[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController(),
      end = new Date(),
      start = new Date(
        end.getTime() -
          (period === "24h" ? 1 : period === "7d" ? 7 : 30) * 86400000,
      );
    fetch(
      "/api/telemetry?" +
        new URLSearchParams({
          type: "fuel-history",
          deviceId,
          from: start.toISOString(),
          to: end.toISOString(),
        }),
      { cache: "no-store", signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok)
          throw Error("Fuel readings are not available for this vehicle.");
        return response.json();
      })
      .then((data) => {
        setRows(rowsFrom(data));
        setError("");
      })
      .catch((cause) => {
        if (cause.name !== "AbortError") setError(cause.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [deviceId, period]);
  const readings = rows
      .map((row) => numeric(row.fuelLiters))
      .filter((value): value is number => value !== null),
    max = Math.max(1, ...readings),
    min = Math.min(0, ...readings);
  return (
    <div className="st-card-body">
      <div className="st-tabs" aria-label="Fuel period">
        {["24h", "7d", "30d"].map((value) => (
          <button
            key={value}
            className={period === value ? "is-active" : ""}
            onClick={() => {
              setLoading(true);
              setPeriod(value);
            }}
          >
            {value}
          </button>
        ))}
      </div>
      <div className="st-form-grid" style={{ marginTop: 16 }}>
        <div>
          <span className="st-muted">Fuel level</span>
          <strong className="st-map-fuel-value">
            {latest?.fuelLevelPct != null
              ? textOf(latest.fuelLevelPct) + "%"
              : "—"}
          </strong>
        </div>
        <div>
          <span className="st-muted">Fuel in tank</span>
          <strong className="st-map-fuel-value">
            {latest?.fuelLiters != null
              ? textOf(latest.fuelLiters) + " L"
              : "—"}
          </strong>
        </div>
      </div>
      {loading ? (
        <p className="st-empty" role="status">
          Loading readings…
        </p>
      ) : error ? (
        <p className="st-notice" role="status" style={{ marginTop: 16 }}>
          {error}
        </p>
      ) : readings.length > 1 ? (
        <svg
          viewBox="0 0 320 150"
          role="img"
          aria-label="Recorded fuel in litres"
          style={{ width: "100%", marginTop: 20 }}
        >
          <line x1="0" y1="140" x2="320" y2="140" stroke="var(--st-line)" />
          <polyline
            fill="none"
            stroke="var(--st-blue)"
            strokeWidth="2"
            points={readings
              .map(
                (value, index) =>
                  `${(index / (readings.length - 1)) * 320},${140 - ((value - min) / (max - min)) * 120}`,
              )
              .join(" ")}
          />
        </svg>
      ) : (
        <p className="st-empty">No fuel history in this period.</p>
      )}
      <p className="st-muted" style={{ fontSize: 12, marginTop: 16 }}>
        Recorded sensor readings. Review the vehicle&apos;s location before
        investigating a sudden change.
      </p>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiAlertTriangle, FiBattery, FiDroplet, FiRefreshCw, FiThermometer, FiWifi } from "react-icons/fi";

type FuelSensor = {
  id: string;
  imei: string;
  name: string;
  deviceType: string;
  vehiclePlate?: string | null;
  status: string;
  bleMacAddress?: string | null;
  gatewayDeviceName?: string | null;
  fuelMeasurementRange?: number | null;
  tankCapacityLiters?: number | null;
  sensorBatteryLowMv?: number | null;
};

type FuelReading = {
  eventTime: string;
  receivedAt: string;
  fuelLevelPct?: number | null;
  fuelLiters?: number | null;
  temperatureC?: number | null;
  rawLevel?: number | null;
  sensorBatteryMv?: number | null;
  sensorMac?: string | null;
};

type SensorRow = FuelSensor & { reading?: FuelReading | null };

export default function FuelMonitoringPage() {
  const [rows, setRows] = useState<SensorRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<FuelReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSensors = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true); else setLoading(true);
    try {
      const response = await fetch("/api/devices?size=500", { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      const devices = (Array.isArray(payload) ? payload : payload.content ?? []) as FuelSensor[];
      const sensors = devices.filter(device => device.deviceType?.toLowerCase() === "fuel sensor");
      const readings = await Promise.all(sensors.map(async sensor => {
        const readingResponse = await fetch(`/api/telemetry?type=fuel-latest&deviceId=${sensor.id}`, { cache: "no-store" }).catch(() => null);
        return { ...sensor, reading: readingResponse?.ok ? await readingResponse.json() as FuelReading : null };
      }));
      setRows(readings);
      setSelectedId(current => current && readings.some(row => row.id === current) ? current : readings[0]?.id ?? null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadSensors();
    const timer = window.setInterval(() => void loadSensors(true), 15_000);
    return () => window.clearInterval(timer);
  }, [loadSensors]);

  const selected = rows.find(row => row.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId) { setHistory([]); return; }
    const to = new Date();
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
    void fetch(`/api/telemetry?type=fuel-history&deviceId=${selectedId}&from=${from.toISOString()}&to=${to.toISOString()}`, { cache: "no-store" })
      .then(response => response.ok ? response.json() : [])
      .then(value => setHistory(Array.isArray(value) ? value : []))
      .catch(() => setHistory([]));
  }, [selectedId, selected?.reading?.receivedAt]);

  const summary = useMemo(() => ({
    total: rows.length,
    reporting: rows.filter(row => isFresh(row.reading?.receivedAt)).length,
    lowFuel: rows.filter(row => row.reading?.fuelLevelPct != null && row.reading.fuelLevelPct < 15).length,
    lowBattery: rows.filter(row => row.reading?.sensorBatteryMv != null && row.reading.sensorBatteryMv <= (row.sensorBatteryLowMv ?? 3200)).length,
  }), [rows]);

  return (
    <main className="h-full overflow-y-auto bg-[#f4f7f7] p-4 sm:p-6">
      <div className="mx-auto max-w-[1500px] space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce6e5] pb-4">
          <div><p className="text-[10px] font-bold uppercase text-[#1a7a75]">Sensors</p><h1 className="text-xl font-extrabold text-[#0d3d3a]">Fuel Monitoring</h1><p className="mt-1 text-xs text-[#708582]">Live Escort TD-BLE tank levels, temperature and sensor health.</p></div>
          <button type="button" onClick={() => void loadSensors(true)} disabled={refreshing} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#cbdad8] bg-white px-3 text-xs font-bold text-[#174d49] disabled:opacity-50"><FiRefreshCw className={refreshing ? "animate-spin" : ""} />Refresh</button>
        </header>

        <section className="grid grid-cols-2 border border-[#dce6e5] bg-white md:grid-cols-4">
          <Metric icon={FiDroplet} label="Fuel sensors" value={summary.total} color="#0d7770" />
          <Metric icon={FiWifi} label="Reporting now" value={summary.reporting} color="#22a878" />
          <Metric icon={FiAlertTriangle} label="Low fuel" value={summary.lowFuel} color="#e3a313" />
          <Metric icon={FiBattery} label="Low battery" value={summary.lowBattery} color="#ef5268" />
        </section>

        <section className="grid min-h-[520px] border border-[#dce6e5] bg-white lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-x-auto border-b border-[#dce6e5] lg:border-b-0 lg:border-r">
            <div className="border-b border-[#e5eceb] px-4 py-3 text-xs font-extrabold text-[#173f3c]">Connected sensors</div>
            {loading ? <div className="p-8 text-center text-sm text-[#78908d]">Loading sensors...</div> : rows.length === 0 ? <EmptyState /> : <table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-[#edf4f3] text-[10px] uppercase text-[#66817e]"><tr><th className="px-4 py-3">Sensor / vehicle</th><th className="px-4 py-3">Level</th><th className="px-4 py-3">Litres</th><th className="px-4 py-3">Temperature</th><th className="px-4 py-3">Battery</th><th className="px-4 py-3">Last report</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} onClick={() => setSelectedId(row.id)} className={`cursor-pointer border-t border-[#edf1f1] transition-colors ${selectedId === row.id ? "bg-[#eaf6f4]" : "hover:bg-[#f8fbfa]"}`}><td className="px-4 py-3"><div className="font-bold text-[#173f3c]">{row.name}</div><div className="mt-0.5 text-[10px] text-[#78908d]">{row.vehiclePlate || row.imei}</div></td><td className="px-4 py-3"><Level value={row.reading?.fuelLevelPct} /></td><td className="px-4 py-3 font-bold text-[#173f3c]">{number(row.reading?.fuelLiters, "L")}</td><td className="px-4 py-3">{number(row.reading?.temperatureC, "°C")}</td><td className="px-4 py-3">{row.reading?.sensorBatteryMv ? `${(row.reading.sensorBatteryMv / 1000).toFixed(2)} V` : "Not reported"}</td><td className="px-4 py-3 text-[#617a77]">{relativeTime(row.reading?.receivedAt)}</td></tr>)}</tbody></table>}
          </div>

          <aside className="p-4">
            {selected ? <SensorDetails sensor={selected} history={history} /> : <div className="grid h-full place-items-center text-center text-xs text-[#78908d]">Select a fuel sensor to view its details.</div>}
          </aside>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value, color }: { icon: typeof FiDroplet; label: string; value: number; color: string }) { return <div className="flex min-h-20 items-center gap-3 border-r border-[#e4ebea] px-4 last:border-r-0"><span className="grid h-9 w-9 place-items-center rounded-md" style={{ background: `${color}18`, color }}><Icon /></span><div><div className="text-lg font-extrabold text-[#173f3c]">{value}</div><div className="text-[10px] font-semibold uppercase text-[#78908d]">{label}</div></div></div>; }

function Level({ value }: { value?: number | null }) { if (value == null) return <span className="text-[#879895]">Not reported</span>; const color = value < 15 ? "#ef5268" : value < 30 ? "#e3a313" : "#22a878"; return <div className="flex items-center gap-2"><div className="h-1.5 w-16 overflow-hidden rounded-full bg-[#e6eceb]"><div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} /></div><strong style={{ color }}>{value.toFixed(1)}%</strong></div>; }

function SensorDetails({ sensor, history }: { sensor: SensorRow; history: FuelReading[] }) { const reading = sensor.reading; return <div className="space-y-5"><div><div className="flex items-center justify-between gap-2"><h2 className="font-extrabold text-[#173f3c]">{sensor.name}</h2><span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase ${isFresh(reading?.receivedAt) ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{isFresh(reading?.receivedAt) ? "Reporting" : "Offline"}</span></div><p className="mt-1 text-[10px] text-[#78908d]">{sensor.vehiclePlate || "No vehicle label"}</p></div><div className="grid grid-cols-2 gap-px overflow-hidden border border-[#dce6e5] bg-[#dce6e5]"><Detail label="Fuel level" value={reading?.fuelLevelPct == null ? "Not reported" : `${reading.fuelLevelPct.toFixed(1)}%`} /><Detail label="Current volume" value={number(reading?.fuelLiters, "L")} /><Detail label="Temperature" value={number(reading?.temperatureC, "°C")} icon={<FiThermometer />} /><Detail label="Sensor battery" value={reading?.sensorBatteryMv ? `${(reading.sensorBatteryMv / 1000).toFixed(2)} V` : "Not reported"} icon={<FiBattery />} /></div><div className="space-y-2 border-t border-[#e1e9e8] pt-4"><Info label="BLE MAC" value={sensor.bleMacAddress || reading?.sensorMac || "Not configured"} /><Info label="Gateway" value={sensor.gatewayDeviceName || "Not configured"} /><Info label="Raw level" value={reading?.rawLevel == null ? "Not reported" : `${reading.rawLevel} / ${sensor.fuelMeasurementRange ?? 4095}`} /><Info label="Tank capacity" value={number(sensor.tankCapacityLiters, "L")} /><Info label="Last report" value={relativeTime(reading?.receivedAt)} /></div><div className="border-t border-[#e1e9e8] pt-4"><div className="mb-3 text-[10px] font-bold uppercase text-[#66817e]">Last 24 hours</div>{history.length ? <div className="flex h-24 items-end gap-1">{history.slice().reverse().slice(-40).map((item, index) => <div key={`${item.receivedAt}-${index}`} className="min-w-1 flex-1 rounded-t bg-[#20a89f]" style={{ height: `${Math.max(3, item.fuelLevelPct ?? 0)}%` }} title={`${item.fuelLevelPct?.toFixed(1) ?? "-"}%`} />)}</div> : <div className="rounded-md bg-[#f3f6f6] p-4 text-center text-[10px] text-[#879895]">No readings in the last 24 hours.</div>}</div></div>; }

function Detail({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) { return <div className="bg-white p-3"><div className="flex items-center gap-1 text-[9px] font-bold uppercase text-[#78908d]">{icon}{label}</div><div className="mt-1 text-sm font-extrabold text-[#173f3c]">{value}</div></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="flex items-start justify-between gap-4 text-xs"><span className="text-[#78908d]">{label}</span><strong className="max-w-[210px] text-right text-[#294e4b]">{value}</strong></div>; }
function EmptyState() { return <div className="grid min-h-72 place-items-center p-8 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#e8f4f3] text-[#16877f]"><FiDroplet size={22} /></span><h2 className="mt-3 text-sm font-extrabold text-[#173f3c]">No fuel sensors assigned</h2><p className="mt-1 max-w-xs text-xs leading-5 text-[#78908d]">Ask an administrator to add an Escort TD-BLE sensor and assign its gateway tracker.</p></div></div>; }
function number(value?: number | null, suffix = "") { return value == null ? "Not reported" : `${value.toFixed(1)} ${suffix}`.trim(); }
function isFresh(value?: string | null) { return Boolean(value && Date.now() - new Date(value).getTime() < 5 * 60 * 1000); }
function relativeTime(value?: string | null) { if (!value) return "Never"; const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000)); if (seconds < 60) return `${seconds}s ago`; if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`; if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`; return `${Math.floor(seconds / 86400)}d ago`; }

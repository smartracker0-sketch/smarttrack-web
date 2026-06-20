"use client";

const SERVICES = [
  { name: "API Server", uptime: "99.98%", status: "green", latency: "42ms" },
  { name: "PostgreSQL", uptime: "99.95%", status: "green", latency: "8ms" },
  { name: "Redis Cache", uptime: "99.99%", status: "green", latency: "2ms" },
  { name: "MQTT Broker", uptime: "98.12%", status: "amber", latency: "120ms" },
  { name: "Socket.io", uptime: "99.80%", status: "green", latency: "55ms" },
];

const ERROR_LOG = [
  { ts: "2026-06-20 09:12:05", service: "MQTT Broker", msg: "Connection timeout from device 352749081234566" },
  { ts: "2026-06-20 08:45:32", service: "API Server", msg: "500 Internal Server Error — /api/v1/locations/ingest" },
  { ts: "2026-06-20 07:33:19", service: "PostgreSQL", msg: "Slow query alert: trip_summary aggregation > 5s" },
  { ts: "2026-06-19 23:10:44", service: "MQTT Broker", msg: "High message backlog: 1,240 messages queued" },
  { ts: "2026-06-19 18:55:01", service: "API Server", msg: "Rate limit exceeded — org5 client IP" },
];

const STATUS_DOT: Record<string, string> = { green: "#22C55E", amber: "#F59E0B", red: "#EF4444" };

export default function SystemHealthPage() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {SERVICES.map(s => (
          <div key={s.name} className="rounded-2xl p-5" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_DOT[s.status] }} />
              <span className="text-sm font-bold text-white">{s.name}</span>
            </div>
            <div className="text-lg font-extrabold" style={{ color: STATUS_DOT[s.status] }}>{s.uptime}</div>
            <div className="text-xs mt-1" style={{ color: "#4A8A87" }}>Uptime · {s.latency} avg</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-5 py-4 text-sm font-bold text-white" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          Recent Error Log
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {ERROR_LOG.map((e, i) => (
            <div key={i} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs">
              <span className="font-mono flex-shrink-0" style={{ color: "#4A8A87" }}>{e.ts}</span>
              <span className="font-bold px-2 py-0.5 rounded flex-shrink-0" style={{ background: "#EF44441a", color: "#EF4444" }}>{e.service}</span>
              <span className="text-white">{e.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

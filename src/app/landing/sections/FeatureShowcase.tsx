"use client";

import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

interface FeatureRow {
  tag: string;
  title: string;
  body: string;
  bullets: string[];
  imageContent: React.ReactNode;
  reverse?: boolean;
}

function DashboardMockup() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border" style={{ background: "#0D4A47", borderColor: "#1A7A75" }}>
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/10">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="ml-3 text-xs text-gray-500">Fleet Dashboard</span>
      </div>
      <div className="p-4 grid grid-cols-3 gap-3">
        {[["24", "Active"], ["3", "Alerts"], ["12", "Trips"]].map(([v, l]) => (
          <div key={l} className="rounded-xl p-3" style={{ background: "#0A3835" }}>
            <div className="text-2xl font-black text-white">{v}</div>
            <div className="text-xs mt-0.5" style={{ color: '#B2D4D2' }}>{l}</div>
          </div>
        ))}
        <div className="col-span-3 rounded-xl p-3" style={{ background: "#0A3835", minHeight: 80 }}>
          <div className="text-xs text-gray-500 mb-2">Fleet Activity</div>
          <div className="flex items-end gap-1 h-10">
            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{ height: `${h}%`, background: i === 11 ? "#F97316" : "#1A7A75" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertMockup() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <span className="font-bold text-sm text-gray-800">Alert Centre</span>
        <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">3 active</span>
      </div>
      <div className="p-3 space-y-2">
        {[
          { type: "Speeding", vehicle: "LSD-421-KJ", color: "#ef4444", bg: "#fef2f2" },
          { type: "Geofence Exit", vehicle: "LND-089-AA", color: "#f97316", bg: "#fff7ed" },
          { type: "SOS Alert", vehicle: "AGL-774-QR", color: "#8b5cf6", bg: "#f5f3ff" },
        ].map((a) => (
          <div key={a.type} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: a.bg, borderColor: a.color + "30" }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }} />
            <div className="flex-1">
              <div className="text-sm font-bold text-gray-800">{a.type}</div>
              <div className="text-xs text-gray-500">{a.vehicle}</div>
            </div>
            <span className="text-xs font-semibold" style={{ color: a.color }}>Now</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FuelMockup() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-100">
        <span className="font-bold text-sm text-gray-800">Fuel Analytics</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-3xl font-black text-gray-900">8.2 <span className="text-base font-medium text-gray-400">L/100km</span></div>
            <div className="text-xs text-green-600 font-semibold mt-0.5">▲ 12% improvement this month</div>
          </div>
          {/* Gauge */}
          <svg viewBox="0 0 100 60" className="w-24 h-14">
            <path d="M10,55 A45,45 0 0,1 90,55" fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />
            <path d="M10,55 A45,45 0 0,1 90,55" fill="none" stroke="#1A7A75" strokeWidth="10" strokeLinecap="round" strokeDasharray="141.3" strokeDashoffset="42" />
            <text x="50" y="52" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#0D4A47">70%</text>
          </svg>
        </div>
        <div className="space-y-2">
          {[["Idle Fuel Waste", "23 L", "#F97316"], ["Pilferage Detected", "0 L", "#22C55E"], ["Efficiency Score", "A+", "#1A7A75"]].map(([l, v, c]) => (
            <div key={l as string} className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{l}</span>
              <span className="font-bold" style={{ color: c as string }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DriverMockup() {
  return (
    <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 bg-white">
      <div className="px-4 py-3 border-b border-gray-100">
        <span className="font-bold text-sm text-gray-800">Driver Scorecard</span>
      </div>
      <div className="p-3 space-y-2">
        {[
          { name: "Emeka Okafor", score: 98, change: "+2" },
          { name: "Funke Adeyemi", score: 92, change: "+5" },
          { name: "Chukwudi Nwosu", score: 85, change: "-1" },
          { name: "Biodun Afolabi", score: 78, change: "+3" },
        ].map((d, i) => (
          <div key={d.name} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
              style={{ background: i === 0 ? "#F97316" : "#0D4A47" }}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-gray-800 truncate">{d.name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="h-1.5 flex-1 rounded-full bg-gray-100">
                  <div className="h-1.5 rounded-full" style={{ width: `${d.score}%`, background: "#1A7A75" }} />
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-black text-gray-900">{d.score}</div>
              <div className={`text-xs font-semibold ${d.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>{d.change}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const ROWS: FeatureRow[] = [
  {
    tag: "Much more than Telematics",
    title: "Monitor All Your Assets",
    body: "Get a unified view of your entire fleet — real-time location, trip history, geofence events, and custom alerts all in one powerful dashboard built for scale.",
    bullets: ["Real-time asset tracking & status", "Trip reports with route replay", "Geofence entry/exit notifications", "Custom alert rules & escalations"],
    imageContent: <DashboardMockup />,
    reverse: false,
  },
  {
    tag: "Safety backed by technology",
    title: "Protect Your Vehicles and Cargo",
    body: "AI and IoT work together to keep your assets safe — from remote immobilisation to SOS panic alerts and real-time video evidence.",
    bullets: ["Remote vehicle immobilisation", "SOS & panic button alerts", "AI-powered incident detection", "Tamper & theft notifications"],
    imageContent: <AlertMockup />,
    reverse: true,
  },
  {
    tag: "Powering positive business impact",
    title: "Enhance Your Fuel Economy",
    body: "Detailed fuel analytics help you cut costs, detect pilferage, and reward efficient drivers — turning fuel data into real savings.",
    bullets: ["Real-time fuel level monitoring", "Pilferage & anomaly alerts", "Idle time tracking & reports", "ROI dashboards per vehicle"],
    imageContent: <FuelMockup />,
    reverse: false,
  },
  {
    tag: "Performance on a new level",
    title: "Manage Your Drivers and Their Potential",
    body: "ADAS & DMS scoring, driver leaderboards, and geofencing combine to improve driver behaviour and reduce your fleet's risk profile.",
    bullets: ["ADAS & DMS driver scoring", "Harsh event detection & coaching", "Driver leaderboards & rewards", "Geofence compliance tracking"],
    imageContent: <DriverMockup />,
    reverse: true,
  },
];

export default function FeatureShowcase() {
  return (
    <section className="py-8 bg-white" id="features">
      {ROWS.map((row, i) => (
        <div
          key={row.title}
          className={`py-20 ${i % 2 === 0 ? "bg-white" : ""}`}
          style={i % 2 !== 0 ? { background: '#E8F4F3' } : {}}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${row.reverse ? "lg:flex-row-reverse" : ""}`}>
              {/* Text side */}
              <motion.div
                initial={{ opacity: 0, x: row.reverse ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={row.reverse ? "lg:order-2" : ""}
              >
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: "#1A7A75" }}
                >
                  {row.tag}
                </span>
                <h2 className="mt-3 text-3xl lg:text-4xl font-black leading-tight" style={{ color: '#0D4A47' }}>
                  {row.title}
                </h2>
                <p className="mt-4 text-gray-500 text-base leading-relaxed">{row.body}</p>
                <ul className="mt-6 space-y-3">
                  {row.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "rgba(26,122,117,0.12)" }}
                      >
                        <div className="w-2 h-2 rounded-full" style={{ background: "#1A7A75" }} />
                      </div>
                      <span className="text-gray-700 text-sm font-medium">{b}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#"
                  className="mt-8 inline-flex items-center gap-2 font-bold text-sm hover:gap-3 transition-all"
                  style={{ color: "#1A7A75" }}
                >
                  Learn more <FiArrowRight size={16} />
                </a>
              </motion.div>

              {/* Image side */}
              <motion.div
                initial={{ opacity: 0, x: row.reverse ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={row.reverse ? "lg:order-1" : ""}
              >
                {row.imageContent}
              </motion.div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiCheckCircle,
  FiDroplet,
  FiMapPin,
  FiShield,
  FiTruck,
  FiUsers,
  FiZap,
} from "react-icons/fi";

type VisualType = "dashboard" | "alerts" | "fuel" | "drivers";

interface FeatureRow {
  tag: string;
  title: string;
  body: string;
  bullets: string[];
  metrics: { value: string; label: string }[];
  link: string;
  accent: string;
  visual: VisualType;
  reverse?: boolean;
}

const vehiclePins = [
  { top: "25%", left: "22%", color: "#22C55E", label: "Moving" },
  { top: "42%", left: "64%", color: "#F97316", label: "Idle" },
  { top: "60%", left: "38%", color: "#22C55E", label: "Moving" },
  { top: "30%", left: "78%", color: "#EF4444", label: "Alert" },
  { top: "72%", left: "70%", color: "#6B7280", label: "Offline" },
];

function Shell({ title, children, dark = false }: { title: string; children: React.ReactNode; dark?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-lg border shadow-2xl ${dark ? "border-white/10 bg-[#071E1C]" : "border-gray-200 bg-white"}`}>
      <div className={`flex items-center justify-between border-b px-4 py-3 ${dark ? "border-white/10" : "border-gray-100"}`}>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        </div>
        <span className={`text-xs font-bold ${dark ? "text-[#B2D4D2]" : "text-gray-500"}`}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function DashboardMockup() {
  return (
    <Shell title="Fleet Command Centre" dark>
      <div className="grid gap-3 p-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[290px] overflow-hidden rounded-lg bg-[#0A3835]">
          <div className="absolute inset-0 opacity-25">
            <div className="h-full w-full bg-[linear-gradient(115deg,transparent_0_48%,rgba(178,212,210,0.18)_49%_51%,transparent_52%),linear-gradient(35deg,transparent_0_48%,rgba(178,212,210,0.12)_49%_51%,transparent_52%)] bg-[length:90px_90px]" />
          </div>
          <div className="absolute left-5 top-5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-[#B2D4D2]">
            Lagos live map
          </div>
          <div className="absolute bottom-0 left-1/2 h-[78%] w-24 -translate-x-1/2 bg-[#1A7A75]/25 [clip-path:polygon(44%_0,56%_0,100%_100%,0_100%)]" />
          {vehiclePins.map((pin) => (
            <div key={`${pin.top}-${pin.left}`} className="absolute" style={{ top: pin.top, left: pin.left }}>
              <span className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20" style={{ background: pin.color }} />
              <span className="relative block h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white" style={{ background: pin.color }} />
            </div>
          ))}
        </div>
        <div className="grid gap-3">
          {[
            ["24", "Active assets", "#22C55E"],
            ["3", "Critical alerts", "#EF4444"],
            ["12", "Trips today", "#F97316"],
          ].map(([value, label, color]) => (
            <div key={label} className="rounded-lg bg-[#0A3835] p-4">
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wider" style={{ color }}>{label}</div>
            </div>
          ))}
          <div className="rounded-lg bg-[#0A3835] p-4">
            <div className="mb-3 flex items-center justify-between text-xs font-bold text-[#B2D4D2]">
              <span>Fleet activity</span>
              <span>+18%</span>
            </div>
            <div className="flex h-14 items-end gap-1">
              {[42, 68, 54, 76, 61, 92, 74, 88, 64, 96].map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-sm"
                  style={{ height: `${height}%`, background: index > 7 ? "#F97316" : "#1A7A75" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function AlertMockup() {
  const alerts = [
    { type: "SOS panic", vehicle: "AGL-774-QR", time: "Now", color: "#EF4444", icon: FiShield },
    { type: "Geofence exit", vehicle: "LND-089-AA", time: "1m", color: "#F97316", icon: FiMapPin },
    { type: "Power tamper", vehicle: "LSD-421-KJ", time: "4m", color: "#7C3AED", icon: FiZap },
  ];

  return (
    <Shell title="Alert Centre">
      <div className="p-4">
        <div className="mb-4 grid grid-cols-3 gap-2">
          {[
            ["3", "Active"],
            ["19s", "Avg response"],
            ["100%", "Escalated"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg bg-[#FEF2F2] p-3 text-center">
              <div className="font-black text-[#EF4444]">{value}</div>
              <div className="mt-1 text-[11px] font-semibold text-gray-500">{label}</div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.type} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: `${alert.color}16`, color: alert.color }}>
                <alert.icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-black text-gray-900">{alert.type}</div>
                <div className="text-xs font-semibold text-gray-500">{alert.vehicle}</div>
              </div>
              <span className="rounded-full px-2.5 py-1 text-xs font-black text-white" style={{ background: alert.color }}>
                {alert.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function FuelMockup() {
  return (
    <Shell title="Fuel Analytics">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold uppercase tracking-widest text-[#1A7A75]">Consumption</div>
            <div className="mt-2 text-4xl font-black text-gray-950">
              8.2 <span className="text-base font-semibold text-gray-400">L/100km</span>
            </div>
            <div className="mt-1 text-sm font-bold text-[#22C55E]">12% improvement this month</div>
          </div>
          <svg viewBox="0 0 120 78" className="h-20 w-28">
            <path d="M14,66 A46,46 0 0,1 106,66" fill="none" stroke="#E5E7EB" strokeWidth="12" strokeLinecap="round" />
            <path d="M14,66 A46,46 0 0,1 106,66" fill="none" stroke="#1A7A75" strokeWidth="12" strokeLinecap="round" strokeDasharray="145" strokeDashoffset="39" />
            <text x="60" y="66" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0D4A47">70%</text>
          </svg>
        </div>
        <div className="mt-6 grid gap-3">
          {[
            ["Idle fuel waste", "23 L", "#F97316", 64],
            ["Pilferage detected", "0 L", "#22C55E", 8],
            ["Efficiency score", "A+", "#1A7A75", 88],
          ].map(([label, value, color, width]) => (
            <div key={label as string}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-500">{label}</span>
                <span className="font-black" style={{ color: color as string }}>{value}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full" style={{ width: `${width}%`, background: color as string }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function DriverMockup() {
  const drivers = [
    { name: "Emeka Okafor", score: 98, change: "+2", badge: "Elite" },
    { name: "Funke Adeyemi", score: 92, change: "+5", badge: "Rising" },
    { name: "Chukwudi Nwosu", score: 85, change: "-1", badge: "Stable" },
    { name: "Biodun Afolabi", score: 78, change: "+3", badge: "Coach" },
  ];

  return (
    <Shell title="Driver Scorecard">
      <div className="p-4">
        <div className="mb-4 rounded-lg bg-[#E8F4F3] p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#1A7A75]">Fleet safety score</div>
              <div className="mt-1 text-4xl font-black text-[#0D4A47]">91</div>
            </div>
            <div className="text-right">
              <div className="font-black text-[#22C55E]">+7%</div>
              <div className="text-xs font-semibold text-gray-500">risk reduction</div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {drivers.map((driver, index) => (
            <div key={driver.name} className="flex items-center gap-3 rounded-lg border border-gray-100 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: index === 0 ? "#F97316" : "#0D4A47" }}>
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-black text-gray-900">{driver.name}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">{driver.badge}</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-gray-100">
                  <div className="h-1.5 rounded-full bg-[#1A7A75]" style={{ width: `${driver.score}%` }} />
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-gray-950">{driver.score}</div>
                <div className={`text-xs font-bold ${driver.change.startsWith("+") ? "text-[#22C55E]" : "text-[#EF4444]"}`}>{driver.change}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function FeatureVisual({ type }: { type: VisualType }) {
  if (type === "dashboard") return <DashboardMockup />;
  if (type === "alerts") return <AlertMockup />;
  if (type === "fuel") return <FuelMockup />;
  return <DriverMockup />;
}

const ROWS: FeatureRow[] = [
  {
    tag: "Much more than Telematics",
    title: "Monitor All Your Assets",
    body: "Get a unified operating picture for every vehicle, driver, trip, geofence, alert, and asset status. Smart Tracker turns scattered fleet activity into one control room built for scale.",
    bullets: ["Real-time asset tracking and status", "Trip reports with route replay", "Geofence entry and exit notifications", "Custom alert rules and escalations"],
    metrics: [{ value: "24", label: "active assets" }, { value: "12", label: "trips today" }],
    link: "/tracking",
    accent: "#1A7A75",
    visual: "dashboard",
  },
  {
    tag: "Safety backed by technology",
    title: "Protect Your Vehicles and Cargo",
    body: "AI, GPS, panic hardware, and IoT telemetry work together to detect risk, escalate urgent events, and give teams the evidence they need to act fast.",
    bullets: ["Remote vehicle immobilisation", "SOS and panic button alerts", "AI-powered incident detection", "Tamper and theft notifications"],
    metrics: [{ value: "19s", label: "alert response" }, { value: "3", label: "active risks" }],
    link: "/app/alerts",
    accent: "#EF4444",
    visual: "alerts",
    reverse: true,
  },
  {
    tag: "Powering positive business impact",
    title: "Enhance Your Fuel Economy",
    body: "Detailed fuel analytics help you cut costs, detect pilferage, reduce idle waste, and reward efficient drivers with fuel data your finance team can trust.",
    bullets: ["Real-time fuel level monitoring", "Pilferage and anomaly alerts", "Idle time tracking and reports", "ROI dashboards per vehicle"],
    metrics: [{ value: "12%", label: "monthly improvement" }, { value: "0 L", label: "pilferage today" }],
    link: "/app/expenses",
    accent: "#F97316",
    visual: "fuel",
  },
  {
    tag: "Performance on a new level",
    title: "Manage Your Drivers and Their Potential",
    body: "ADAS, DMS, scorecards, leaderboards, and geofence compliance help managers coach better habits and reduce the fleet's risk profile over time.",
    bullets: ["ADAS and DMS driver scoring", "Harsh event detection and coaching", "Driver leaderboards and rewards", "Geofence compliance tracking"],
    metrics: [{ value: "91", label: "fleet safety score" }, { value: "+7%", label: "risk reduction" }],
    link: "/app/drivers",
    accent: "#7C3AED",
    visual: "drivers",
    reverse: true,
  },
];

export default function FeatureShowcase() {
  return (
    <section className="bg-white py-8" id="features">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="grid gap-6 lg:grid-cols-[0.8fr_1fr] lg:items-end"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#1A7A75]">Fleet intelligence suite</span>
            <h2 className="mt-3 text-4xl font-black leading-tight text-[#0D4A47] lg:text-5xl">
              One platform for tracking, safety, fuel, and driver performance.
            </h2>
          </div>
          <p className="text-lg leading-8 text-gray-600">
            Smart Tracker combines telematics, AI events, operating records, and decision-ready dashboards so teams can move from reactive monitoring to proactive fleet control.
          </p>
        </motion.div>
      </div>

      {ROWS.map((row, index) => (
        <div
          key={row.title}
          className={index % 2 === 0 ? "bg-white py-20" : "bg-[#E8F4F3] py-20"}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, x: row.reverse ? 28 : -28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={row.reverse ? "lg:order-2" : ""}
              >
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: row.accent }}>
                  {row.tag}
                </span>
                <h3 className="mt-3 text-3xl font-black leading-tight text-[#0D4A47] lg:text-4xl">
                  {row.title}
                </h3>
                <p className="mt-5 text-base leading-8 text-gray-600">{row.body}</p>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {row.metrics.map((metric) => (
                    <div key={metric.label} className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="text-2xl font-black text-[#0D4A47]">{metric.value}</div>
                      <div className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-500">{metric.label}</div>
                    </div>
                  ))}
                </div>

                <ul className="mt-6 grid gap-3">
                  {row.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full" style={{ background: `${row.accent}1F`, color: row.accent }}>
                        <FiCheckCircle size={13} />
                      </span>
                      <span className="text-sm font-semibold leading-6 text-gray-700">{bullet}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={row.link}
                  className="mt-8 inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
                  style={{ background: row.accent }}
                >
                  Learn more
                  <FiArrowRight size={16} />
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: row.reverse ? -28 : 28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className={row.reverse ? "lg:order-1" : ""}
              >
                <FeatureVisual type={row.visual} />
              </motion.div>
            </div>
          </div>
        </div>
      ))}

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-lg bg-[#071E1C] p-6 text-white sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FiTruck, label: "Fleet-wide visibility" },
            { icon: FiShield, label: "Asset protection" },
            { icon: FiDroplet, label: "Fuel cost control" },
            { icon: FiUsers, label: "Driver performance" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#B2D4D2]">
                <item.icon size={19} />
              </span>
              <span className="text-sm font-bold">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiAlertTriangle,
  FiArrowRight,
  FiCamera,
  FiCheckCircle,
  FiCloud,
  FiEye,
  FiMapPin,
  FiShield,
  FiSmartphone,
  FiZap,
} from "react-icons/fi";

const EVENTS = [
  {
    icon: FiAlertTriangle,
    title: "Forward Collision Warning",
    short: "Collision",
    desc: "AI detects unsafe following distances and warns the driver before impact risk becomes a crash.",
    response: "Driver alert + cloud clip",
    confidence: "97%",
    color: "#EF4444",
    bg: "#FEF2F2",
    box: "left-[46%] top-[32%] h-24 w-32",
  },
  {
    icon: FiZap,
    title: "Speed Limit Violation",
    short: "Speeding",
    desc: "Geo-aware speed intelligence compares road rules, fleet policy, and real-time vehicle movement.",
    response: "Manager notification",
    confidence: "94%",
    color: "#F97316",
    bg: "#FFF7ED",
    box: "left-[58%] top-[54%] h-16 w-28",
  },
  {
    icon: FiEye,
    title: "Driver Fatigue Detection",
    short: "Fatigue",
    desc: "In-cab DMS watches eye closure, head pose, and attention patterns during long trips.",
    response: "Cab warning + scorecard",
    confidence: "96%",
    color: "#7C3AED",
    bg: "#F5F3FF",
    box: "left-[17%] top-[23%] h-28 w-24",
  },
  {
    icon: FiActivity,
    title: "Harsh Driving Events",
    short: "Harsh events",
    desc: "Camera footage and accelerometer data combine to show what happened before and after each event.",
    response: "Event timeline",
    confidence: "92%",
    color: "#F59E0B",
    bg: "#FFFBEB",
    box: "left-[31%] top-[59%] h-16 w-36",
  },
  {
    icon: FiSmartphone,
    title: "Mobile Phone Usage",
    short: "Phone use",
    desc: "AI spots distracted driving inside the cab and triggers immediate coaching signals.",
    response: "In-cab prompt",
    confidence: "95%",
    color: "#1A7A75",
    bg: "#E8F4F3",
    box: "left-[22%] top-[41%] h-20 w-20",
  },
];

const CAPABILITIES = [
  {
    icon: FiCamera,
    title: "Road + cabin video",
    desc: "Forward, rear, side, and driver-facing cameras capture the context behind each trip.",
  },
  {
    icon: FiCloud,
    title: "Cloud evidence vault",
    desc: "Clips are indexed by vehicle, driver, location, event type, and timestamp for quick review.",
  },
  {
    icon: FiMapPin,
    title: "Location-aware incidents",
    desc: "Every video event is tied to live tracking, route history, geofences, and fleet status.",
  },
  {
    icon: FiShield,
    title: "Coaching, not guesswork",
    desc: "Managers get the video proof needed to coach safely and resolve claims faster.",
  },
];

const IMPACT = [
  { value: "3s", label: "average alert window" },
  { value: "24/7", label: "driver monitoring" },
  { value: "360°", label: "fleet visibility" },
];

export default function VideoTelematics() {
  const [active, setActive] = useState(0);
  const activeEvent = EVENTS[active];
  const ActiveIcon = activeEvent.icon;

  return (
    <section className="overflow-hidden bg-[#F5F7FA] py-24" id="video">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-end"
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#1A7A75]">
              Unparalleled Visibility
            </span>
            <h2 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-[#0D4A47] lg:text-6xl">
              Advanced Video Telematics
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
              AI-powered cameras that do not just record. They detect risk, alert drivers, preserve video evidence, and help managers prevent the next incident.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {IMPACT.map((item) => (
              <div key={item.label} className="rounded-lg border border-[#C5E0DE] bg-white p-4 text-center shadow-sm">
                <div className="text-2xl font-black text-[#0D4A47]">{item.value}</div>
                <div className="mt-1 text-xs font-semibold leading-5 text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-lg border border-[#C5E0DE] bg-[#071E1C] shadow-2xl"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-[0_0_16px_rgba(239,68,68,0.85)]" />
                <span className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">
                  Live AI Dashcam
                </span>
              </div>
              <div className="text-xs font-semibold text-[#B2D4D2]">
                Lagos fleet corridor · CAM 01
              </div>
            </div>

            <div className="relative min-h-[420px] overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(26,122,117,0.5),transparent_42%),linear-gradient(180deg,#113f3b_0%,#071e1c_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-[58%] bg-[#102F2D]" />
              <div className="absolute bottom-0 left-1/2 h-[58%] w-40 -translate-x-1/2 bg-[#1B4D49] [clip-path:polygon(38%_0,62%_0,100%_100%,0_100%)]" />
              <div className="absolute bottom-0 left-1/2 h-[58%] w-2 -translate-x-1/2 bg-white/25" />
              <div className="absolute bottom-24 left-[14%] h-1 w-[74%] rotate-[-6deg] bg-white/10" />
              <div className="absolute bottom-44 left-[18%] h-1 w-[68%] rotate-[5deg] bg-white/10" />

              <div className="absolute left-[11%] top-[20%] h-44 w-32 rounded-lg border border-white/10 bg-black/25 p-2">
                <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-white/60">
                  <span>DRIVER</span>
                  <span>DMS</span>
                </div>
                <div className="relative h-28 overflow-hidden rounded-md bg-[#1A7A75]/40">
                  <div className="absolute left-1/2 top-7 h-10 w-10 -translate-x-1/2 rounded-full bg-[#B2D4D2]" />
                  <div className="absolute bottom-0 left-1/2 h-16 w-20 -translate-x-1/2 rounded-t-full bg-[#0D4A47]" />
                  <div className="absolute left-9 top-11 h-1.5 w-3 rounded-full bg-[#071E1C]" />
                  <div className="absolute right-9 top-11 h-1.5 w-3 rounded-full bg-[#071E1C]" />
                </div>
                <div className="mt-2 text-[10px] font-semibold text-[#B2D4D2]">Attention normal</div>
              </div>

              <motion.div
                key={activeEvent.title}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`absolute rounded-md border-2 ${activeEvent.box}`}
                style={{ borderColor: activeEvent.color, boxShadow: `0 0 28px ${activeEvent.color}66` }}
              >
                <div className="absolute -top-8 left-0 rounded-t-md px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white" style={{ background: activeEvent.color }}>
                  {activeEvent.short}
                </div>
              </motion.div>

              <div className="absolute right-5 top-5 w-64 rounded-lg border border-white/10 bg-black/35 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: activeEvent.bg, color: activeEvent.color }}>
                    <ActiveIcon size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white">{activeEvent.title}</div>
                    <div className="text-xs font-semibold text-[#B2D4D2]">Confidence {activeEvent.confidence}</div>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-white/70">{activeEvent.response}</p>
              </div>

              <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-3">
                {["Cloud clip saved", "Driver alerted", "Manager notified"].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur">
                    <FiCheckCircle className="text-[#22C55E]" size={14} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="flex flex-col gap-5"
          >
            <div className="rounded-lg border border-[#C5E0DE] bg-white p-5 shadow-sm">
              <div className="text-sm font-black uppercase tracking-widest text-[#1A7A75]">
                Detection library
              </div>
              <div className="mt-4 grid gap-2">
                {EVENTS.map((event, index) => (
                  <button
                    key={event.title}
                    onClick={() => setActive(index)}
                    className={`flex items-start gap-3 rounded-md border p-3 text-left transition ${
                      active === index
                        ? "border-transparent shadow-md"
                        : "border-gray-200 hover:border-[#B2D4D2]"
                    }`}
                    style={active === index ? { background: event.bg } : { background: "#FFFFFF" }}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: event.bg, color: event.color }}>
                      <event.icon size={18} />
                    </span>
                    <span>
                      <span className="block font-bold text-[#0D4A47]">{event.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-gray-500">{event.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-[#0D4A47] p-5 text-white">
              <div className="text-sm font-black uppercase tracking-widest text-[#B2D4D2]">
                What happens next
              </div>
              <div className="mt-5 grid gap-4">
                {[
                  "AI identifies the safety event on the road or inside the cab.",
                  "The driver receives an immediate alert while the clip is saved.",
                  "Managers review the event with location, speed, driver, and vehicle context.",
                ].map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-6 text-white/80">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="mt-8 grid gap-4 lg:grid-cols-4"
        >
          {CAPABILITIES.map((feature) => (
            <div key={feature.title} className="rounded-lg border border-[#C5E0DE] bg-white p-5 shadow-sm">
              <feature.icon className="text-[#1A7A75]" size={24} />
              <div className="mt-4 font-black text-[#0D4A47]">{feature.title}</div>
              <p className="mt-2 text-sm leading-6 text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-lg border border-[#C5E0DE] bg-white p-6 sm:flex-row sm:items-center">
          <div>
            <div className="font-black text-[#0D4A47]">Ready to make every trip visible?</div>
            <p className="mt-1 text-sm text-gray-500">
              Combine AI dashcams with GPS, geofences, alerts, and driver scorecards in one Smart Tracker workspace.
            </p>
          </div>
          <a
            href="/tracking"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#F97316] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#EA6A0A]"
          >
            Explore video telematics
            <FiArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

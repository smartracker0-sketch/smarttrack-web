import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  FiActivity,
  FiAlertTriangle,
  FiBarChart2,
  FiCheck,
  FiChevronRight,
  FiClock,
  FiCompass,
  FiDollarSign,
  FiMapPin,
  FiNavigation,
  FiSettings,
  FiShield,
  FiTarget,
  FiTrendingUp,
  FiTruck,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import Navbar from "../landing/sections/Navbar";
import Footer from "../landing/sections/Footer";

export const metadata: Metadata = {
  title: "Business Profile | Smart Tracker Telematics",
  description:
    "Discover SmartTracker's fleet intelligence platform, business model, industries, technology, values, and vision for African mobility.",
};

const solutions = [
  { icon: FiMapPin, title: "Real-Time Vehicle Tracking", text: "Live location, movement history, route replay, trip distance and vehicle status from one operational view." },
  { icon: FiUsers, title: "Driver Behaviour", text: "Monitor speeding, harsh braking, rapid acceleration, idling and driver performance trends." },
  { icon: FiDollarSign, title: "Fuel Management", text: "Track consumption, identify abnormal fuel loss and expose the true fuel cost of every vehicle." },
  { icon: FiSettings, title: "Fleet Maintenance", text: "Plan service intervals, receive maintenance reminders and reduce costly unplanned downtime." },
  { icon: FiNavigation, title: "Route & Trip Intelligence", text: "Compare planned and actual routes, improve dispatching and understand every completed journey." },
  { icon: FiShield, title: "Geofencing & Alerts", text: "Create virtual boundaries and receive immediate alerts for ignition, movement and security events." },
  { icon: FiBarChart2, title: "Fleet Analytics", text: "Turn operational records into practical reports for cost control, productivity and better decisions." },
];

const industries = [
  "Logistics & courier services",
  "FMCG & distribution",
  "Pharmaceutical & medical distribution",
  "Construction",
  "Security services",
  "School & staff transport",
  "E-commerce & last-mile delivery",
  "Agriculture",
  "Car hire & rental",
  "Field service operations",
];

const values = ["Innovation", "Reliability", "Customer Success", "Accountability", "Simplicity", "Integrity"];

const evolution = [
  "GPS Tracking",
  "Fleet Management",
  "Fleet Analytics",
  "Fleet Cost Intelligence",
  "Delivery Intelligence",
  "Predictive Fleet Management",
  "Fleet Operating System",
];

const outcomes = [
  { icon: FiCompass, label: "Visibility" },
  { icon: FiTarget, label: "Control" },
  { icon: FiDollarSign, label: "Cost Reduction" },
  { icon: FiShield, label: "Accountability" },
  { icon: FiZap, label: "Productivity" },
  { icon: FiTrendingUp, label: "Profitability" },
];

export default function BusinessProfilePage() {
  return (
    <main className="min-h-screen bg-white text-[#102A2A]" style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <Navbar />

      <section className="relative flex h-[78vh] min-h-[590px] max-h-[760px] items-end overflow-hidden">
        <Image src="/industries/logistics.png" alt="SmartTracker fleet vehicles at a logistics facility" fill priority className="object-cover" sizes="100vw" />
        <div className="absolute inset-0 bg-[#062F2D]/75" />
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <p className="mb-5 text-sm font-bold uppercase text-[#65D4B0]">Fleet Management | Telematics | Fleet Intelligence</p>
          <h1 className="max-w-4xl text-5xl font-black leading-[1.04] text-white sm:text-6xl lg:text-7xl">SmartTracker</h1>
          <p className="mt-5 max-w-2xl text-xl font-semibold text-white sm:text-2xl">Track Less. Control More. Operate Better.</p>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
            A technology-driven fleet intelligence company helping African businesses operate safer, leaner and more profitable fleets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/company/contact-us" className="inline-flex items-center gap-2 rounded-md bg-[#24A47B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1B8C69]">
              Talk to our team <FiChevronRight />
            </Link>
            <Link href="/products" className="inline-flex items-center gap-2 rounded-md border border-white/45 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              Explore solutions
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
        <div>
          <p className="text-sm font-bold uppercase text-[#188463]">Who We Are</p>
          <h2 className="mt-3 text-3xl font-black text-[#0D4A47] sm:text-4xl">Fleet operations made visible, measurable and manageable.</h2>
        </div>
        <div className="space-y-5 text-base leading-8 text-[#4D6362]">
          <p>SmartTracker combines real-time GPS tracking, driver behaviour monitoring, fuel management, maintenance planning, route intelligence and fleet analytics in one connected platform.</p>
          <p>We help fleet owners move beyond simply knowing where a vehicle is. The platform reveals how each asset is being used, what it costs, how drivers perform and where operational efficiency can improve.</p>
        </div>
      </section>

      <section className="bg-[#0D4A47] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase text-[#65D4B0]">Our Purpose</p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">Intelligence that improves every fleet decision.</h2>
            </div>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md bg-white/15 sm:grid-cols-5">
              {["Monitor", "Measure", "Control", "Optimize", "Improve"].map((step, index) => (
                <div key={step} className="bg-[#0A3E3B] px-4 py-6 text-center">
                  <span className="block text-xs font-bold text-[#65D4B0]">0{index + 1}</span>
                  <span className="mt-2 block font-bold">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F4F8F7] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase text-[#188463]">What We Deliver</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black text-[#0D4A47] sm:text-4xl">One platform for the full fleet operation.</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-md border border-[#DDEAE7] bg-white p-6">
                <Icon className="text-[#188463]" size={25} />
                <h3 className="mt-5 text-lg font-black text-[#123E3C]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#607573]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase text-[#188463]">The SmartTracker Value</p>
            <h2 className="mt-3 text-3xl font-black text-[#0D4A47] sm:text-4xl">Operational data translated into business outcomes.</h2>
          </div>
          <div className="mt-10 grid grid-cols-2 border-y border-[#DDEAE7] md:grid-cols-3 lg:grid-cols-6">
            {outcomes.map(({ icon: Icon, label }) => (
              <div key={label} className="border-b border-[#DDEAE7] px-4 py-7 md:border-r lg:border-b-0 last:border-r-0">
                <Icon size={23} className="text-[#EF6B47]" />
                <p className="mt-4 text-sm font-black text-[#183F3D]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#EEF4F2] py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="relative min-h-[420px] overflow-hidden rounded-md">
            <Image src="/industries/consumer-goods.png" alt="Commercial fleet serving distribution operations" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>
          <div className="self-center">
            <p className="text-sm font-bold uppercase text-[#188463]">Industries We Serve</p>
            <h2 className="mt-3 text-3xl font-black text-[#0D4A47] sm:text-4xl">Built for fleets that keep business moving.</h2>
            <div className="mt-8 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {industries.map((industry) => (
                <div key={industry} className="flex items-start gap-3 text-sm font-semibold text-[#496462]">
                  <FiCheck className="mt-0.5 shrink-0 text-[#24A47B]" size={18} /> {industry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase text-[#188463]">Technology & Intelligence</p>
              <h2 className="mt-3 text-3xl font-black text-[#0D4A47] sm:text-4xl">Simple to use. Actionable by design. Ready to scale.</h2>
              <p className="mt-5 max-w-xl leading-8 text-[#5B706E]">GPS, telematics, cloud technology, mobile access and analytics work together to give teams one reliable operating picture.</p>
              <div className="mt-8 flex flex-wrap gap-2">
                {["GPS", "Telematics", "Cloud", "Mobile", "Analytics"].map((item) => <span key={item} className="rounded-md border border-[#BFD9D3] px-4 py-2 text-sm font-bold text-[#0D4A47]">{item}</span>)}
              </div>
            </div>
            <div className="rounded-md bg-[#0D4A47] p-7 text-white sm:p-9">
              <p className="text-sm font-bold uppercase text-[#65D4B0]">Beyond Traditional GPS</p>
              <h3 className="mt-3 text-2xl font-black">From location to fleet intelligence.</h3>
              <div className="mt-7 space-y-4 text-sm leading-6 text-white/80">
                <p><strong className="text-white">Traditional GPS:</strong> Location, alerts and reports.</p>
                <p><strong className="text-white">SmartTracker:</strong> Track, analyze, control, optimize and continuously improve.</p>
              </div>
              <p className="mt-7 border-t border-white/20 pt-6 text-sm leading-7 text-white/75">Know where every vehicle is, how it is used, what it costs, how the driver performs and how efficiently the fleet operates.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F4F8F7] py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <p className="text-sm font-bold uppercase text-[#188463]">Business Model</p>
              <h2 className="mt-3 text-3xl font-black text-[#0D4A47] sm:text-4xl">Flexible recurring services that grow with the fleet.</h2>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {["Tracking hardware", "Professional installation", "Platform subscriptions", "Fuel & maintenance tools", "Enterprise integrations", "APIs & customization"].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-semibold text-[#4D6362]"><FiCheck className="text-[#24A47B]" />{item}</div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-[#188463]">Who We Serve</p>
              <h2 className="mt-3 text-3xl font-black text-[#0D4A47] sm:text-4xl">From growing SMEs to complex enterprise fleets.</h2>
              <p className="mt-6 leading-8 text-[#5B706E]">Our customers want to reduce fuel costs, improve driver discipline, protect assets, increase delivery productivity, simplify maintenance and make decisions from dependable fleet data.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="border-l-4 border-[#24A47B] py-3 pl-6">
              <p className="text-sm font-bold uppercase text-[#188463]">Vision</p>
              <h2 className="mt-3 text-2xl font-black text-[#0D4A47]">To become Africa's leading Fleet Operating System for SMEs.</h2>
            </div>
            <div className="border-l-4 border-[#EF6B47] py-3 pl-6">
              <p className="text-sm font-bold uppercase text-[#C84E30]">Mission</p>
              <h2 className="mt-3 text-2xl font-black text-[#0D4A47]">Empower African businesses with intelligent fleet technology that improves control, efficiency and profitability.</h2>
            </div>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-md bg-[#DDEAE7] sm:grid-cols-3 lg:grid-cols-6">
            {values.map((value, index) => <div key={value} className="bg-white px-4 py-6"><span className="text-xs font-black text-[#24A47B]">0{index + 1}</span><p className="mt-2 text-sm font-black text-[#173F3D]">{value}</p></div>)}
          </div>
        </div>
      </section>

      <section className="bg-[#0D4A47] py-20 text-white lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase text-[#65D4B0]">Strategic Advantage</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black sm:text-4xl">A platform designed to evolve with the needs of African fleets.</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-md bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {evolution.map((item, index) => <div key={item} className="bg-[#0A3E3B] p-5"><span className="text-xs font-black text-[#65D4B0]">{String(index + 1).padStart(2, "0")}</span><p className="mt-2 font-bold">{item}</p></div>)}
          </div>
          <div className="mt-14 grid gap-7 border-t border-white/20 pt-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Phase 1", "Kenya", "Build the local operating foundation."],
              ["Phase 2", "East Africa", "Expand into Uganda, Tanzania and Rwanda."],
              ["Phase 3", "Africa", "Scale intelligent fleet operations continent-wide."],
              ["Phase 4", "Fleet Ecosystem", "Connect vehicles, drivers, fuel, maintenance, deliveries and business intelligence."],
            ].map(([phase, title, text]) => <div key={phase}><p className="text-xs font-black text-[#65D4B0]">{phase}</p><h3 className="mt-2 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-white/70">{text}</p></div>)}
          </div>
        </div>
      </section>

      <section className="py-20 text-center lg:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <FiActivity className="mx-auto text-[#EF6B47]" size={34} />
          <p className="mt-5 text-sm font-bold uppercase text-[#188463]">Our Brand Promise</p>
          <h2 className="mt-4 text-3xl font-black text-[#0D4A47] sm:text-5xl">Every vehicle. Every driver. Every cost. One intelligent platform.</h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#5B706E]">Move from guessing to knowing, reacting to predicting and fleet data to practical business intelligence.</p>
          <Link href="/company/contact-us" className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#0D4A47] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#176A64]">Start a conversation <FiChevronRight /></Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

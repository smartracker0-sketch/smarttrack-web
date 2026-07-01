"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "../landing/sections/Navbar";
import Footer from "../landing/sections/Footer";
import {
  FiCheck,
  FiX,
  FiArrowRight,
  FiShield,
  FiZap,
  FiTruck,
  FiHeadphones,
  FiTrendingUp,
} from "react-icons/fi";

const BRAND = {
  primary: "#0D4A47",
  dark: "#0A3835",
  deeper: "#072E2C",
  light: "#E8F4F3",
  muted: "#B2D4D2",
  cta: "#F97316",
  ctaHover: "#EA6A0A",
  accent: "#1A7A75",
  surface: "#FFFFFF",
};

const TIERS = [
  {
    id: "starter",
    name: "Starter",
    icon: FiZap,
    description: "For small fleets getting started with GPS tracking.",
    monthly: 49,
    annual: 39,
    devices: 10,
    features: [
      "Real-time GPS tracking",
      "Trip history (30 days)",
      "Geofence alerts",
      "Mobile app access",
      "Email support",
    ],
    unavailable: [
      "Video telematics",
      "Fuel monitoring",
      "Driver scorecards",
      "Dedicated account manager",
    ],
    cta: "Start 14-day trial",
    popular: false,
  },
  {
    id: "growth",
    name: "Growth",
    icon: FiTruck,
    description: "For growing fleets that need advanced visibility and safety.",
    monthly: 99,
    annual: 79,
    devices: 50,
    features: [
      "Everything in Starter",
      "Video telematics (dashcam)",
      "Fuel monitoring & theft alerts",
      "Driver scorecards",
      "Maintenance scheduling",
      "SOS & panic alerts",
      "Priority chat support",
    ],
    unavailable: ["Dedicated account manager", "Custom SLA"],
    cta: "Start 14-day trial",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: FiShield,
    description: "For large fleets with custom compliance and integration needs.",
    monthly: null,
    annual: null,
    devices: "Unlimited",
    features: [
      "Everything in Growth",
      "Unlimited devices & users",
      "API access & webhooks",
      "White-label options",
      "Custom integrations",
      "Dedicated account manager",
      "24/7 phone support",
      "Custom SLA",
    ],
    unavailable: [],
    cta: "Talk to sales",
    popular: false,
  },
];

const COMPARISON_FEATURES = [
  { name: "Real-time GPS tracking", starter: true, growth: true, enterprise: true },
  { name: "Trip history", starter: "30 days", growth: "90 days", enterprise: "Unlimited" },
  { name: "Geofence alerts", starter: true, growth: true, enterprise: true },
  { name: "Mobile app access", starter: true, growth: true, enterprise: true },
  { name: "Video telematics", starter: false, growth: true, enterprise: true },
  { name: "Fuel monitoring", starter: false, growth: true, enterprise: true },
  { name: "Driver scorecards", starter: false, growth: true, enterprise: true },
  { name: "Maintenance scheduling", starter: false, growth: true, enterprise: true },
  { name: "API access & webhooks", starter: false, growth: false, enterprise: true },
  { name: "Dedicated account manager", starter: false, growth: false, enterprise: true },
  { name: "Custom SLA", starter: false, growth: false, enterprise: true },
];

const FAQS = [
  {
    question: "Can I switch plans at any time?",
    answer:
      "Yes. You can upgrade or downgrade from your billing dashboard at any time. Changes take effect on your next billing cycle.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Every plan includes a 14-day free trial with full access to the features in that plan. No credit card required to start.",
  },
  {
    question: "Do I need to buy GPS devices from you?",
    answer:
      "No. Smart Tracker works with most standard GPS trackers. We also offer discounted hardware bundles for annual subscriptions.",
  },
  {
    question: "What happens after I exceed my device limit?",
    answer:
      "We'll prompt you to upgrade before you hit the limit. Enterprise plans include unlimited devices and users.",
  },
  {
    question: "Is my data secure?",
    answer:
      "All data is encrypted in transit and at rest. We operate out of regional data centers and are SOC 2 compliant.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "We cut fuel theft by 40% in the first quarter. The ROI paid for the subscription within two months.",
    author: "Adeyemi O.",
    role: "Fleet Manager, Lagos Logistics",
  },
  {
    quote:
      "The video telematics feature saved us from two false accident claims. It is now non-negotiable for our fleet.",
    author: "Chioma N.",
    role: "Operations Director, Swift Haulage",
  },
];

function Check() {
  return <FiCheck size={18} style={{ color: BRAND.accent }} />;
}

function Cross() {
  return <FiX size={18} style={{ color: "#9CA3AF" }} />;
}

function PricingCard({ tier, annual }: { tier: typeof TIERS[0]; annual: boolean }) {
  const isEnterprise = tier.monthly === null;
  const price = isEnterprise ? null : annual ? tier.annual : tier.monthly;
  const period = isEnterprise ? "" : annual ? "/month, billed annually" : "/month";

  return (
    <div
      className="relative flex flex-col rounded-2xl p-6 sm:p-8 transition-transform hover:-translate-y-1"
      style={{
        background: BRAND.surface,
        border: tier.popular ? `2px solid ${BRAND.cta}` : "1px solid #C5E0DE",
        boxShadow: tier.popular ? "0 20px 40px rgba(13,74,71,0.12)" : "0 4px 20px rgba(13,74,71,0.05)",
      }}
    >
      {tier.popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white"
          style={{ background: BRAND.cta }}
        >
          Most Popular
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: BRAND.light }}
        >
          <tier.icon size={20} style={{ color: BRAND.primary }} />
        </div>
        <h3 className="text-xl font-bold" style={{ color: BRAND.dark }}>
          {tier.name}
        </h3>
      </div>

      <p className="text-sm mb-6 min-h-[40px]" style={{ color: "#4B5563" }}>
        {tier.description}
      </p>

      <div className="mb-6">
        {isEnterprise ? (
          <div className="text-3xl font-bold" style={{ color: BRAND.dark }}>
            Custom
          </div>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold" style={{ color: BRAND.dark }}>
              ${price}
            </span>
            <span className="text-sm" style={{ color: "#6B7280" }}>
              {period}
            </span>
          </div>
        )}
        <div className="text-sm mt-2 font-medium" style={{ color: BRAND.accent }}>
          Up to {tier.devices} devices
        </div>
      </div>

      <Link
        href={isEnterprise ? "#demo" : "/login"}
        className="mb-8 w-full text-center py-3 rounded-full font-bold text-white transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
        style={{ background: tier.popular ? BRAND.cta : BRAND.primary }}
      >
        {tier.cta}
        <FiArrowRight size={16} />
      </Link>

      <ul className="space-y-3 mb-6 flex-1">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm" style={{ color: BRAND.dark }}>
            <span className="mt-0.5 flex-shrink-0">
              <Check />
            </span>
            {feature}
          </li>
        ))}
        {tier.unavailable.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm" style={{ color: "#9CA3AF" }}>
            <span className="mt-0.5 flex-shrink-0">
              <Cross />
            </span>
            <span className="line-through">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="min-h-screen" style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <Navbar />

      <main>
        {/* Hero */}
        <section
          className="relative text-center px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 overflow-hidden"
          style={{ background: "radial-gradient(ellipse at 60% 40%, #1A7A75 0%, #0D4A47 50%, #072E2C 100%)" }}
        >
          {/* Animated grid background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="pricing-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#pricing-grid)" />
            </svg>
            <div className="absolute top-1/4 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "#1A7A75" }} />
            <div className="absolute bottom-1/4 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "#F97316" }} />
          </div>

          <div className="relative max-w-4xl mx-auto pt-28 sm:pt-32">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: "rgba(255,255,255,0.15)", color: "#B2D4D2" }}>
              <FiTrendingUp size={14} />
              Trusted by 500+ fleets across Africa
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
              Simple pricing for every fleet size
            </h1>
            <p className="text-base sm:text-lg max-w-2xl mx-auto mb-10" style={{ color: "#B2D4D2" }}>
              Start free, scale as you grow. No hidden fees, no long-term contracts, and every plan includes real-time tracking, alerts, and mobile access.
            </p>

            {/* Toggle */}
            <div className="inline-flex items-center gap-4 p-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.12)" }}>
              <button
                onClick={() => setAnnual(false)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? "text-white" : "text-white/70 hover:text-white"}`}
                style={!annual ? { background: BRAND.accent } : {}}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${annual ? "text-white" : "text-white/70 hover:text-white"}`}
                style={annual ? { background: BRAND.accent } : {}}
              >
                Annual
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: BRAND.cta, color: "white" }}>
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 pb-20 sm:pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {TIERS.map((tier) => (
              <PricingCard key={tier.id} tier={tier} annual={annual} />
            ))}
          </div>

          <p className="text-center text-sm mt-8" style={{ color: "#6B7280" }}>
            All prices in USD. Local billing available for Nigerian customers.
          </p>
        </section>

        {/* Comparison Table */}
        <section className="py-16 sm:py-20" style={{ background: BRAND.light }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12" style={{ color: BRAND.dark }}>
              Compare plans
            </h2>
            <div className="overflow-x-auto rounded-2xl border shadow-sm" style={{ background: BRAND.surface, borderColor: "#C5E0DE" }}>
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr style={{ background: BRAND.primary }}>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-white">Feature</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-white">Starter</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-white">Growth</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold text-white">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((feature, idx) => (
                    <tr key={feature.name} style={{ borderTop: "1px solid #E8F4F3", background: idx % 2 === 0 ? "white" : "#FAFDFD" }}>
                      <td className="px-6 py-4 text-sm font-medium" style={{ color: BRAND.dark }}>
                        {feature.name}
                      </td>
                      <td className="px-6 py-4 text-center text-sm" style={{ color: "#4B5563" }}>
                        {typeof feature.starter === "boolean" ? (feature.starter ? <Check /> : <Cross />) : feature.starter}
                      </td>
                      <td className="px-6 py-4 text-center text-sm" style={{ color: "#4B5563" }}>
                        {typeof feature.growth === "boolean" ? (feature.growth ? <Check /> : <Cross />) : feature.growth}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-semibold" style={{ color: BRAND.accent }}>
                        {typeof feature.enterprise === "boolean" ? (feature.enterprise ? <Check /> : <Cross />) : feature.enterprise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 sm:py-20" style={{ background: BRAND.surface }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12" style={{ color: BRAND.dark }}>
              Fleets that switched never looked back
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TESTIMONIALS.map((t) => (
                <div
                  key={t.author}
                  className="rounded-2xl p-6 sm:p-8"
                  style={{ background: BRAND.light, border: "1px solid #C5E0DE" }}
                >
                  <p className="text-base sm:text-lg mb-6 italic" style={{ color: BRAND.dark }}>
                    "{t.quote}"
                  </p>
                  <div>
                    <div className="font-bold text-sm" style={{ color: BRAND.dark }}>
                      {t.author}
                    </div>
                    <div className="text-xs" style={{ color: "#6B7280" }}>
                      {t.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-20" style={{ background: BRAND.light }}>
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12" style={{ color: BRAND.dark }}>
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {FAQS.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-xl p-5 sm:p-6"
                  style={{ background: BRAND.surface, border: "1px solid #C5E0DE" }}
                >
                  <h3 className="font-bold text-sm sm:text-base mb-2" style={{ color: BRAND.dark }}>
                    {faq.question}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-20" style={{ background: BRAND.deeper }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              Ready to take control of your fleet?
            </h2>
            <p className="text-base sm:text-lg mb-8" style={{ color: "#B2D4D2" }}>
              Join 500+ fleets tracking vehicles, cutting fuel costs, and improving driver safety today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="px-8 py-3.5 rounded-full font-bold text-white transition-all hover:brightness-110 active:scale-95 flex items-center gap-2"
                style={{ background: BRAND.cta }}
              >
                Start your free trial
                <FiArrowRight size={18} />
              </Link>
              <a
                href="#demo"
                className="px-8 py-3.5 rounded-full font-bold transition-all hover:bg-white/10 flex items-center gap-2"
                style={{ border: "1px solid #B2D4D2", color: "#B2D4D2" }}
              >
                <FiHeadphones size={18} />
                Talk to sales
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

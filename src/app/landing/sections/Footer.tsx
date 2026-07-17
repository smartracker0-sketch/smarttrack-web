"use client";

import Link from "next/link";
import Image from "next/image";
import { FiTwitter, FiLinkedin, FiFacebook, FiYoutube } from "react-icons/fi";

const PRODUCTS = [
  { label: "Fleet Management", href: "/products/fleet-management" },
  { label: "Video Telematics", href: "/products/video-telematics" },
  { label: "Fuel Monitoring", href: "/products/fuel-monitoring" },
  { label: "EV Management", href: "/products/ev-management" },
  { label: "E-Lock", href: "/products/e-lock" },
  { label: "EagleAI", href: "/products/eagleai" },
];

const COMPANY = [
  { label: "About Us", href: "/company/about-us" },
  { label: "Careers", href: "/company/careers" },
  { label: "Blog", href: "/resources/blog" },
  { label: "Contact Us", href: "/company/contact-us" },
];

export default function Footer() {
  return (
    <footer style={{ background: "#072E2C" }}>
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Col 1: Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo.png"
                alt="Smart Tracker Telematics"
                width={44}
                height={44}
                className="rounded-full flex-shrink-0"
              />
              <span className="font-bold text-white text-sm leading-tight">
                Smart Tracker<br />
                <span className="font-normal text-xs" style={{ color: '#B2D4D2' }}>Telematics</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: '#B2D4D2' }}>
              The all-in-one fleet intelligence platform trusted by enterprises across 50+ countries.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { Icon: FiTwitter, label: "X / Twitter" },
                { Icon: FiLinkedin, label: "LinkedIn" },
                { Icon: FiFacebook, label: "Facebook" },
                { Icon: FiYoutube, label: "YouTube" },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center hover:text-white hover:bg-white/10 transition-colors" style={{ color: '#B2D4D2' }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Products */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Products</h4>
            <ul className="space-y-3">
              {PRODUCTS.map((p) => (
                <li key={p.label}>
                  <Link
                    href={p.href}
                    className="text-sm hover:text-white transition-colors" style={{ color: '#B2D4D2' }}
                  >
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Company</h4>
            <ul className="space-y-3">
              {COMPANY.map((c) => (
                <li key={c.label}>
                  <Link
                    href={c.href}
                    className="text-sm hover:text-white transition-colors" style={{ color: '#B2D4D2' }}
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Contact + App badges */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Contact</h4>
            <ul className="space-y-3 text-sm" style={{ color: '#B2D4D2' }}>
              <li>
                <a href="mailto:hello@smarttracker.io" className="hover:text-white transition-colors" style={{ color: 'inherit' }}>
                  hello@smarttracker.io
                </a>
              </li>
              <li>+234 800 SMART TRACK</li>
              <li className="leading-relaxed">
                Plot 42, Admiralty Way,<br />
                Lekki Phase 1, Lagos, Nigeria
              </li>
            </ul>
            {/* App store badges (placeholder) */}
            <div className="mt-6 flex flex-col gap-2">
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-semibold hover:bg-white/10 transition-colors" style={{ border: '1px solid rgba(26,122,117,0.4)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                Download on App Store
              </a>
              <a
                href="#"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-semibold hover:bg-white/10 transition-colors" style={{ border: '1px solid rgba(26,122,117,0.4)' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M3.18 23.76c.2.11.43.14.64.09L13 13.36 6.12 6.48 3.18 23.76zm17.16-12.54c-.36-.54-.9-.9-1.56-.9h-.06L5.34 4.08l6.84 6.84 8.16-3.7zM3.54.24C3.24.39 3 .72 3 1.14v21.72c0 .42.24.75.54.9l.12.06L13.62 13.8l.12-.12L3.66.18l-.12.06z" />
                </svg>
                Get it on Google Play
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t px-4 sm:px-6 lg:px-8 py-5"
        style={{ borderColor: "rgba(26,122,117,0.25)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: '#B2D4D2' }}>
          <span>© {new Date().getFullYear()} Smart Tracker Telematics. All rights reserved.</span>
          <div className="flex gap-5">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

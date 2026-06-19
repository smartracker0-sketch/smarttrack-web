"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";

const NAV_ITEMS = [
  {
    label: "Products",
    items: ["Fleet Management", "Video Telematics", "Fuel Monitoring", "EV Management", "E-Lock", "EagleAI"],
  },
  {
    label: "Solutions",
    items: ["Transportation", "Oil & Gas", "Construction", "Pharmaceutical", "Emergency Services", "Passenger Transit", "Food & Beverage", "Logistics"],
  },
  {
    label: "Resources",
    items: ["Blog", "FAQs", "Partner With Us", "API Docs"],
  },
  {
    label: "Company",
    items: ["About Us", "Contact Us", "Careers"],
  },
];

function DropdownMenu({ items }: { items: string[] }) {
  return (
    <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-2xl py-2 z-50" style={{ border: "1px solid #E8F4F3" }}>
      {items.map((item) => (
        <a
          key={item}
          href="#"
          className="block px-4 py-2.5 text-sm font-medium transition-colors"
          style={{ color: "#0D4A47" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#E8F4F3"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
        >
          {item}
        </a>
      ))}
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(label);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "shadow-lg" : "bg-transparent"
      }`}
      style={scrolled ? { background: "#0D4A47" } : {}}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/logo.png"
              alt="Smart Tracker Telematics"
              width={40}
              height={40}
              className="rounded-full ring-2 ring-white/30 flex-shrink-0"
            />
            <span className="font-bold text-sm lg:text-base leading-tight text-white">
              Smart Tracker<br />
              <span className="font-normal text-xs opacity-80">Telematics</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scrolled
                      ? "text-white/90 hover:text-white hover:bg-white/10"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                  <FiChevronDown
                    size={14}
                    className={`transition-transform ${openDropdown === item.label ? "rotate-180" : ""}`}
                  />
                </button>
                {openDropdown === item.label && <DropdownMenu items={item.items} />}
              </div>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-full text-sm font-semibold border border-white/60 text-white hover:bg-white/10 transition-colors"
            >
              Login
            </Link>
            <a
              href="#demo"
              className="px-5 py-2 rounded-full text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
              style={{ background: "#F97316" }}
            >
              Request a Demo
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg transition-colors text-white"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t shadow-xl" style={{ background: "#0D4A47", borderColor: "#1A7A75" }}>
          <div className="px-4 py-4 space-y-1">
            {NAV_ITEMS.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-bold uppercase tracking-wider px-3 pt-3 pb-1" style={{ color: "#B2D4D2" }}>
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="block px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item}
                  </a>
                ))}
              </div>
            ))}
            <div className="pt-4 flex flex-col gap-2 mt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
              <Link
                href="/login"
                className="text-center px-4 py-2.5 rounded-full text-sm font-semibold border border-white/40 text-white"
              >
                Login
              </Link>
              <a
                href="#demo"
                className="text-center px-4 py-2.5 rounded-full text-sm font-bold text-white"
                style={{ background: "#F97316" }}
              >
                Request a Demo
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

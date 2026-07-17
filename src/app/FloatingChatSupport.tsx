"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMessageCircle, FiMail, FiPhone, FiX } from "react-icons/fi";

const hiddenPrefixes = ["/admin", "/app"];

export default function FloatingChatSupport() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div className="w-[min(calc(100vw-2.5rem),340px)] overflow-hidden rounded-lg border border-[#C5E0DE] bg-white shadow-2xl">
          <div className="bg-[#071E1C] p-4 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-black">Smart Tracker Support</div>
                <p className="mt-1 text-xs leading-5 text-[#B2D4D2]">
                  Need help choosing a plan, tracking a fleet, or setting up devices?
                </p>
              </div>
              <button
                aria-label="Close support chat"
                className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          <div className="grid gap-2 p-3">
            <Link
              href="/company/contact-us"
              className="flex items-center gap-3 rounded-md border border-gray-200 p-3 transition hover:border-[#1A7A75] hover:bg-[#E8F4F3]"
              onClick={() => setOpen(false)}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F4F3] text-[#0D4A47]">
                <FiMessageCircle size={18} />
              </span>
              <span>
                <span className="block text-sm font-black text-[#0D4A47]">Chat with support</span>
                <span className="block text-xs text-gray-500">Send your request to our team</span>
              </span>
            </Link>

            <a
              href="mailto:hello@smarttracker.io"
              className="flex items-center gap-3 rounded-md border border-gray-200 p-3 transition hover:border-[#1A7A75] hover:bg-[#E8F4F3]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F4F3] text-[#0D4A47]">
                <FiMail size={18} />
              </span>
              <span>
                <span className="block text-sm font-black text-[#0D4A47]">Email us</span>
                <span className="block text-xs text-gray-500">hello@smarttracker.io</span>
              </span>
            </a>

            <a
              href="tel:+2348007627887225"
              className="flex items-center gap-3 rounded-md border border-gray-200 p-3 transition hover:border-[#1A7A75] hover:bg-[#E8F4F3]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F4F3] text-[#0D4A47]">
                <FiPhone size={18} />
              </span>
              <span>
                <span className="block text-sm font-black text-[#0D4A47]">Call sales</span>
                <span className="block text-xs text-gray-500">+234 800 SMART TRACK</span>
              </span>
            </a>
          </div>
        </div>
      )}

      <button
        aria-label={open ? "Close support chat" : "Open support chat"}
        aria-expanded={open}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-[#F97316] text-white shadow-2xl shadow-orange-900/30 transition hover:bg-[#EA6A0A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F97316]"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="absolute h-14 w-14 rounded-full bg-[#F97316] opacity-30 transition group-hover:scale-125" />
        {open ? <FiX className="relative" size={24} /> : <FiMessageCircle className="relative" size={25} />}
      </button>
    </div>
  );
}

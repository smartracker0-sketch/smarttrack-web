"use client";

import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import VideoTelematics from "./sections/VideoTelematics";
import FeatureShowcase from "./sections/FeatureShowcase";
import IndustriesGrid from "./sections/IndustriesGrid";
import Testimonials from "./sections/Testimonials";
import StatsBanner from "./sections/StatsBanner";
import CTABanner from "./sections/CTABanner";
import Footer from "./sections/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <Navbar />
      <Hero />
      <VideoTelematics />
      <FeatureShowcase />
      <IndustriesGrid />
      <Testimonials />
      <StatsBanner />
      <CTABanner />
      <Footer />
    </div>
  );
}

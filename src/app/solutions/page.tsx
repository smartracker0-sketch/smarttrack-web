import type { Metadata } from "next";
import { navSections } from "../navContent";
import { NavSectionLanding } from "../navPageComponents";

export const metadata: Metadata = {
  title: "Solutions | Smart Tracker Telematics",
  description: "Smart Tracker fleet intelligence solutions for transportation, oil and gas, construction, logistics, healthcare, transit, and more.",
};

export default function SolutionsPage() {
  return <NavSectionLanding section={navSections.find((section) => section.key === "solutions")!} />;
}

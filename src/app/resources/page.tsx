import type { Metadata } from "next";
import { navSections } from "../navContent";
import { NavSectionLanding } from "../navPageComponents";

export const metadata: Metadata = {
  title: "Resources | Smart Tracker Telematics",
  description: "Read Smart Tracker resources, FAQs, partner information, and API documentation guidance.",
};

export default function ResourcesPage() {
  return <NavSectionLanding section={navSections.find((section) => section.key === "resources")!} />;
}

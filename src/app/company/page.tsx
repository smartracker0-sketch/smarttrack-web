import type { Metadata } from "next";
import { navSections } from "../navContent";
import { NavSectionLanding } from "../navPageComponents";

export const metadata: Metadata = {
  title: "Company | Smart Tracker Telematics",
  description: "Learn about Smart Tracker, contact the team, and explore careers.",
};

export default function CompanyPage() {
  return <NavSectionLanding section={navSections.find((section) => section.key === "company")!} />;
}

import type { Metadata } from "next";
import { navSections } from "../navContent";
import { NavSectionLanding } from "../navPageComponents";

export const metadata: Metadata = {
  title: "Products | Smart Tracker Telematics",
  description: "Explore Smart Tracker fleet management, video telematics, fuel monitoring, EV management, e-lock, and EagleAI products.",
};

export default function ProductsPage() {
  return <NavSectionLanding section={navSections.find((section) => section.key === "products")!} />;
}

export type NavSectionKey = "products" | "solutions" | "resources" | "company";

export type NavPage = {
  label: string;
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  highlights: string[];
  outcomes: string[];
};

export type NavSection = {
  key: NavSectionKey;
  label: string;
  href: string;
  eyebrow: string;
  title: string;
  summary: string;
  pages: NavPage[];
};

export const navSections: NavSection[] = [
  {
    key: "products",
    label: "Products",
    href: "/products",
    eyebrow: "Smart Tracker products",
    title: "Everything you need to operate a safer, smarter fleet.",
    summary:
      "Explore the Smart Tracker product suite: live fleet management, AI video telematics, fuel intelligence, EV visibility, e-lock control, and EagleAI automation.",
    pages: [
      {
        label: "Fleet Management",
        slug: "fleet-management",
        eyebrow: "Core platform",
        title: "Fleet management that keeps every vehicle, trip, and alert in view.",
        summary:
          "Track assets in real time, replay trips, monitor routes, manage vehicle records, and give operations teams one source of truth for daily fleet decisions.",
        highlights: ["Live map and vehicle status", "Trip replay and history", "Maintenance and document records", "Custom alerts by vehicle or group"],
        outcomes: ["Reduce blind spots across active fleets", "Respond faster to exceptions", "Keep operational records in one dashboard"],
      },
      {
        label: "Video Telematics",
        slug: "video-telematics",
        eyebrow: "AI safety",
        title: "AI dashcams that detect risk before it becomes an incident.",
        summary:
          "Combine road-facing, cabin, and event-triggered video with driver alerts, cloud evidence, and manager workflows for safer journeys.",
        highlights: ["Forward collision and fatigue detection", "Phone-use and distraction alerts", "Cloud clips tied to GPS location", "Driver coaching and incident review"],
        outcomes: ["Prevent avoidable incidents", "Resolve claims with evidence", "Improve driver behaviour with context"],
      },
      {
        label: "Fuel Monitoring",
        slug: "fuel-monitoring",
        eyebrow: "Cost control",
        title: "Turn fuel activity into clear savings and accountability.",
        summary:
          "Monitor levels, consumption, idle waste, and anomaly patterns so your team can detect pilferage and reward efficient driving.",
        highlights: ["Real-time fuel level monitoring", "Pilferage and anomaly alerts", "Idle fuel waste reporting", "Vehicle-level ROI dashboards"],
        outcomes: ["Lower fuel spend", "Catch suspicious losses quickly", "Build trusted fuel reports for finance"],
      },
      {
        label: "EV Management",
        slug: "ev-management",
        eyebrow: "Electric fleets",
        title: "Manage EV readiness, usage, and route performance.",
        summary:
          "Bring electric vehicles into the same operating view with status, utilisation, charging readiness, and dispatch visibility.",
        highlights: ["EV fleet visibility", "Usage and uptime monitoring", "Route and service planning", "Mixed-fleet reporting"],
        outcomes: ["Improve EV availability", "Plan routes with more confidence", "Compare EV and ICE fleet performance"],
      },
      {
        label: "E-Lock",
        slug: "e-lock",
        eyebrow: "Cargo protection",
        title: "Secure cargo movement with electronic lock visibility.",
        summary:
          "Track lock status, route movement, and events so high-value shipments stay protected from origin to destination.",
        highlights: ["Lock and unlock status", "Cargo-route event history", "Tamper notifications", "Geofence-based cargo controls"],
        outcomes: ["Reduce cargo theft risk", "Improve shipment accountability", "Escalate tamper events faster"],
      },
      {
        label: "EagleAI",
        slug: "eagleai",
        eyebrow: "Automation intelligence",
        title: "AI assistance for fleet decisions, risk signals, and operational insight.",
        summary:
          "Use EagleAI to surface exceptions, summarize fleet activity, and help teams understand what needs attention first.",
        highlights: ["Risk and anomaly summaries", "Fleet activity intelligence", "Operational recommendations", "Manager-ready insights"],
        outcomes: ["Focus teams on the highest-impact work", "Reduce manual report review", "Improve decision speed"],
      },
    ],
  },
  {
    key: "solutions",
    label: "Solutions",
    href: "/solutions",
    eyebrow: "Industry solutions",
    title: "Fleet intelligence for every operating model.",
    summary:
      "Smart Tracker adapts to transporters, energy operators, construction teams, healthcare logistics, emergency fleets, transit operators, food distributors, and logistics networks.",
    pages: [
      {
        label: "Transportation",
        slug: "transportation",
        eyebrow: "Transport operations",
        title: "Run safer passenger and commercial transportation with live fleet control.",
        summary:
          "Track vehicles, protect routes, coach drivers, and give dispatchers the visibility needed to reduce service delays.",
        highlights: ["Live route monitoring", "Driver safety scorecards", "Trip history and reports", "Service exception alerts"],
        outcomes: ["Improve route reliability", "Reduce risk events", "Make dispatch decisions faster"],
      },
      {
        label: "Oil & Gas",
        slug: "oil-gas",
        eyebrow: "Energy fleets",
        title: "Protect tankers, field assets, fuel activity, and remote crews.",
        summary:
          "Monitor high-value energy assets with geofences, route compliance, fuel anomaly detection, and safety alerts.",
        highlights: ["Depot and refinery geofences", "Fuel drainage alerts", "Tanker route replay", "Remote-site visibility"],
        outcomes: ["Reduce diversion risk", "Improve field response", "Create clear movement audit trails"],
      },
      {
        label: "Construction",
        slug: "construction",
        eyebrow: "Site visibility",
        title: "Track equipment, service vehicles, and site movement.",
        summary:
          "Know where expensive machines and site vehicles are, how they are used, and when they need attention.",
        highlights: ["Job-site geofences", "After-hours movement alerts", "Idle and utilisation reports", "Maintenance planning"],
        outcomes: ["Reduce equipment misuse", "Improve utilisation", "Plan service work from real activity"],
      },
      {
        label: "Pharmaceutical",
        slug: "pharmaceutical",
        eyebrow: "Medical logistics",
        title: "Protect sensitive healthcare deliveries with route accountability.",
        summary:
          "Track medicine, lab, and healthcare delivery fleets with evidence-backed movement records and exception alerts.",
        highlights: ["Hospital and pharmacy geofences", "Route deviation alerts", "Delivery trip history", "Compliance-ready records"],
        outcomes: ["Improve shipment accountability", "Investigate exceptions faster", "Support audit and customer service needs"],
      },
      {
        label: "Emergency Services",
        slug: "emergency-services",
        eyebrow: "Response fleets",
        title: "Give dispatch teams live visibility into emergency vehicles.",
        summary:
          "Locate the closest capable vehicle, review response movement, and keep critical assets ready for service.",
        highlights: ["Live response map", "Offline-device alerts", "Incident route replay", "Vehicle readiness records"],
        outcomes: ["Improve dispatch speed", "Strengthen incident accountability", "Reduce readiness gaps"],
      },
      {
        label: "Passenger Transit",
        slug: "passenger-transit",
        eyebrow: "Transit reliability",
        title: "Improve passenger service with route, delay, and safety visibility.",
        summary:
          "Track buses and shuttles, review route performance, and coach safer driving across public or private transit fleets.",
        highlights: ["Route adherence monitoring", "Passenger-service reporting", "Driver behaviour alerts", "Maintenance visibility"],
        outcomes: ["Improve service reliability", "Reduce unsafe driving", "Plan schedules from route data"],
      },
      {
        label: "Food & Beverage",
        slug: "food-beverage",
        eyebrow: "Delivery windows",
        title: "Protect fresh deliveries with route and stop visibility.",
        summary:
          "Monitor refrigerated and delivery fleets so delays, long idle time, and route deviations are visible early.",
        highlights: ["Depot and customer geofences", "Delivery stop history", "Idle alerts", "Vehicle service records"],
        outcomes: ["Improve delivery predictability", "Reduce avoidable delays", "Answer customer questions faster"],
      },
      {
        label: "Logistics",
        slug: "logistics",
        eyebrow: "Supply chain execution",
        title: "Coordinate dispatch, routes, and exceptions across logistics fleets.",
        summary:
          "Give dispatchers a real-time fleet view and the route evidence needed to improve delivery execution.",
        highlights: ["Live dispatch map", "Route replay", "Delivery exception alerts", "Fleet utilisation reporting"],
        outcomes: ["Reduce delivery blind spots", "Resolve disputes with data", "Improve fleet productivity"],
      },
    ],
  },
  {
    key: "resources",
    label: "Resources",
    href: "/resources",
    eyebrow: "Learn and build",
    title: "Guides, answers, partnership paths, and developer resources.",
    summary:
      "Find practical fleet guidance, platform answers, partner information, and API resources for teams building with Smart Tracker.",
    pages: [
      {
        label: "Blog",
        slug: "blog",
        eyebrow: "Insights",
        title: "Fleet intelligence insights from the Smart Tracker team.",
        summary:
          "Read practical articles about telematics, fuel savings, driver safety, route visibility, and fleet operations.",
        highlights: ["Fleet operations guides", "Safety and driver coaching ideas", "Fuel and cost-control tips", "Industry-specific playbooks"],
        outcomes: ["Learn best practices", "Spot improvement opportunities", "Share ideas with your team"],
      },
      {
        label: "FAQs",
        slug: "faqs",
        eyebrow: "Answers",
        title: "Frequently asked questions about Smart Tracker.",
        summary:
          "Get quick answers about devices, tracking, alerts, dashboards, deployment, integrations, and support.",
        highlights: ["Platform setup", "Device activation", "Billing and plans", "Support and troubleshooting"],
        outcomes: ["Reduce uncertainty", "Plan your rollout", "Find the right next step quickly"],
      },
      {
        label: "Partner With Us",
        slug: "partner-with-us",
        eyebrow: "Partnerships",
        title: "Grow with Smart Tracker as a reseller, installer, or solution partner.",
        summary:
          "Partner with Smart Tracker to deliver telematics, safety, and fleet intelligence to more organisations.",
        highlights: ["Reseller opportunities", "Installer partnerships", "Fleet solution bundles", "Sales and technical enablement"],
        outcomes: ["Expand your offering", "Serve fleet customers better", "Build recurring revenue"],
      },
      {
        label: "API Docs",
        slug: "api-docs",
        eyebrow: "Developers",
        title: "Build fleet workflows with Smart Tracker APIs.",
        summary:
          "Connect tracking, alerts, devices, telemetry, and fleet records into your internal tools and customer workflows.",
        highlights: ["Authentication and devices", "Telemetry and alerts", "Fleet records", "Webhook-ready workflows"],
        outcomes: ["Integrate fleet data", "Automate operations", "Create custom customer experiences"],
      },
    ],
  },
  {
    key: "company",
    label: "Company",
    href: "/company",
    eyebrow: "About Smart Tracker",
    title: "Building safer, clearer fleet operations for modern teams.",
    summary:
      "Learn about Smart Tracker, get in touch, or explore opportunities to help build the future of fleet intelligence.",
    pages: [
      {
        label: "About Us",
        slug: "about-us",
        eyebrow: "Our mission",
        title: "We help fleets see clearly, act faster, and operate with confidence.",
        summary:
          "Smart Tracker brings tracking, safety, fuel, and fleet records into one practical platform for growing operations.",
        highlights: ["Fleet-first product thinking", "Safety and accountability", "Operational clarity", "Scalable telematics infrastructure"],
        outcomes: ["Know what we stand for", "Understand our platform approach", "See why teams choose Smart Tracker"],
      },
      {
        label: "Contact Us",
        slug: "contact-us",
        eyebrow: "Talk to us",
        title: "Reach the Smart Tracker team.",
        summary:
          "Speak with us about fleet tracking, video telematics, device rollout, enterprise needs, or partnership opportunities.",
        highlights: ["Sales conversations", "Product demos", "Support routing", "Partnership inquiries"],
        outcomes: ["Get the right contact path", "Plan a rollout", "Ask direct platform questions"],
      },
      {
        label: "Careers",
        slug: "careers",
        eyebrow: "Join the team",
        title: "Build fleet intelligence products that matter.",
        summary:
          "Join a team working on tracking, safety, AI, IoT, and operational tools for real-world fleets.",
        highlights: ["Product and engineering", "Operations and support", "Sales and partnerships", "Customer success"],
        outcomes: ["Explore future roles", "Understand our work", "Connect with the team"],
      },
    ],
  },
];

export function getNavSection(key: string) {
  return navSections.find((section) => section.key === key);
}

export function getNavPage(sectionKey: string, slug: string) {
  return getNavSection(sectionKey)?.pages.find((page) => page.slug === slug);
}

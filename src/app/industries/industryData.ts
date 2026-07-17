export type Industry = {
  slug: string;
  name: string;
  imageUrl: string;
  span: string;
  eyebrow: string;
  title: string;
  summary: string;
  challenges: string[];
  solutions: string[];
  workflow: string[];
  outcomes: string[];
  modules: string[];
};

export const industries: Industry[] = [
  {
    slug: "oil-gas",
    name: "Oil & Gas",
    imageUrl: "/industries/oil-gas.png",
    span: "col-span-2 row-span-1",
    eyebrow: "Energy fleet visibility",
    title: "Keep field assets, tankers, and crews visible from depot to destination.",
    summary:
      "Smart Tracker gives oil and gas operators live visibility over tanker trucks, service vehicles, remote field crews, and high-value equipment. Teams can monitor route compliance, unsafe stops, driver behaviour, fuel activity, and emergency events from one control room.",
    challenges: [
      "Long-distance tanker trips with high theft and diversion risk.",
      "Remote sites where delayed response can become expensive or unsafe.",
      "Fuel drainage, unauthorised stops, and driver behaviour incidents.",
      "Manual trip reporting across contractors, depots, and field teams.",
    ],
    solutions: [
      "Live GPS tracking with route replay for tanker and service fleets.",
      "Geofences around depots, pipelines, terminals, and restricted zones.",
      "Fuel monitoring and anomaly alerts for sudden drainage or low levels.",
      "Overspeed, harsh braking, idle, and night-driving alerts tied to scorecards.",
    ],
    workflow: [
      "Register vehicles, tankers, and support devices in Smart Tracker.",
      "Create depot, refinery, and route geofences for approved movement.",
      "Monitor live trips, alerts, and exceptions from the web dashboard.",
      "Review historical routes, driver scores, and fuel reports after each trip.",
    ],
    outcomes: [
      "Reduced loss from route deviation and unauthorised stops.",
      "Faster response to risky field events.",
      "Clear audit trails for trip, fuel, and driver compliance.",
    ],
    modules: ["Live tracking", "Geofences", "Fuel monitoring", "Driver scorecards", "Alerts"],
  },
  {
    slug: "supply-chain-logistics",
    name: "Supply Chain & Logistics",
    imageUrl: "/industries/logistics.png",
    span: "col-span-1 row-span-2",
    eyebrow: "Delivery operations",
    title: "Run dispatch, delivery visibility, and fleet exceptions from one map.",
    summary:
      "Smart Tracker helps logistics teams see where every vehicle is, what each driver is doing, and which deliveries need attention. It supports real-time tracking, customer updates, trip history, and operational alerts across regional and last-mile fleets.",
    challenges: [
      "Unclear ETA visibility across multiple depots and delivery zones.",
      "Drivers taking unauthorised routes or making unexpected stops.",
      "Manual proof of route and exception reporting.",
      "High fuel, maintenance, and downtime costs across active fleets.",
    ],
    solutions: [
      "Live fleet map for dispatch teams and operations managers.",
      "Route history for delivery audits and customer dispute resolution.",
      "Idle, overspeed, and offline-device alerts for exception handling.",
      "Maintenance, expenses, vendors, and documents in the same fleet system.",
    ],
    workflow: [
      "Add vehicles and assign them to depots, drivers, or organisations.",
      "Track active movements and identify late, idle, or offline vehicles.",
      "Use trip history to investigate delivery delays or route deviations.",
      "Use reports to improve driver behaviour and fleet utilisation.",
    ],
    outcomes: [
      "Better dispatch decisions with fewer blind spots.",
      "Lower operating cost through route and behaviour insights.",
      "Cleaner delivery audit records for customers and partners.",
    ],
    modules: ["Live map", "Trip history", "Alerts", "Maintenance", "Expense tracking"],
  },
  {
    slug: "emergency-services",
    name: "Emergency Services",
    imageUrl: "/industries/emergency-services.png",
    span: "col-span-1 row-span-1",
    eyebrow: "Response fleet control",
    title: "Know the closest unit, reduce response delays, and protect critical vehicles.",
    summary:
      "Smart Tracker supports ambulance, emergency response, and support fleets with live vehicle visibility, fast incident location, and operational status awareness. Control teams can monitor availability, movement, and route history during and after emergency response.",
    challenges: [
      "Dispatchers need to identify the closest available response unit quickly.",
      "Vehicle downtime and offline trackers reduce readiness.",
      "Emergency trips require reliable movement records after the fact.",
      "Unsafe driving needs to be detected without slowing response work.",
    ],
    solutions: [
      "Real-time map views for response vehicles and mobile units.",
      "Offline-device, overspeed, and harsh-driving alerts.",
      "Trip replay for incident review and operational accountability.",
      "Maintenance reminders for high-availability emergency assets.",
    ],
    workflow: [
      "Track response vehicles from dispatch to hospital or field site.",
      "Use live map context to assign the nearest capable unit.",
      "Capture route history and event data for post-incident reviews.",
      "Monitor readiness through device health and maintenance records.",
    ],
    outcomes: [
      "Faster dispatch decisions.",
      "Improved response accountability.",
      "Better readiness for critical fleet assets.",
    ],
    modules: ["Live tracking", "Device health", "Trip history", "Alerts", "Maintenance"],
  },
  {
    slug: "food-beverage",
    name: "Food & Beverage",
    imageUrl: "/industries/food-beverage.png",
    span: "col-span-1 row-span-1",
    eyebrow: "Fresh delivery tracking",
    title: "Protect delivery windows, refrigerated routes, and route accountability.",
    summary:
      "Smart Tracker helps food and beverage distributors monitor delivery vehicles, cold-chain routes, driver behaviour, and stop patterns. Teams can see late deliveries, route deviations, long idle time, and vehicle issues before customers are affected.",
    challenges: [
      "Time-sensitive deliveries to stores, restaurants, and distribution points.",
      "Route deviations that affect freshness and fuel cost.",
      "Unplanned idle time during loading, unloading, or driver stops.",
      "Maintenance and document compliance for delivery vehicles.",
    ],
    solutions: [
      "Live fleet location for dispatchers and account teams.",
      "Geofenced customer, depot, and cold-chain locations.",
      "Idle and route history reports for delivery performance.",
      "Maintenance, tyre, document, and expense records by vehicle.",
    ],
    workflow: [
      "Group delivery vehicles by depot, route, or service region.",
      "Monitor live movement during delivery windows.",
      "Use geofence and history data to confirm arrivals and stops.",
      "Review exceptions and costs to improve the next delivery cycle.",
    ],
    outcomes: [
      "More predictable deliveries.",
      "Reduced waste from avoidable delays.",
      "Better customer service with route-backed answers.",
    ],
    modules: ["Live map", "Geofences", "Trip history", "Maintenance", "Documents"],
  },
  {
    slug: "construction",
    name: "Construction",
    imageUrl: "/industries/construction.png",
    span: "col-span-1 row-span-1",
    eyebrow: "Site equipment visibility",
    title: "Track machines, site vehicles, and service crews across active projects.",
    summary:
      "Smart Tracker helps construction companies monitor equipment, pickup trucks, service vehicles, and site assets. Project managers can reduce misuse, confirm site attendance, prevent unauthorised movement, and plan maintenance around real usage.",
    challenges: [
      "Expensive equipment moving between sites without clear records.",
      "Idle machines and service vehicles increasing operating costs.",
      "Theft risk outside working hours.",
      "Manual maintenance planning for high-use assets.",
    ],
    solutions: [
      "Geofences around construction sites, yards, and restricted areas.",
      "Movement alerts for assets leaving approved zones.",
      "Idle, trip, and route history for utilisation reporting.",
      "Maintenance schedules, vendor records, and expense tracking.",
    ],
    workflow: [
      "Attach trackers to machines, trucks, and service vehicles.",
      "Define project-site boundaries and permitted work zones.",
      "Receive alerts when equipment moves after hours or leaves site.",
      "Use history and maintenance records to plan service work.",
    ],
    outcomes: [
      "Reduced theft and unauthorised equipment use.",
      "Better asset utilisation across job sites.",
      "More accurate maintenance and cost records.",
    ],
    modules: ["Geofences", "Alerts", "Maintenance", "Expenses", "Trip history"],
  },
  {
    slug: "school-bus",
    name: "School Bus",
    imageUrl: "/industries/school-bus.png",
    span: "col-span-1 row-span-1",
    eyebrow: "Student transport safety",
    title: "Give schools and parents safer, clearer visibility into bus movement.",
    summary:
      "Smart Tracker helps schools and transport operators monitor bus routes, driver behaviour, arrival patterns, and vehicle readiness. Operations teams can know where every bus is, confirm route completion, and respond quickly when a bus is delayed or offline.",
    challenges: [
      "Parents and administrators need accurate bus location updates.",
      "Route delays or deviations create safety and communication pressure.",
      "Driver overspeeding or harsh braking affects student safety.",
      "Buses must stay maintained and compliant.",
    ],
    solutions: [
      "Live tracking for every active school bus.",
      "Geofences for schools, stops, depots, and safe zones.",
      "Driver behaviour alerts and scorecards.",
      "Maintenance and document tracking for fleet readiness.",
    ],
    workflow: [
      "Register buses and assign routes or service areas.",
      "Monitor departures, arrivals, and route exceptions.",
      "Review driver safety events after each trip.",
      "Keep maintenance and compliance documents organised.",
    ],
    outcomes: [
      "Improved student transport safety.",
      "Fewer unknown delays.",
      "Better accountability for operators and schools.",
    ],
    modules: ["Live tracking", "Geofences", "Driver scorecards", "Alerts", "Documents"],
  },
  {
    slug: "consumer-goods",
    name: "Consumer Goods",
    imageUrl: "/industries/consumer-goods.png",
    span: "col-span-1 row-span-1",
    eyebrow: "Retail distribution",
    title: "Improve field distribution from warehouse to store shelf.",
    summary:
      "Smart Tracker supports consumer goods companies with visibility across delivery vans, merchandisers, route sales teams, and distributor fleets. It helps confirm visits, reduce delivery gaps, and keep vehicles operating efficiently.",
    challenges: [
      "Distributed sales and delivery teams with limited field visibility.",
      "Retail delivery delays and missed store visits.",
      "Unclear vehicle utilisation across territories.",
      "Rising maintenance and operating costs.",
    ],
    solutions: [
      "Live route and field team visibility.",
      "Geofence-based store, depot, and territory tracking.",
      "Trip history for visit confirmation and route review.",
      "Expense, maintenance, and vendor modules for fleet cost control.",
    ],
    workflow: [
      "Map vehicles to territories, depots, or distribution teams.",
      "Monitor delivery movement and store-area stops.",
      "Review route compliance and field visit history.",
      "Track operating cost against fleet activity.",
    ],
    outcomes: [
      "Stronger route execution.",
      "Clearer sales and delivery accountability.",
      "Lower operating waste across territories.",
    ],
    modules: ["Geofences", "Trip history", "Expenses", "Maintenance", "Reports"],
  },
  {
    slug: "pharmaceutical",
    name: "Pharmaceutical",
    imageUrl: "/industries/pharmaceutical.png",
    span: "col-span-2 row-span-1",
    eyebrow: "Medical logistics",
    title: "Protect regulated medical deliveries with route and exception visibility.",
    summary:
      "Smart Tracker helps pharmaceutical distributors and healthcare logistics teams monitor sensitive shipments, delivery vehicles, route compliance, and chain-of-custody events. Teams can act fast when vehicles stop unexpectedly, leave approved routes, or miss delivery windows.",
    challenges: [
      "High-value medicine and medical supplies require tighter accountability.",
      "Delivery routes often need strict compliance and audit records.",
      "Vehicle downtime can disrupt hospitals, pharmacies, and labs.",
      "Manual logs make exception investigation slow.",
    ],
    solutions: [
      "Live tracking and route replay for delivery vehicles.",
      "Geofences for warehouses, hospitals, labs, and pharmacies.",
      "Alerts for unauthorised stops, route deviations, and offline devices.",
      "Document and maintenance tracking for compliance support.",
    ],
    workflow: [
      "Set approved routes and delivery location geofences.",
      "Monitor active medical logistics trips in real time.",
      "Capture exceptions and movement history automatically.",
      "Export reports for customer service, compliance, and audit needs.",
    ],
    outcomes: [
      "Better shipment accountability.",
      "Faster exception investigation.",
      "Improved compliance support for sensitive deliveries.",
    ],
    modules: ["Live tracking", "Geofences", "Alerts", "Documents", "Reports"],
  },
  {
    slug: "passenger-transit",
    name: "Passenger Transit",
    imageUrl: "/industries/passenger-transit.png",
    span: "col-span-1 row-span-1",
    eyebrow: "Public and private transit",
    title: "Manage transit visibility, route adherence, and passenger service reliability.",
    summary:
      "Smart Tracker helps transit operators monitor buses, shuttles, and passenger vehicles in real time. Operations teams can identify delays, unsafe driving, missed routes, vehicle downtime, and service coverage gaps.",
    challenges: [
      "Passengers and operators need reliable arrival visibility.",
      "Route deviations and delays affect service quality.",
      "Driver behaviour impacts passenger comfort and safety.",
      "Vehicle downtime disrupts scheduled service.",
    ],
    solutions: [
      "Live transit fleet map and vehicle status.",
      "Route history for service audits and delay reviews.",
      "Driver behaviour alerts for overspeeding and harsh events.",
      "Maintenance and document tracking for service readiness.",
    ],
    workflow: [
      "Assign buses or shuttles to routes and operating areas.",
      "Monitor active route movement and exceptions.",
      "Review trip data to improve scheduling and service coverage.",
      "Use maintenance records to reduce unexpected downtime.",
    ],
    outcomes: [
      "More reliable passenger service.",
      "Improved safety oversight.",
      "Better planning from real route data.",
    ],
    modules: ["Live map", "Trip history", "Driver scorecards", "Maintenance", "Alerts"],
  },
  {
    slug: "agriculture",
    name: "Agriculture",
    imageUrl: "/industries/agriculture.png",
    span: "col-span-1 row-span-1",
    eyebrow: "Farm and field assets",
    title: "Track tractors, utility vehicles, and field operations across large areas.",
    summary:
      "Smart Tracker gives farms and agribusiness operators visibility over tractors, trucks, service vehicles, and mobile assets. It helps protect equipment, understand usage, coordinate field teams, and reduce idle time.",
    challenges: [
      "Large farms and remote fields make asset visibility difficult.",
      "Equipment theft or unauthorised movement can be costly.",
      "Idle time and inefficient field movement increase fuel spend.",
      "Maintenance planning is hard without usage records.",
    ],
    solutions: [
      "Live map tracking for tractors, trucks, and utility vehicles.",
      "Geofences around farms, storage yards, and field zones.",
      "Movement and offline alerts for remote equipment.",
      "Maintenance and expense records tied to each asset.",
    ],
    workflow: [
      "Register field vehicles and create farm geofences.",
      "Monitor movement across fields and storage areas.",
      "Receive alerts for after-hours movement or offline trackers.",
      "Review utilisation and service history for planning.",
    ],
    outcomes: [
      "Better field coordination.",
      "Reduced equipment loss risk.",
      "More informed maintenance and fuel planning.",
    ],
    modules: ["Live tracking", "Geofences", "Alerts", "Maintenance", "Expenses"],
  },
  {
    slug: "mining",
    name: "Mining",
    imageUrl: "/industries/mining.png",
    span: "col-span-1 row-span-1",
    eyebrow: "Heavy-duty operations",
    title: "Monitor mine vehicles, restricted zones, and high-risk movement.",
    summary:
      "Smart Tracker supports mining operations by tracking haul trucks, support fleets, and site vehicles across pits, haul roads, yards, and restricted areas. It gives teams visibility into safety events, unauthorised movement, and equipment utilisation.",
    challenges: [
      "Large sites and harsh terrain make visibility difficult.",
      "Restricted areas and haul roads need strict monitoring.",
      "Heavy equipment downtime is expensive.",
      "Unsafe driving events can create major operational risk.",
    ],
    solutions: [
      "Geofenced pits, dump areas, workshops, and restricted zones.",
      "Live location and status for haul and support vehicles.",
      "Overspeed, harsh-driving, idle, and offline alerts.",
      "Maintenance tracking for heavy-duty vehicle readiness.",
    ],
    workflow: [
      "Map mine zones and assign trackers to operating vehicles.",
      "Monitor movement across active production areas.",
      "Respond to restricted-zone, idle, and safety alerts.",
      "Review utilisation and maintenance history by asset.",
    ],
    outcomes: [
      "Improved site safety visibility.",
      "Reduced unauthorised vehicle movement.",
      "Better maintenance planning for expensive assets.",
    ],
    modules: ["Geofences", "Live tracking", "Alerts", "Maintenance", "Driver scorecards"],
  },
  {
    slug: "ecommerce",
    name: "eCommerce",
    imageUrl: "/industries/ecommerce.png",
    span: "col-span-1 row-span-1",
    eyebrow: "Last-mile delivery",
    title: "Make last-mile delivery easier to see, explain, and improve.",
    summary:
      "Smart Tracker helps eCommerce operators and delivery partners monitor vans, riders, and fulfilment fleets. It gives teams live visibility, route history, delivery-zone geofences, and exception alerts for faster customer support.",
    challenges: [
      "Customers expect accurate delivery updates.",
      "Last-mile delays and route deviations are expensive to investigate.",
      "High delivery volume creates many exceptions.",
      "Fleet growth makes manual coordination difficult.",
    ],
    solutions: [
      "Live vehicle tracking for delivery operations teams.",
      "Route history for customer support and dispute resolution.",
      "Delivery-zone geofences and stop confirmation.",
      "Idle, offline, and driver behaviour alerts.",
    ],
    workflow: [
      "Assign vehicles to delivery zones or fulfilment hubs.",
      "Track active routes during peak delivery windows.",
      "Use history to confirm routes, stops, and delays.",
      "Review performance reports to optimise delivery coverage.",
    ],
    outcomes: [
      "Faster customer support answers.",
      "Improved delivery reliability.",
      "Better control over expanding fleets.",
    ],
    modules: ["Live map", "Trip history", "Geofences", "Alerts", "Reports"],
  },
  {
    slug: "telecom",
    name: "Telecom",
    imageUrl: "/industries/telecom.png",
    span: "col-span-1 row-span-1",
    eyebrow: "Field service fleets",
    title: "Coordinate tower teams, service vehicles, and response work in real time.",
    summary:
      "Smart Tracker helps telecom companies track maintenance crews, tower service vehicles, generators, and field assets. Operations teams can improve dispatch, verify site visits, monitor fuel use, and respond to urgent outages faster.",
    challenges: [
      "Field teams operate across many tower and service locations.",
      "Outage response depends on knowing the nearest available crew.",
      "Generator and field asset movement needs visibility.",
      "Manual site-visit records are hard to verify.",
    ],
    solutions: [
      "Geofences for towers, hubs, and maintenance regions.",
      "Live service-vehicle location for dispatch decisions.",
      "Trip history and site arrival records.",
      "Fuel, maintenance, and offline-device alerts.",
    ],
    workflow: [
      "Map towers, depots, and service zones.",
      "Track crews and vehicles during planned or emergency work.",
      "Verify site visits using geofence and trip data.",
      "Review operational reports after maintenance cycles.",
    ],
    outcomes: [
      "Faster outage response.",
      "Better field team accountability.",
      "Improved asset and fuel visibility.",
    ],
    modules: ["Geofences", "Live tracking", "Fuel monitoring", "Trip history", "Alerts"],
  },
  {
    slug: "banking",
    name: "Banking",
    imageUrl: "/industries/banking.png",
    span: "col-span-1 row-span-1",
    eyebrow: "Secure fleet operations",
    title: "Protect cash-in-transit, executive, and service fleets with real-time oversight.",
    summary:
      "Smart Tracker gives banks and financial service providers visibility over secure vehicles, executive fleets, maintenance crews, and ATM service teams. It helps teams monitor approved routes, respond to route deviations, and keep detailed movement records.",
    challenges: [
      "Cash-in-transit and sensitive service routes need strict oversight.",
      "Unauthorised stops or deviations require quick escalation.",
      "Fleet records must support audits and incident reviews.",
      "High-value vehicles need strong maintenance and document control.",
    ],
    solutions: [
      "Live tracking with route and stop history.",
      "Geofences for branches, vaults, ATMs, and restricted zones.",
      "Alerts for route exceptions, offline devices, and risky driving.",
      "Documents, maintenance, and driver scorecards for operational control.",
    ],
    workflow: [
      "Define secure destinations and approved service regions.",
      "Monitor active routes from the operations dashboard.",
      "Escalate alerts for unexpected movement or stops.",
      "Review reports for audit, security, and fleet management.",
    ],
    outcomes: [
      "Stronger route security.",
      "Clearer audit trails for sensitive trips.",
      "Better control over vehicle readiness and compliance.",
    ],
    modules: ["Live tracking", "Geofences", "Alerts", "Documents", "Driver scorecards"],
  },
  {
    slug: "vehicle-leasing",
    name: "Vehicle Leasing",
    imageUrl: "/industries/vehicle-leasing.png",
    span: "col-span-1 row-span-1",
    eyebrow: "Lease fleet management",
    title: "Manage leased vehicles, utilisation, location, and service history at scale.",
    summary:
      "Smart Tracker helps leasing companies know where vehicles are, how they are being used, when service is due, and which assets need attention. It supports customer fleets, replacement vehicles, and rental-style operations.",
    challenges: [
      "Large leased fleets can be difficult to locate and audit.",
      "Misuse, late returns, and vehicle downtime reduce profitability.",
      "Service history and documents are often scattered.",
      "Customer disputes require reliable movement records.",
    ],
    solutions: [
      "Live vehicle location and status across the lease fleet.",
      "Trip history and geofence alerts for misuse or late return patterns.",
      "Maintenance, tyre, document, and expense records by vehicle.",
      "Driver behaviour insights where leases include managed drivers.",
    ],
    workflow: [
      "Register leased vehicles and assign them to customers or organisations.",
      "Monitor status, location, and service needs.",
      "Use trip history to investigate misuse or disputes.",
      "Keep compliance documents and maintenance schedules centralised.",
    ],
    outcomes: [
      "Better asset control.",
      "Reduced downtime and service surprises.",
      "Cleaner customer and vehicle records.",
    ],
    modules: ["Live tracking", "Maintenance", "Documents", "Tyre management", "Trip history"],
  },
  {
    slug: "mobility-as-a-service",
    name: "Mobility as a Service",
    imageUrl: "/industries/mobility-service.png",
    span: "col-span-2 row-span-1",
    eyebrow: "Urban mobility platforms",
    title: "Coordinate shared mobility, ride operations, and urban fleet performance.",
    summary:
      "Smart Tracker gives mobility platforms visibility into shared cars, ride-hailing partner vehicles, shuttle fleets, and urban movement patterns. It helps operations teams monitor availability, safety, coverage, and asset usage.",
    challenges: [
      "Urban fleets move constantly across dense service areas.",
      "Vehicle availability and downtime affect customer experience.",
      "Driver behaviour and route exceptions impact safety and brand trust.",
      "Scaling operations requires reliable movement and utilisation data.",
    ],
    solutions: [
      "Live map visibility for active and inactive fleet assets.",
      "Service-area geofences and coverage monitoring.",
      "Driver scorecards, overspeed alerts, and route history.",
      "Maintenance and expense records for operating cost control.",
    ],
    workflow: [
      "Create service zones and assign vehicles or partners.",
      "Monitor availability, movement, and exceptions in real time.",
      "Review safety and utilisation metrics by vehicle or driver.",
      "Use reports to rebalance fleet coverage and reduce downtime.",
    ],
    outcomes: [
      "Improved fleet availability.",
      "Safer urban mobility operations.",
      "Better utilisation and cost visibility.",
    ],
    modules: ["Live map", "Geofences", "Driver scorecards", "Maintenance", "Reports"],
  },
];

export function getIndustry(slug: string) {
  return industries.find((industry) => industry.slug === slug);
}

const entries: string[][] = [
  [
    "Getting started",
    "How do I add a vehicle?",
    "Open Vehicles in Control Center, choose Add vehicle and complete the required fields. Link its tracker before checking the live map.",
    "vehicles",
  ],
  [
    "Getting started",
    "How do I register a GPS tracker?",
    "Open Devices, choose Add device and enter the tracker identifier and connection details. Confirm the device reports before linking it to a vehicle.",
    "devices",
  ],
  [
    "Getting started",
    "Why is a menu missing from my account?",
    "Available pages depend on your role, account scope and enabled modules. Ask your administrator to check your assigned permissions.",
  ],
  [
    "Live map",
    "What do the vehicle statuses mean?",
    "Moving means the vehicle is travelling. Idle means the engine is on without movement. Stopped means parked. Inactive means no recent usable report. Check the report age alongside the status.",
    "live",
  ],
  [
    "Live map",
    "Why is a vehicle online but its position is old?",
    "Connectivity and GPS freshness are separate. A tracker can be connected while its latest valid GPS fix is old. Check report time, GPS reception and device health.",
    "devices",
  ],
  [
    "Live map",
    "A vehicle is missing from the list.",
    "Check the tenant scope, search, status and group filters. Then confirm the vehicle has a linked, reporting device.",
    "live",
  ],
  [
    "Live map",
    "How do I replay a journey?",
    "Select a vehicle on the live map, open Replay and choose a period. Use the timeline and playback controls to review the route.",
    "history",
  ],
  [
    "Live map",
    "How do I change the map style?",
    "Open Map style in the left map tools. Choose Streets, Satellite, Hybrid or Terrain.",
    "live",
  ],
  [
    "Trackers and devices",
    "Why is a device offline?",
    "Check its last report time, power, SIM balance and network coverage. A device that has never reported needs its connection settings checked first.",
    "devices",
  ],
  [
    "Trackers and devices",
    "How do I send a command?",
    "Open the device detail, choose Actions and Send command. Commands are sent to the tracker linked to the selected vehicle.",
    "devices",
  ],
  [
    "Trackers and devices",
    "How do I change the reporting interval?",
    "Use a supported device command or configuration setting. Confirm the device model and command response before changing its interval.",
    "devices",
  ],
  [
    "Trackers and devices",
    "The location looks wrong.",
    "Compare the fix time and coordinates, then check GPS reception and installation. Review history to distinguish an old fix from a temporary GPS jump.",
    "history",
  ],
  [
    "Alerts",
    "How do I create an alert?",
    "Open Alerts, switch to Rules and configure the condition, vehicles and recipients. Check that the rule is enabled.",
    "rules",
  ],
  [
    "Alerts",
    "An email or SMS alert did not arrive.",
    "Check the rule recipients, delivery settings and event history. Ask your administrator to verify the delivery service and available message balance.",
    "alerts",
  ],
  [
    "Alerts",
    "How do I monitor site entry and exit?",
    "Create a geofence for the site, then add entry or exit rules for the required vehicles.",
    "geofences",
  ],
  [
    "Reports",
    "How do I export a report?",
    "Choose a report in Report library, set the period and scope, then use the result table export menu.",
    "r-library",
  ],
  [
    "Reports",
    "Which report should I use?",
    "Use Mileage for distance, Trips for journeys, Stops & idling for parked time, and the relevant fuel or video report for those modules.",
    "r-library",
  ],
  [
    "Reports",
    "How do I schedule a report?",
    "Open Reports and Automated delivery. Create a schedule with its report, time zone, recipients and format.",
    "r-auto",
  ],
  [
    "Reports",
    "Why is a report empty?",
    "Check the date range, tenant and vehicle scope. Confirm the selected vehicles reported data during that period.",
    "r-library",
  ],
  [
    "Fuel",
    "Fuel shows zero or does not change.",
    "Check the sensor reading, wiring, tank capacity and calibration. Review the device telemetry before changing the calibration.",
    "f-sensors",
  ],
  [
    "Fuel",
    "Does a drain event prove fuel theft?",
    "A drain event identifies a change in the sensor reading. Review the graph, vehicle position and operating context before deciding what caused it.",
    "f-drains",
  ],
  [
    "Video",
    "A camera is online but video will not play.",
    "Check camera channel availability, mobile data and the stream connection. A reporting camera may still have insufficient bandwidth for video.",
    "v-live",
  ],
  [
    "Video",
    "Why is an event clip pending?",
    "The device may still be uploading media or waiting for connectivity. Review camera status and storage before retrying.",
    "v-events",
  ],
  [
    "Drivers",
    "How do I identify drivers with RFID?",
    "Assign the driver identifier to the correct driver and confirm the reader reports that identifier through the vehicle device.",
  ],
  [
    "Accounts and users",
    "How do I limit a client to their own vehicles?",
    "Use the account and user role assignments to restrict tenant and vehicle scope. Verify the resulting access with that user account.",
    "a-users",
  ],
  [
    "Accounts and users",
    "How do I connect an external system?",
    "Ask your administrator to configure API access, permissions and credentials for the integration. Keep credentials out of shared reports and support messages.",
    "settings",
  ],
];
const destinations: Record<string, string> = {
  vehicles: "/app/control/vehicles",
  devices: "/app/devices-mgmt",
  live: "/app/devices",
  history: "/app/history",
  rules: "/app/control/alert-rules",
  alerts: "/app/alerts",
  geofences: "/app/geofences",
  "r-library": "/app/reports",
  "r-auto": "/app/reports/schedules",
  "f-sensors": "/app/fuel/sensors",
  "f-drains": "/app/fuel/drains",
  "v-live": "/app/cctv",
  "v-events": "/app/video/events",
  "a-users": "/admin/users",
  settings: "/app/settings",
};
export const supportFaqs = entries.map(
  ([category, question, answer, page]) => ({
    category,
    question,
    answer,
    href: destinations[page],
  }),
);
export type SupportContacts = {
  email: string;
  phone: string;
  whatsapp: string;
  hours: string;
  helpUrl: string;
};
export const emptyContacts: SupportContacts = {
  email: "",
  phone: "",
  whatsapp: "",
  hours: "",
  helpUrl: "",
};
export function contactLinks(contacts: SupportContacts) {
  return {
    email: contacts.email ? "mailto:" + encodeURIComponent(contacts.email) : "",
    phone: contacts.phone
      ? "tel:" + contacts.phone.replace(/[^+0-9]/g, "")
      : "",
    whatsapp: contacts.whatsapp
      ? "https://wa.me/" + contacts.whatsapp.replace(/\D/g, "")
      : "",
    help: /^https?:\/\//i.test(contacts.helpUrl) ? contacts.helpUrl : "",
  };
}

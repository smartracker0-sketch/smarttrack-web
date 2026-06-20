export type OrgStatus = "Active" | "Trial" | "Suspended" | "Churned";
export type OrgPlan = "Starter" | "Pro" | "Enterprise";

export interface Organisation {
  id: string;
  name: string;
  plan: OrgPlan;
  status: OrgStatus;
  vehicles: number;
  users: number;
  onboarded: string;
  adminEmail: string;
  vehicleLimit: number;
  mrr: number;
}

export interface Vehicle {
  id: string;
  plate: string;
  orgId: string;
  orgName: string;
  driver: string;
  status: "Moving" | "Idle" | "Stopped" | "Offline";
  imei: string;
  lastSeen: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  orgId: string | null;
  orgName: string;
  role: "Super Admin" | "Admin" | "Manager" | "Viewer";
  status: "Active" | "Inactive";
  lastLogin: string;
}

export interface Device {
  id: string;
  imei: string;
  type: "GPS Tracker" | "Dashcam" | "Fuel Sensor";
  firmware: string;
  vehicle: string;
  orgId: string | null;
  orgName: string;
  status: "Online" | "Offline" | "Unassigned";
  lastPing: string;
}

export interface Alert {
  id: string;
  time: string;
  orgId: string;
  orgName: string;
  vehicle: string;
  driver: string;
  type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Read" | "Unread";
}

export interface Invoice {
  id: string;
  orgId: string;
  orgName: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  dueDate: string;
  issued: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  ip: string;
}

export interface SupportTicket {
  id: string;
  orgId: string;
  orgName: string;
  subject: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Resolved";
  created: string;
  assignedTo: string;
}

export const ORGS: Organisation[] = [
  { id: "org1", name: "Agro Logistics Ltd", plan: "Enterprise", status: "Active", vehicles: 18, users: 12, onboarded: "2024-01-15", adminEmail: "admin@agrologistics.com", vehicleLimit: 50, mrr: 250000 },
  { id: "org2", name: "Metro Deliveries", plan: "Pro", status: "Active", vehicles: 9, users: 6, onboarded: "2024-03-02", adminEmail: "ops@metrodeliveries.ng", vehicleLimit: 20, mrr: 85000 },
  { id: "org3", name: "SunTrans Haulage", plan: "Starter", status: "Trial", vehicles: 4, users: 3, onboarded: "2024-05-20", adminEmail: "info@suntrans.ng", vehicleLimit: 10, mrr: 0 },
  { id: "org4", name: "Kano Fuel Services", plan: "Pro", status: "Active", vehicles: 11, users: 7, onboarded: "2023-11-10", adminEmail: "fleet@kanofuel.com", vehicleLimit: 20, mrr: 85000 },
  { id: "org5", name: "Lagos Courier Co.", plan: "Enterprise", status: "Active", vehicles: 22, users: 15, onboarded: "2023-08-05", adminEmail: "it@lagoscourier.com", vehicleLimit: 50, mrr: 250000 },
  { id: "org6", name: "Delta Cold Chain", plan: "Starter", status: "Suspended", vehicles: 3, users: 2, onboarded: "2024-02-28", adminEmail: "admin@deltacold.ng", vehicleLimit: 10, mrr: 0 },
  { id: "org7", name: "Abuja State Transit", plan: "Enterprise", status: "Active", vehicles: 30, users: 18, onboarded: "2023-06-12", adminEmail: "director@abujastate.gov.ng", vehicleLimit: 100, mrr: 350000 },
  { id: "org8", name: "Rapid Express NG", plan: "Pro", status: "Churned", vehicles: 0, users: 0, onboarded: "2023-09-20", adminEmail: "support@rapidexpress.ng", vehicleLimit: 20, mrr: 0 },
];

export const VEHICLES: Vehicle[] = [
  { id: "v1", plate: "LAS-001-AA", orgId: "org5", orgName: "Lagos Courier Co.", driver: "James Adeyemi", status: "Moving", imei: "352749081234561", lastSeen: "2 min ago" },
  { id: "v2", plate: "ABJ-334-KY", orgId: "org7", orgName: "Abuja State Transit", driver: "Musa Bello", status: "Idle", imei: "352749081234562", lastSeen: "5 min ago" },
  { id: "v3", plate: "KAN-112-QR", orgId: "org4", orgName: "Kano Fuel Services", driver: "Ibrahim Yusuf", status: "Moving", imei: "352749081234563", lastSeen: "1 min ago" },
  { id: "v4", plate: "AGR-445-ZZ", orgId: "org1", orgName: "Agro Logistics Ltd", driver: "Chioma Eze", status: "Stopped", imei: "352749081234564", lastSeen: "12 min ago" },
  { id: "v5", plate: "MET-009-BB", orgId: "org2", orgName: "Metro Deliveries", driver: "Tunde Owolabi", status: "Moving", imei: "352749081234565", lastSeen: "3 min ago" },
  { id: "v6", plate: "ABJ-881-PQ", orgId: "org7", orgName: "Abuja State Transit", driver: "Grace Nwosu", status: "Offline", imei: "352749081234566", lastSeen: "2 hrs ago" },
  { id: "v7", plate: "LAS-202-CC", orgId: "org5", orgName: "Lagos Courier Co.", driver: "Femi Adebayo", status: "Moving", imei: "352749081234567", lastSeen: "Just now" },
  { id: "v8", plate: "SUN-007-TX", orgId: "org3", orgName: "SunTrans Haulage", driver: "Amina Sule", status: "Stopped", imei: "352749081234568", lastSeen: "30 min ago" },
  { id: "v9", plate: "KAN-551-LL", orgId: "org4", orgName: "Kano Fuel Services", driver: "Bashir Ahmad", status: "Moving", imei: "352749081234569", lastSeen: "4 min ago" },
  { id: "v10", plate: "LAS-390-FF", orgId: "org5", orgName: "Lagos Courier Co.", driver: "Ngozi Obi", status: "Idle", imei: "352749081234570", lastSeen: "8 min ago" },
];

export const USERS: User[] = [
  { id: "u1", name: "Platform Admin", email: "admin@smarttracker.cloud", orgId: null, orgName: "—", role: "Super Admin", status: "Active", lastLogin: "Today 08:12" },
  { id: "u2", name: "Emeka Okonkwo", email: "emeka@smarttracker.cloud", orgId: null, orgName: "—", role: "Super Admin", status: "Active", lastLogin: "Yesterday 14:30" },
  { id: "u3", name: "James Adeyemi", email: "admin@lagoscourier.com", orgId: "org5", orgName: "Lagos Courier Co.", role: "Admin", status: "Active", lastLogin: "Today 07:45" },
  { id: "u4", name: "Musa Bello", email: "director@abujastate.gov.ng", orgId: "org7", orgName: "Abuja State Transit", role: "Admin", status: "Active", lastLogin: "Today 09:00" },
  { id: "u5", name: "Ibrahim Yusuf", email: "fleet@kanofuel.com", orgId: "org4", orgName: "Kano Fuel Services", role: "Manager", status: "Active", lastLogin: "Jun 19" },
  { id: "u6", name: "Chioma Eze", email: "ops@agrologistics.com", orgId: "org1", orgName: "Agro Logistics Ltd", role: "Viewer", status: "Active", lastLogin: "Jun 18" },
  { id: "u7", name: "Tunde Owolabi", email: "ops@metrodeliveries.ng", orgId: "org2", orgName: "Metro Deliveries", role: "Admin", status: "Active", lastLogin: "Today 06:50" },
  { id: "u8", name: "Amina Sule", email: "info@suntrans.ng", orgId: "org3", orgName: "SunTrans Haulage", role: "Admin", status: "Active", lastLogin: "Jun 15" },
  { id: "u9", name: "Delta Admin", email: "admin@deltacold.ng", orgId: "org6", orgName: "Delta Cold Chain", role: "Admin", status: "Inactive", lastLogin: "Apr 02" },
];

export const DEVICES: Device[] = [
  { id: "d1", imei: "352749081234561", type: "GPS Tracker", firmware: "v4.2.1", vehicle: "LAS-001-AA", orgId: "org5", orgName: "Lagos Courier Co.", status: "Online", lastPing: "1 min ago" },
  { id: "d2", imei: "352749081234562", type: "GPS Tracker", firmware: "v4.2.1", vehicle: "ABJ-334-KY", orgId: "org7", orgName: "Abuja State Transit", status: "Online", lastPing: "2 min ago" },
  { id: "d3", imei: "352749081234563", type: "Dashcam", firmware: "v2.1.0", vehicle: "KAN-112-QR", orgId: "org4", orgName: "Kano Fuel Services", status: "Online", lastPing: "30 sec ago" },
  { id: "d4", imei: "352749081234564", type: "GPS Tracker", firmware: "v4.1.9", vehicle: "AGR-445-ZZ", orgId: "org1", orgName: "Agro Logistics Ltd", status: "Offline", lastPing: "3 hrs ago" },
  { id: "d5", imei: "352749081234565", type: "Fuel Sensor", firmware: "v1.0.5", vehicle: "MET-009-BB", orgId: "org2", orgName: "Metro Deliveries", status: "Online", lastPing: "1 min ago" },
  { id: "d6", imei: "352749081299001", type: "GPS Tracker", firmware: "v4.2.1", vehicle: "—", orgId: null, orgName: "—", status: "Unassigned", lastPing: "Never" },
  { id: "d7", imei: "352749081299002", type: "Dashcam", firmware: "v2.1.0", vehicle: "—", orgId: null, orgName: "—", status: "Unassigned", lastPing: "Never" },
  { id: "d8", imei: "352749081299003", type: "GPS Tracker", firmware: "v4.2.1", vehicle: "—", orgId: null, orgName: "—", status: "Unassigned", lastPing: "Never" },
];

export const ALERTS: Alert[] = [
  { id: "a1", time: "09:14", orgId: "org5", orgName: "Lagos Courier Co.", vehicle: "LAS-001-AA", driver: "James Adeyemi", type: "Speeding", severity: "High", status: "Unread" },
  { id: "a2", time: "09:02", orgId: "org7", orgName: "Abuja State Transit", vehicle: "ABJ-881-PQ", driver: "Grace Nwosu", type: "Vehicle Offline", severity: "Medium", status: "Read" },
  { id: "a3", time: "08:45", orgId: "org4", orgName: "Kano Fuel Services", vehicle: "KAN-112-QR", driver: "Ibrahim Yusuf", type: "Harsh Braking", severity: "Medium", status: "Unread" },
  { id: "a4", time: "08:30", orgId: "org1", orgName: "Agro Logistics Ltd", vehicle: "AGR-445-ZZ", driver: "Chioma Eze", type: "Geofence Exit", severity: "High", status: "Unread" },
  { id: "a5", time: "08:15", orgId: "org5", orgName: "Lagos Courier Co.", vehicle: "LAS-202-CC", driver: "Femi Adebayo", type: "Tampering Detected", severity: "Critical", status: "Unread" },
  { id: "a6", time: "07:50", orgId: "org2", orgName: "Metro Deliveries", vehicle: "MET-009-BB", driver: "Tunde Owolabi", type: "Idle Timeout", severity: "Low", status: "Read" },
  { id: "a7", time: "07:20", orgId: "org7", orgName: "Abuja State Transit", vehicle: "ABJ-334-KY", driver: "Musa Bello", type: "Speeding", severity: "High", status: "Read" },
  { id: "a8", time: "06:55", orgId: "org3", orgName: "SunTrans Haulage", vehicle: "SUN-007-TX", driver: "Amina Sule", type: "Low Battery", severity: "Low", status: "Read" },
  { id: "a9", time: "06:10", orgId: "org4", orgName: "Kano Fuel Services", vehicle: "KAN-551-LL", driver: "Bashir Ahmad", type: "Fuel Theft Alert", severity: "Critical", status: "Unread" },
  { id: "a10", time: "05:30", orgId: "org1", orgName: "Agro Logistics Ltd", vehicle: "AGR-445-ZZ", driver: "Chioma Eze", type: "Night Movement", severity: "Medium", status: "Read" },
];

export const INVOICES: Invoice[] = [
  { id: "INV-001", orgId: "org5", orgName: "Lagos Courier Co.", amount: 250000, status: "Paid", dueDate: "Jun 01", issued: "May 25" },
  { id: "INV-002", orgId: "org7", orgName: "Abuja State Transit", amount: 350000, status: "Paid", dueDate: "Jun 01", issued: "May 25" },
  { id: "INV-003", orgId: "org1", orgName: "Agro Logistics Ltd", amount: 250000, status: "Pending", dueDate: "Jun 30", issued: "Jun 15" },
  { id: "INV-004", orgId: "org4", orgName: "Kano Fuel Services", amount: 85000, status: "Paid", dueDate: "Jun 01", issued: "May 25" },
  { id: "INV-005", orgId: "org2", orgName: "Metro Deliveries", amount: 85000, status: "Overdue", dueDate: "May 01", issued: "Apr 25" },
  { id: "INV-006", orgId: "org6", orgName: "Delta Cold Chain", amount: 35000, status: "Overdue", dueDate: "Apr 01", issued: "Mar 25" },
  { id: "INV-007", orgId: "org5", orgName: "Lagos Courier Co.", amount: 250000, status: "Paid", dueDate: "May 01", issued: "Apr 25" },
  { id: "INV-008", orgId: "org7", orgName: "Abuja State Transit", amount: 350000, status: "Paid", dueDate: "May 01", issued: "Apr 25" },
  { id: "INV-009", orgId: "org3", orgName: "SunTrans Haulage", amount: 0, status: "Pending", dueDate: "Jul 20", issued: "Jun 20" },
  { id: "INV-010", orgId: "org1", orgName: "Agro Logistics Ltd", amount: 250000, status: "Paid", dueDate: "May 01", issued: "Apr 25" },
];

export const AUDIT_LOG: AuditEntry[] = [
  { id: "al1", timestamp: "2026-06-20 09:14", actor: "admin@smarttracker.cloud", action: "Suspended Organisation", target: "Delta Cold Chain", ip: "102.89.12.5" },
  { id: "al2", timestamp: "2026-06-20 08:30", actor: "emeka@smarttracker.cloud", action: "Changed User Role", target: "Chioma Eze → Viewer", ip: "102.89.12.6" },
  { id: "al3", timestamp: "2026-06-19 17:10", actor: "admin@smarttracker.cloud", action: "Created Organisation", target: "SunTrans Haulage", ip: "102.89.12.5" },
  { id: "al4", timestamp: "2026-06-19 14:22", actor: "emeka@smarttracker.cloud", action: "Impersonated Organisation", target: "Lagos Courier Co.", ip: "102.89.12.6" },
  { id: "al5", timestamp: "2026-06-18 11:05", actor: "admin@smarttracker.cloud", action: "Updated Platform Settings", target: "EV Module → Enabled", ip: "102.89.12.5" },
  { id: "al6", timestamp: "2026-06-18 09:00", actor: "admin@smarttracker.cloud", action: "Deleted Invoice", target: "INV-003", ip: "102.89.12.5" },
  { id: "al7", timestamp: "2026-06-17 16:45", actor: "emeka@smarttracker.cloud", action: "Reset User Password", target: "admin@deltacold.ng", ip: "102.89.12.6" },
  { id: "al8", timestamp: "2026-06-17 10:00", actor: "admin@smarttracker.cloud", action: "Added Device(s)", target: "3 GPS Trackers (Unassigned)", ip: "102.89.12.5" },
];

export const SUPPORT_TICKETS: SupportTicket[] = [
  { id: "TKT-001", orgId: "org2", orgName: "Metro Deliveries", subject: "Vehicle not showing on map", priority: "High", status: "Open", created: "Jun 20 08:00", assignedTo: "Emeka Okonkwo" },
  { id: "TKT-002", orgId: "org4", orgName: "Kano Fuel Services", subject: "Fuel sensor giving wrong readings", priority: "Urgent", status: "In Progress", created: "Jun 19 14:30", assignedTo: "Platform Admin" },
  { id: "TKT-003", orgId: "org1", orgName: "Agro Logistics Ltd", subject: "Cannot export trip report as PDF", priority: "Medium", status: "In Progress", created: "Jun 18 10:00", assignedTo: "Emeka Okonkwo" },
  { id: "TKT-004", orgId: "org7", orgName: "Abuja State Transit", subject: "Request to increase vehicle limit", priority: "Low", status: "Resolved", created: "Jun 15 09:00", assignedTo: "Platform Admin" },
  { id: "TKT-005", orgId: "org3", orgName: "SunTrans Haulage", subject: "Driver app login failing", priority: "High", status: "Open", created: "Jun 20 10:45", assignedTo: "Emeka Okonkwo" },
];

export const MONTHLY_ORGS = [
  { month: "Jul", orgs: 1 }, { month: "Aug", orgs: 2 }, { month: "Sep", orgs: 1 },
  { month: "Oct", orgs: 0 }, { month: "Nov", orgs: 1 }, { month: "Dec", orgs: 1 },
  { month: "Jan", orgs: 2 }, { month: "Feb", orgs: 1 }, { month: "Mar", orgs: 0 },
  { month: "Apr", orgs: 0 }, { month: "May", orgs: 1 }, { month: "Jun", orgs: 1 },
];

export const VEHICLES_PER_ORG = ORGS.filter(o => o.vehicles > 0)
  .sort((a, b) => b.vehicles - a.vehicles)
  .slice(0, 8)
  .map(o => ({ name: o.name.split(" ").slice(0, 2).join(" "), vehicles: o.vehicles }));

export const ALERT_SEVERITY = [
  { name: "Low", value: 8, color: "#22C55E" },
  { name: "Medium", value: 14, color: "#F59E0B" },
  { name: "High", value: 12, color: "#F97316" },
  { name: "Critical", value: 6, color: "#EF4444" },
];

export const DAILY_ACTIVE_USERS = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  users: Math.floor(30 + Math.random() * 25),
}));

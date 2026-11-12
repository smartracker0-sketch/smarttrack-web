import Image from "next/image";
import PageHeader from "@/components/signature/PageHeader";
import { pageById } from "@/components/signature/navigation";
import Link from "next/link";
import { FiActivity, FiBell, FiTool } from "react-icons/fi";

const reports = [
  {
    title: "Ignition Report",
    icon: "ignition",
    desc: "Ignition state and recorded operating activity.",
    href: "/app/history",
    action: "View history",
  },
  {
    title: "AC Report",
    icon: "ac",
    desc: "Review available air conditioning and sensor events.",
    href: "/app/alerts",
    action: "View sensor events",
  },
  {
    title: "Trip Report",
    icon: "trip",
    desc: "Trips, distance, duration and average speed.",
    href: "/app/history",
    action: "View trips",
  },
  {
    title: "Stoppage Report",
    icon: "stoppage",
    desc: "Parking events, idle time and stop locations.",
    href: "/app/history",
    action: "View history",
  },
  {
    title: "Summary Report",
    icon: "summary",
    desc: "Fleet activity, distance and vehicle performance.",
    href: "/app/analytics",
    action: "View analytics",
  },
  {
    title: "Daily Report",
    icon: "daily",
    desc: "Review tracking activity for a selected day.",
    href: "/app/history",
    action: "View history",
  },
  {
    title: "Over Speed Report",
    icon: "overspeed",
    desc: "Recorded speeding alerts and vehicle events.",
    href: "/app/alerts",
    action: "View alerts",
  },
  {
    title: "Geofence Report",
    icon: "geofence",
    desc: "Geofence zones, visits and boundary activity.",
    href: "/app/geofences",
    action: "View geofences",
  },
];

const additionalReports = [
  {
    title: "Events",
    desc: "Speeding, SOS and custom sensor events.",
    href: "/app/alerts",
    icon: FiBell,
  },
  {
    title: "Maintenance",
    desc: "Service schedules and upcoming maintenance.",
    href: "/app/maintenance",
    icon: FiTool,
  },
  {
    title: "Eco-driving",
    desc: "Driver behavior scoring and violations.",
    href: "/app/drivers/performance",
    icon: FiActivity,
  },
];

export default function ReportsPage() {
  return (
    <div className="grid gap-6">
      <PageHeader page={pageById("report-library")!} tenant={false} />

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {reports.map((report) => (
          <Link
            key={report.icon}
            href={report.href}
            className="group flex flex-col items-center rounded-2xl border border-divider bg-white px-3 py-6 text-center transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:px-5"
          >
            <Image
              src={`/report-icons/${report.icon}.png`}
              width={82}
              height={82}
              alt=""
              unoptimized
              className="h-[72px] w-[72px] object-contain"
            />
            <h2 className="mt-4 text-sm font-semibold text-[#262626] sm:text-base">
              {report.title}
            </h2>
            <p className="mt-2 flex-1 text-xs leading-5 text-[#5C6B70] sm:text-sm">
              {report.desc}
            </p>
            <span className="mt-4 text-xs font-semibold text-[#0D4A47] underline-offset-4 group-hover:underline sm:text-sm">
              {report.action}
              <span className="sr-only"> for {report.title}</span>
            </span>
          </Link>
        ))}
      </div>

      <section aria-labelledby="more-reports-heading" className="grid gap-4">
        <h2
          id="more-reports-heading"
          className="text-base font-semibold text-foreground"
        >
          More reports
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {additionalReports.map(({ title, desc, href, icon: Icon }) => (
            <Link
              key={title}
              href={href}
              className="rounded-2xl border border-divider bg-surface p-6 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <Icon
                size={28}
                className="mb-4 text-primary"
                aria-hidden="true"
              />
              <h3 className="text-sm font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5C6B70]">{desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

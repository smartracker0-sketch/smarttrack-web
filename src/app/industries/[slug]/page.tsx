import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiMapPin, FiRadio, FiShield } from "react-icons/fi";
import { getIndustry, industries } from "../industryData";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return industries.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);

  if (!industry) {
    return {
      title: "Industry Not Found | Smart Tracker",
    };
  }

  return {
    title: `${industry.name} Fleet Tracking | Smart Tracker Telematics`,
    description: industry.summary,
  };
}

export default async function IndustryPage({ params }: PageProps) {
  const { slug } = await params;
  const industry = getIndustry(slug);

  if (!industry) notFound();

  const related = industries
    .filter((item) => item.slug !== industry.slug)
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-white text-gray-950">
      <section className="relative min-h-[76vh] overflow-hidden bg-[#071E1C] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{ backgroundImage: `url(${industry.imageUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071E1C] via-[#071E1C]/80 to-[#071E1C]/30" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />

        <div className="relative mx-auto flex min-h-[76vh] max-w-7xl flex-col justify-between px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/#industries"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#B2D4D2] transition hover:text-white"
          >
            <FiArrowLeft size={16} />
            Back to industries
          </Link>

          <div className="max-w-3xl pb-16 pt-20">
            <div className="mb-4 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#B2D4D2]">
              {industry.eyebrow}
            </div>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-7xl">
              {industry.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">
              {industry.title}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#F97316] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#EA6A0A]"
              >
                Start tracking
                <FiArrowRight size={16} />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                View plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#1A7A75]">
            How Smart Tracker helps
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-gray-950 sm:text-4xl">
            Practical fleet intelligence for {industry.name.toLowerCase()} operations.
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {industry.summary}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: FiMapPin, label: "Live location", value: "Track every asset and trip in real time." },
            { icon: FiShield, label: "Risk alerts", value: "Catch route, safety, and device exceptions fast." },
            { icon: FiRadio, label: "Operations data", value: "Turn movement into reports your team can use." },
            { icon: FiCheckCircle, label: "Fleet records", value: "Keep service, document, and cost history together." },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-lg border border-gray-200 bg-[#F5F7FA] p-5">
              <Icon className="mb-4 text-[#1A7A75]" size={24} />
              <div className="font-bold text-gray-950">{label}</div>
              <p className="mt-2 text-sm leading-6 text-gray-600">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#F5F7FA] py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <InfoPanel title="Common challenges" items={industry.challenges} tone="dark" />
          <InfoPanel title="Smart Tracker solution" items={industry.solutions} />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-[#1A7A75]">
            Daily workflow
          </p>
          <h2 className="mt-3 text-3xl font-black leading-tight text-gray-950">
            From setup to daily control.
          </h2>
          <p className="mt-5 leading-7 text-gray-600">
            Smart Tracker is built for repeatable operational work: add assets, define the rules, monitor exceptions, and review the evidence when the trip is done.
          </p>
        </div>

        <div className="grid gap-4">
          {industry.workflow.map((step, index) => (
            <div key={step} className="flex gap-4 rounded-lg border border-gray-200 p-5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0D4A47] text-sm font-black text-white">
                {index + 1}
              </div>
              <p className="pt-1 leading-7 text-gray-700">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#071E1C] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-[#B2D4D2]">
                Expected outcomes
              </p>
              <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                Better visibility, faster response, cleaner records.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {industry.outcomes.map((outcome) => (
                <div key={outcome} className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <FiCheckCircle className="mb-4 text-[#22C55E]" size={22} />
                  <p className="text-sm leading-6 text-white/85">{outcome}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="text-sm font-bold uppercase tracking-widest text-[#B2D4D2]">
              Relevant modules
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {industry.modules.map((module) => (
                <span key={module} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white">
                  {module}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-[#1A7A75]">
              Explore more sectors
            </p>
            <h2 className="mt-3 text-3xl font-black text-gray-950">
              Smart Tracker adapts to every fleet model.
            </h2>
          </div>
          <Link href="/#industries" className="font-bold text-[#0D4A47] hover:text-[#F97316]">
            View all industries
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item) => (
            <Link
              key={item.slug}
              href={`/industries/${item.slug}`}
              className="group relative min-h-48 overflow-hidden rounded-lg"
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="font-bold text-white">{item.name}</div>
                <div className="mt-1 text-sm font-semibold text-[#B2D4D2]">Learn more</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function InfoPanel({
  title,
  items,
  tone = "light",
}: {
  title: string;
  items: string[];
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <div className={`rounded-lg p-6 ${dark ? "bg-[#0D4A47] text-white" : "bg-white text-gray-950"}`}>
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-6 grid gap-4">
        {items.map((item) => (
          <div key={item} className="flex gap-3">
            <FiCheckCircle className={dark ? "mt-1 shrink-0 text-[#B2D4D2]" : "mt-1 shrink-0 text-[#1A7A75]"} size={18} />
            <p className={`leading-7 ${dark ? "text-white/85" : "text-gray-600"}`}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

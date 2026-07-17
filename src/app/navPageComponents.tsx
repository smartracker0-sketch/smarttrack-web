import Link from "next/link";
import { FiArrowRight, FiCheckCircle } from "react-icons/fi";
import type { NavPage, NavSection } from "./navContent";

export function NavSectionLanding({ section }: { section: NavSection }) {
  return (
    <main className="min-h-screen bg-white text-gray-950">
      <Hero eyebrow={section.eyebrow} title={section.title} summary={section.summary} />
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {section.pages.map((page) => (
            <Link
              key={page.slug}
              href={`/${section.key}/${page.slug}`}
              className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="text-xs font-bold uppercase tracking-widest text-[#1A7A75]">{page.eyebrow}</div>
              <h2 className="mt-3 text-2xl font-black leading-tight text-[#0D4A47]">{page.label}</h2>
              <p className="mt-4 text-sm leading-7 text-gray-600">{page.summary}</p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#F97316]">
                Learn more
                <FiArrowRight className="transition group-hover:translate-x-1" size={16} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export function NavDetailPage({ section, page }: { section: NavSection; page: NavPage }) {
  const related = section.pages.filter((item) => item.slug !== page.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-white text-gray-950">
      <Hero eyebrow={page.eyebrow} title={page.title} summary={page.summary} />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#1A7A75]">{section.label}</div>
          <h2 className="mt-3 text-3xl font-black leading-tight text-[#0D4A47]">
            Built for practical fleet work.
          </h2>
          <p className="mt-5 leading-8 text-gray-600">
            Smart Tracker keeps the operational details visible: assets, alerts, trips, evidence, compliance records, and the decisions your team needs to make next.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {page.highlights.map((highlight) => (
            <div key={highlight} className="rounded-lg border border-gray-200 bg-[#F5F7FA] p-5">
              <FiCheckCircle className="text-[#1A7A75]" size={22} />
              <div className="mt-4 font-black text-[#0D4A47]">{highlight}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#071E1C] py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1fr]">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-[#B2D4D2]">Outcomes</div>
              <h2 className="mt-3 text-3xl font-black leading-tight">What your team can expect.</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {page.outcomes.map((outcome) => (
                <div key={outcome} className="rounded-lg border border-white/10 bg-white/5 p-5">
                  <FiCheckCircle className="text-[#22C55E]" size={22} />
                  <p className="mt-4 text-sm leading-6 text-white/80">{outcome}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#1A7A75]">More in {section.label}</div>
            <h2 className="mt-3 text-3xl font-black text-[#0D4A47]">Explore related pages.</h2>
          </div>
          <Link href={section.href} className="font-black text-[#F97316]">
            View all {section.label}
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {related.map((item) => (
            <Link key={item.slug} href={`/${section.key}/${item.slug}`} className="rounded-lg border border-gray-200 p-5 transition hover:bg-[#E8F4F3]">
              <div className="font-black text-[#0D4A47]">{item.label}</div>
              <p className="mt-2 text-sm leading-6 text-gray-600">{item.summary}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Hero({ eyebrow, title, summary }: { eyebrow: string; title: string; summary: string }) {
  return (
    <section className="relative overflow-hidden bg-[#071E1C] px-4 pb-24 pt-32 text-white sm:px-6 lg:px-8">
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[linear-gradient(115deg,transparent_0_48%,rgba(178,212,210,0.18)_49%_51%,transparent_52%),linear-gradient(35deg,transparent_0_48%,rgba(178,212,210,0.12)_49%_51%,transparent_52%)] bg-[length:110px_110px]" />
      </div>
      <div className="relative mx-auto max-w-7xl">
        <Link href="/" className="text-sm font-bold text-[#B2D4D2] transition hover:text-white">
          Smart Tracker
        </Link>
        <div className="mt-14 max-w-4xl">
          <div className="text-xs font-bold uppercase tracking-widest text-[#B2D4D2]">{eyebrow}</div>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-7xl">{title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">{summary}</p>
        </div>
      </div>
    </section>
  );
}

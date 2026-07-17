import Link from "next/link";

type LegalSection = {
  title: string;
  body: string[];
};

export function LegalPage({
  title,
  subtitle,
  sections,
}: {
  title: string;
  subtitle: string;
  sections: LegalSection[];
}) {
  return (
    <main className="min-h-screen bg-white text-gray-950">
      <section className="bg-[#071E1C] px-4 pb-20 pt-32 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-sm font-bold text-[#B2D4D2] transition hover:text-white">
            Smart Tracker
          </Link>
          <div className="mt-12 text-xs font-bold uppercase tracking-widest text-[#B2D4D2]">
            Legal
          </div>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">
            {subtitle}
          </p>
          <p className="mt-6 text-sm font-semibold text-[#B2D4D2]">
            Effective date: July 15, 2026
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="rounded-lg border border-gray-200 bg-[#F5F7FA] p-6">
              <h2 className="text-2xl font-black text-[#0D4A47]">{section.title}</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-gray-650">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-[#071E1C] p-6 text-white">
          <h2 className="text-xl font-black">Questions?</h2>
          <p className="mt-3 text-sm leading-7 text-white/75">
            Contact Smart Tracker Telematics at{" "}
            <a href="mailto:hello@smarttracker.io" className="font-bold text-[#B2D4D2] hover:text-white">
              hello@smarttracker.io
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}

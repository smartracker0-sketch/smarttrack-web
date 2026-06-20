export default function SupportPage() {
  return (
    <div className="p-6 grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Help</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>Support</h1>
        <p className="mt-4 text-sm leading-6 text-muted">Raise tickets, browse FAQs, and contact the Smart Tracker Telematics support team.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { title: 'Open a Ticket', desc: 'Report an issue or request assistance from our team.', action: 'New Ticket' },
          { title: 'FAQs', desc: 'Browse common questions and solutions for fleet management.', action: 'Browse FAQs' },
          { title: 'Live Chat', desc: 'Chat with a support agent during business hours.', action: 'Start Chat' },
        ].map((s) => (
          <div key={s.title} className="rounded-3xl border border-divider bg-surface p-6">
            <div className="text-sm font-extrabold" style={{ color: '#0D4A47' }}>{s.title}</div>
            <div className="mt-2 text-sm leading-6 text-muted">{s.desc}</div>
            <button className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold text-white transition-all hover:brightness-110" style={{ background: '#0D4A47' }}>
              {s.action}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

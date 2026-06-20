"use client";

import { useState } from "react";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
      style={{ background: checked ? "#F97316" : "rgba(255,255,255,0.12)" }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
      />
    </button>
  );
}

export default function PlatformSettingsPage() {
  const [flags, setFlags] = useState({ ev: true, elock: true, video: false, maintenance: true });
  const [limits, setLimits] = useState({ starter: 10, pro: 20, enterprise: 100 });
  const [maintenance, setMaintenance] = useState(false);

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div className="rounded-2xl p-5" style={{ background: "#0A2A28", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="text-sm font-bold text-white mb-4">{title}</div>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {maintenance && (
        <div className="rounded-xl px-4 py-3 text-sm font-semibold text-white" style={{ background: "#EF444433", border: "1px solid #EF4444" }}>
          ⚠️ Maintenance mode is ON — platform is currently in maintenance for all users.
        </div>
      )}

      <Section title="Feature Flags">
        {([
          { key: "ev", label: "EV Module", desc: "Enable electric vehicle monitoring features" },
          { key: "elock", label: "E-Lock Module", desc: "Enable electronic lock management" },
          { key: "video", label: "Video Telematics", desc: "Enable dashcam and CCTV features" },
          { key: "maintenance", label: "Maintenance Module", desc: "Enable service reminders and schedules" },
        ] as { key: keyof typeof flags; label: string; desc: string }[]).map(f => (
          <div key={f.key} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <div className="text-sm font-semibold text-white">{f.label}</div>
              <div className="text-xs mt-0.5" style={{ color: "#4A8A87" }}>{f.desc}</div>
            </div>
            <Toggle checked={flags[f.key]} onChange={v => setFlags(fl => ({ ...fl, [f.key]: v }))} />
          </div>
        ))}
      </Section>

      <Section title="Default Vehicle Limits per Plan">
        {(["starter", "pro", "enterprise"] as (keyof typeof limits)[]).map(plan => (
          <div key={plan} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="text-sm font-semibold text-white capitalize">{plan}</div>
            <input
              type="number"
              value={limits[plan]}
              onChange={e => setLimits(l => ({ ...l, [plan]: +e.target.value }))}
              className="w-24 h-8 px-3 rounded-lg text-sm text-white text-right outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
          </div>
        ))}
      </Section>

      <Section title="Notification Settings">
        {[
          { label: "SMS Gateway URL", placeholder: "https://sms.provider.com/api" },
          { label: "Email Sender Address", placeholder: "noreply@smarttracker.cloud" },
        ].map(f => (
          <div key={f.label} className="py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: "#7BBBB8" }}>{f.label}</label>
            <input placeholder={f.placeholder}
              className="w-full h-9 px-3 rounded-xl text-sm text-white outline-none"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
          </div>
        ))}
      </Section>

      <Section title="Maintenance Mode">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Enable Maintenance Mode</div>
            <div className="text-xs mt-0.5" style={{ color: "#4A8A87" }}>Takes the platform offline for all org users while admins can still access the console.</div>
          </div>
          <Toggle checked={maintenance} onChange={setMaintenance} />
        </div>
      </Section>

      <button className="h-10 px-6 rounded-xl text-sm font-bold text-white" style={{ background: "#F97316" }}>
        Save Changes
      </button>
    </div>
  );
}

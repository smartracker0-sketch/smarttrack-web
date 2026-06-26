"use client";

import { useEffect, useState } from "react";

type UserMe = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  roles: string[];
  createdAt: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (r) => {
        if (!r.ok) return;
        const d = await r.json();
        setUser(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const initials = user?.displayName
    ? user.displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="grid gap-6 p-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="text-xs font-semibold text-muted">Account</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Profile</h1>
      </div>

      <div className="rounded-3xl border border-divider bg-surface p-6">
        {loading ? (
          <div className="text-sm text-muted">Loading…</div>
        ) : user ? (
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className="h-12 w-12 rounded-2xl object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                <span className="text-sm font-extrabold">{initials}</span>
              </div>
            )}
            <div>
              <div className="text-sm font-extrabold">{user.displayName}</div>
              <div className="text-xs text-muted">{user.email}</div>
              <div className="mt-1 flex gap-1 flex-wrap">
                {(user.roles ?? []).map((r) => (
                  <span key={r} className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{r}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted">Could not load profile.</div>
        )}
      </div>
    </div>
  );
}


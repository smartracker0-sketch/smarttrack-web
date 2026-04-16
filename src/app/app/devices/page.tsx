"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Device = {
  id: string;
  imei: string;
  name: string;
  createdAt?: string;
};

type DevicePage = {
  content?: Device[];
};

export default function DevicesPage() {
  const [items, setItems] = useState<Device[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [newImei, setNewImei] = useState("");
  const [newName, setNewName] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((d) => d.name.toLowerCase().includes(q) || d.imei.includes(q));
  }, [items, query]);

  async function load() {
    setError("");
    setIsLoading(true);
    try {
      const resp = await fetch("/api/devices", { cache: "no-store" });
      if (!resp.ok) {
        const data = (await resp.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Failed to load devices");
        setItems([]);
        return;
      }
      const data = (await resp.json()) as DevicePage;
      setItems(Array.isArray(data.content) ? data.content : []);
    } catch {
      setError("Failed to load devices");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function addDevice() {
    const imei = newImei.trim();
    const name = newName.trim();
    if (!imei || !name) {
      setError("Please enter IMEI and name");
      return;
    }

    setError("");
    setIsAdding(true);
    try {
      const resp = await fetch("/api/devices", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ imei, name }),
      });
      if (!resp.ok) {
        const data = (await resp.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Failed to create device");
        return;
      }

      setNewImei("");
      setNewName("");
      await load();
    } catch {
      setError("Failed to create device");
    } finally {
      setIsAdding(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-divider bg-surface p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs font-semibold text-muted">Fleet</div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Devices</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Search, add, and manage tracking devices.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <div className="relative w-full md:w-[320px]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 w-full rounded-xl border border-divider bg-background px-4 text-sm outline-none focus:border-primary"
                placeholder="Search by name or IMEI…"
              />
            </div>
            <button
              type="button"
              onClick={load}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-divider bg-background px-4 text-sm font-semibold hover:bg-surface"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-3xl border border-divider bg-surface p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-extrabold">Device list</div>
            <div className="text-xs text-muted">{isLoading ? "Loading…" : `${filtered.length} shown`}</div>
          </div>
          <div className="mt-4 grid gap-3">
            {error ? (
              <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            ) : null}
            {isLoading ? (
              <div className="rounded-2xl border border-divider bg-background p-4 text-sm text-muted">
                Fetching devices…
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-divider bg-background p-6 text-sm text-muted">
                No devices found.
              </div>
            ) : (
              filtered.map((d) => (
                <Link
                  key={d.id}
                  href={`/app/devices/${d.id}`}
                  className="rounded-2xl border border-divider bg-background p-4 hover:bg-surface"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold">{d.name}</div>
                      <div className="mt-1 truncate text-xs text-muted">IMEI: {d.imei}</div>
                    </div>
                    <div className="text-xs text-muted">Open</div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-divider bg-surface p-6">
          <div className="text-sm font-extrabold">Add device</div>
          <div className="mt-1 text-xs text-muted">Register a new tracker to your fleet.</div>

          <div className="mt-5 grid gap-3">
            <label className="grid gap-2 text-sm font-semibold">
              IMEI
              <input
                value={newImei}
                onChange={(e) => setNewImei(e.target.value)}
                className="h-11 rounded-xl border border-divider bg-background px-4 text-sm outline-none focus:border-primary"
                placeholder="15-digit IMEI"
              />
            </label>
            <label className="grid gap-2 text-sm font-semibold">
              Name
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-11 rounded-xl border border-divider bg-background px-4 text-sm outline-none focus:border-primary"
                placeholder="e.g., Truck 12"
              />
            </label>
            <button
              type="button"
              onClick={addDevice}
              disabled={isAdding}
              className="mt-1 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAdding ? "Adding…" : "Add device"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

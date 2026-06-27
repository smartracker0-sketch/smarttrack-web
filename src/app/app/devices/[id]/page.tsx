"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Device = {
  id: string;
  imei: string;
  name: string;
  createdAt?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Telemetry = Record<string, any> | null;

export default function DeviceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [device, setDevice] = useState<Device | null>(null);
  const [telem, setTelem]   = useState<Telemetry>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = useCallback(async () => {
    setError("");
    setIsLoading(true);
    try {
      const resp = await fetch(`/api/devices/${params.id}`, { cache: "no-store" });
      if (!resp.ok) {
        const data = (await resp.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Failed to load device");
        setDevice(null);
        return;
      }
      const d = (await resp.json()) as Device;
      setDevice(d);
      setName(d.name ?? "");
      // Fetch latest telemetry
      const tr = await fetch(`/api/telemetry?type=latest&deviceId=${params.id}`).catch(() => null);
      if (tr?.ok) setTelem(await tr.json().catch(() => null));
    } catch {
      setError("Failed to load device");
      setDevice(null);
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    setError("");
    setIsSaving(true);
    try {
      const resp = await fetch(`/api/devices/${params.id}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmed, imei: device?.imei }),
      });
      if (!resp.ok) {
        const data = (await resp.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Failed to update device");
        return;
      }
      await load();
    } catch {
      setError("Failed to update device");
    } finally {
      setIsSaving(false);
    }
  }

  async function remove() {
    if (isDeleting) return;
    setError("");
    setIsDeleting(true);
    try {
      const resp = await fetch(`/api/devices/${params.id}`, { method: "DELETE" });
      if (!resp.ok) {
        const data = (await resp.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Failed to delete device");
        return;
      }
      router.replace("/app/devices");
      router.refresh();
    } catch {
      setError("Failed to delete device");
    } finally {
      setIsDeleting(false);
    }
  }

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/devices" className="text-sm font-semibold transition-colors" style={{ color: '#1A7A75' }}>
            ← Devices
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-divider bg-surface p-8">
        {isLoading ? (
          <div className="text-sm text-muted">Loading device…</div>
        ) : error ? (
          <div className="grid gap-3">
            <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
            <button
              type="button"
              onClick={load}
              className="inline-flex h-11 w-fit items-center justify-center rounded-xl border border-divider bg-background px-4 text-sm font-semibold hover:bg-surface"
            >
              Retry
            </button>
          </div>
        ) : device ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2">
              <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#1A7A75' }}>Device</div>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight" style={{ color: '#0D4A47' }}>{device.name}</h1>
              <div className="mt-4 grid gap-2 text-sm text-muted">
                <div>
                  <span className="font-semibold text-foreground">IMEI:</span> {device.imei}
                </div>
                <div>
                  <span className="font-semibold text-foreground">ID:</span> {device.id}
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-divider bg-background p-6">
                <div className="text-sm font-extrabold">Live Overview</div>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Metric label="Speed" value={telem?.speed != null ? `${telem.speed} km/h` : "—"} />
                  <Metric label="Ignition" value={telem ? (telem.ignition ? "ON" : "OFF") : "—"} />
                  <Metric label="Last update" value={telem?.timestamp ? new Date(telem.timestamp).toLocaleTimeString() : "—"} />
                </div>
                {telem?.batteryVoltage != null && (
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Metric label="Battery" value={`${(telem.batteryVoltage / 1000).toFixed(2)} V`} />
                    {telem.latitude != null && <Metric label="Lat / Lng" value={`${Number(telem.latitude).toFixed(4)}, ${Number(telem.longitude).toFixed(4)}`} />}
                  </div>
                )}
                {!telem && <p className="mt-3 text-xs" style={{ color: "#9ca3af" }}>No telemetry data yet — data will appear once the device connects.</p>}
              </div>
            </div>

            <div className="rounded-3xl border border-divider bg-background p-6">
              <div className="text-sm font-extrabold">Settings</div>
              <div className="mt-4 grid gap-3">
                <label className="grid gap-2 text-sm font-semibold">
                  Name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-xl border border-divider bg-surface px-4 text-sm outline-none focus:border-primary"
                  />
                </label>
                {error ? (
                  <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
                ) : null}
                <button
                  type="button"
                  onClick={save}
                  disabled={isSaving}
                  className="inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: '#0D4A47' }}
                >
                  {isSaving ? "Saving…" : "Save changes"}
                </button>

                <div className="mt-4 border-t border-divider pt-4">
                  <div className="text-xs font-semibold text-muted">Danger zone</div>
                  <button
                    type="button"
                    onClick={remove}
                    disabled={isDeleting}
                    className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-danger px-6 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isDeleting ? "Removing…" : "Remove device"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted">No device found.</div>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: '#C5E0DE', background: '#fff' }}>
      <div className="text-xs font-semibold" style={{ color: '#1A7A75' }}>{label}</div>
      <div className="mt-2 text-lg font-extrabold" style={{ color: '#0D4A47' }}>{value}</div>
    </div>
  );
}

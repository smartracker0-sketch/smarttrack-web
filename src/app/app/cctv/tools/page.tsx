"use client";

import { useEffect, useState } from "react";
import MettaCameraTools from "@/components/MettaCameraTools";

type Camera = { id: string; name: string };
export default function CameraToolsPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { const controller = new AbortController(); void fetch("/api/dashcams", { signal: controller.signal, cache: "no-store" }).then(async response => { if (!response.ok) throw new Error("Could not load your cameras. Check your connection and sign-in status."); const data: Camera[] = await response.json(); if (!Array.isArray(data)) throw new Error("Camera list unavailable"); setCameras(data); const requested = new URLSearchParams(window.location.search).get("deviceId"); setSelected(data.find(c => c.id === requested)?.id ?? data[0]?.id ?? ""); }).catch(cause => { if (!controller.signal.aborted) setError(cause.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); }); return () => controller.abort(); }, []);
  return <main className="mx-auto max-w-5xl space-y-5 p-4 text-slate-800 sm:p-6">{error && <p role="alert">{error}</p>}{loading && <p role="status">Loading cameras…</p>}{cameras.length > 0 && <label className="block text-sm font-semibold">Camera<select className="ml-3 rounded-lg border p-2" value={selected} onChange={event => setSelected(event.target.value)}>{cameras.map(camera => <option key={camera.id} value={camera.id}>{camera.name}</option>)}</select></label>}{selected && <MettaCameraTools key={selected} deviceId={selected} />}{!loading && !error && !cameras.length && <p>No cameras assigned to your account.</p>}</main>;
}

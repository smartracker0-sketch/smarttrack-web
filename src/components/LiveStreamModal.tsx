"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FiRefreshCw, FiX } from "react-icons/fi";
import DashcamLiveStream, { type StreamCamera } from "@/components/DashcamLiveStream";

type Camera = StreamCamera & { lastSeenAt?: string | null };
export default function LiveStreamModal({ deviceId, name, onClose }: { deviceId: string; name: string; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [camera, setCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.current?.showModal();
    document.body.style.overflow = "hidden";
    const element = dialog.current;
    return () => { element?.close(); document.body.style.overflow = previousOverflow; if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus(); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError(""); setCamera(null);
      try {
        const response = await fetch("/api/dashcams", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error(response.status === 401 ? "Your session expired. Sign in again to view live video." : "Could not load camera status. Please retry.");
        const rows: Camera[] = await response.json();
        if (!Array.isArray(rows)) throw new Error("Camera status is unavailable.");
        const assigned = rows.find(item => String(item.id) === deviceId);
        if (!assigned) throw new Error("No live camera is assigned to this vehicle.");
        if (!controller.signal.aborted) setCamera(assigned);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load the camera.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [deviceId, refresh]);
  return <dialog ref={dialog} aria-labelledby="live-stream-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="m-auto max-h-[90dvh] w-[calc(100%_-_1.5rem)] max-w-4xl overflow-y-auto rounded-xl border-0 bg-white p-0 text-[#173f3c] shadow-2xl backdrop:bg-black/65">
    <section className="p-4 sm:p-5">
      <header className="mb-4 flex items-start justify-between gap-3"><div className="min-w-0"><h2 id="live-stream-title" className="text-lg font-extrabold">Live stream</h2><p className="mt-1 break-words text-sm text-[#657b7d]">{name}</p></div><button type="button" autoFocus onClick={onClose} aria-label="Close live stream" className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-slate-100 text-xl hover:bg-slate-200"><FiX /></button></header>
      {loading && <div role="status" className="grid aspect-video place-items-center rounded-lg bg-[#111718] text-sm text-white">Connecting to camera…</div>}
      {error && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">{error}</div>}
      {camera && <DashcamLiveStream key={`${camera.id}-${refresh}`} camera={camera} autoStart />}
      <Link href={`/app/cctv/tools?deviceId=${encodeURIComponent(deviceId)}`} className="mt-3 mr-3 inline-flex min-h-10 items-center rounded-md bg-teal-700 px-3 text-xs font-bold text-white">Camera tools and recordings</Link>
      {!loading && <button type="button" onClick={() => setRefresh(value => value + 1)} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs font-bold"><FiRefreshCw />Refresh camera status</button>}
    </section>
  </dialog>;
}

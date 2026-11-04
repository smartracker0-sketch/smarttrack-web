"use client";

import Hls from "hls.js";
import { LiveStreamSession } from "@/lib/liveStreamSession";
import { useEffect, useRef, useState } from "react";
import { FiCamera, FiPlay, FiRefreshCw, FiSquare } from "react-icons/fi";

const streamSession = new LiveStreamSession();

export type StreamCamera = { id: string; name: string; online: boolean };

export default function DashcamLiveStream({ camera, autoStart = false }: { camera: StreamCamera; autoStart?: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [channel, setChannel] = useState(1);
  const [requested, setRequested] = useState(autoStart);
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState("Ready");
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const source = `/api/dashcams/${encodeURIComponent(camera.id)}/stream/${channel}/live.m3u8`;

  useEffect(() => {
    let close = () => {};
    async function start() {
      setPlaying(false);
      setError("");
      if (!requested || !camera.online) { setPhase("Ready"); return; }
      setPhase("Starting camera…");
      close = streamSession.open(camera.id, channel,
        () => { setPlaying(true); setPhase("Connecting video…"); },
        cause => { setError(cause.message); setPhase("Unable to connect"); });
    }
    void start();
    return () => close();
  }, [camera.id, camera.online, channel, requested, attempt]);

  useEffect(() => {
    if (!playing || !videoRef.current) return;
    const video = videoRef.current;
    let hls: Hls | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const deadline = Date.now() + 60_000;
    const reportPlaying = () => { if (timer) clearTimeout(timer); setPhase("Live"); setError(""); };
    const play = () => { void video.play().catch(() => { if (!disposed) setError("Tap the play button to watch live video."); }); };
    const retry = (load: () => void) => {
      if (disposed) return;
      if (Date.now() >= deadline) { setError("No video received yet. Check the camera connection, then retry."); setPhase("Video unavailable"); return; }
      setPhase("Waiting for camera video…");
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { if (!disposed) load(); }, 2000);
    };
    video.addEventListener("playing", reportPlaying);
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      const load = () => { video.src = source; video.load(); play(); };
      const failed = () => retry(load);
      video.addEventListener("error", failed);
      load();
      return () => { disposed = true; if (timer) clearTimeout(timer); video.removeEventListener("playing", reportPlaying); video.removeEventListener("error", failed); video.pause(); video.removeAttribute("src"); video.load(); };
    }
    if (Hls.isSupported()) {
      hls = new Hls({ liveSyncDurationCount: 2, lowLatencyMode: true });
      hls.attachMedia(video);
      hls.loadSource(source);
      hls.on(Hls.Events.MANIFEST_PARSED, play);
      hls.on(Hls.Events.ERROR, (_event, data) => { if (data.fatal) retry(() => hls?.loadSource(source)); });
    } else {
      timer = setTimeout(() => setError("Live video is not supported by this browser. Try a current version of Chrome or Safari."), 0);
    }
    return () => { disposed = true; if (timer) clearTimeout(timer); video.removeEventListener("playing", reportPlaying); hls?.destroy(); video.pause(); video.removeAttribute("src"); video.load(); };
  }, [playing, source]);

  return <div className="overflow-hidden rounded-lg border border-[#d9e3e5] bg-[#111718]">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2 text-white">
      <div className="flex items-center gap-2 text-xs font-semibold" role="status"><span className={`h-2 w-2 rounded-full ${phase === "Live" ? "animate-pulse bg-red-500" : "bg-slate-400"}`} />{camera.online ? phase : "Camera offline"}</div>
      <div className="flex gap-1" aria-label="Camera channel">{[1, 2].map(value => <button key={value} type="button" aria-pressed={channel === value} onClick={() => setChannel(value)} className={`min-h-10 rounded-md px-4 text-xs font-bold ${channel === value ? "bg-[#27837d]" : "bg-white/10"}`}>{value === 1 ? "Road" : "Cabin"}</button>)}</div>
    </div>
    <div className="relative aspect-video bg-black">
      <video ref={videoRef} aria-label={`${camera.name} ${channel === 1 ? "road" : "cabin"} live video`} controls playsInline muted autoPlay className={`h-full w-full object-contain ${playing ? "block" : "hidden"}`} />
      {!playing && <div className="absolute inset-0 grid place-items-center p-5 text-center text-white"><div><FiCamera className="mx-auto mb-3 text-3xl text-[#55bcb4]" /><p className="font-semibold">{!camera.online ? "Camera is not connected" : requested ? phase : "Ready to watch live video"}</p><p className="mt-2 text-xs text-[#a9b7b8]">{camera.online ? "Live video will appear here when the camera connects." : "Power on the camera and check its mobile data connection, then refresh its status."}</p></div></div>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-3">
      <p role={error ? "alert" : undefined} className="text-xs text-amber-300">{error}</p>
      <div className="ml-auto flex gap-2">{requested && <button type="button" onClick={() => { setRequested(false); }} className="flex min-h-10 items-center gap-2 rounded-md bg-red-700 px-4 text-xs font-bold text-white"><FiSquare /> Stop</button>}
        <button type="button" disabled={!camera.online} onClick={() => { setRequested(true); setAttempt(value => value + 1); }} className="flex min-h-10 items-center gap-2 rounded-md bg-[#27837d] px-4 text-xs font-bold text-white disabled:opacity-50">{requested ? <FiRefreshCw /> : <FiPlay />}{requested ? "Retry video" : "Start live"}</button>
      </div>
    </div>
  </div>;
}

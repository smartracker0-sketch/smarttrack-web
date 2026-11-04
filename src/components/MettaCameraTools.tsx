"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import CameraRecordingPlayer from "@/components/CameraRecordingPlayer";
import { CameraAudioPlayer, type CameraAudioChunk } from "@/lib/cameraAudio";

type Field = { name: string; type: string; hint: string; defaultValue: string };
type Capability = { key: string; label: string; messageId: number; fields: Field[] };
type Command = { id: string; command: string; status: string; sequence: number; createdAt: string; response?: string };
type CameraEvent = { id: string; eventType: string; eventTime: string; metadata?: string };
type Status = { serverDefaults?: { host: string; mediaPort: number; attachmentPort: number }; connected: boolean; version: string; commands: Capability[]; notSpecified: string[] };

export default function MettaCameraTools({ deviceId }: { deviceId: string }) {
  const base = `/api/dashcams/${encodeURIComponent(deviceId)}/mettax`;
  const [status, setStatus] = useState<Status | null>(null);
  const [commands, setCommands] = useState<Command[]>([]);
  const [events, setEvents] = useState<CameraEvent[]>([]);
  const [selected, setSelected] = useState("recordings");
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [peripheral, setPeripheral] = useState("");
  const [sending, setSending] = useState(false);
  const [playback, setPlayback] = useState<{ channel: number; attempt: number } | null>(null);
  const [talking, setTalking] = useState(false);
  const [listening, setListening] = useState(false);
  const listener = useRef<(() => void) | null>(null);
  const microphone = useRef<(() => void) | null>(null);
  const generation = useRef(0);
  const activeChannels = useRef(new Set<number>());
  const playbackChannel = playback?.channel;
  const action = status?.commands.find(item => item.key === selected);
  const refresh = useCallback(async (signal?: AbortSignal) => {
    async function get(path: string) { const r = await fetch(path, { signal, cache: "no-store" }); if (!r.ok) throw new Error((await r.json().catch(() => null))?.message || "Could not load camera tools"); return r.json(); }
    try {
      const [state, history, reports] = await Promise.all([get(`${base}/capabilities`), get(`${base}/commands?size=20`), get(`/api/dashcams/${encodeURIComponent(deviceId)}/events?size=30`)]);
      if (!signal?.aborted) { setStatus(state); setCommands(history.content ?? []); setEvents(reports.content ?? []); }
    } catch (cause) { if (!signal?.aborted) setError(cause instanceof Error ? cause.message : "Camera status unavailable"); }
  }, [base, deviceId]);
  useEffect(() => { const controller = new AbortController(); void refresh(controller.signal); const timer = setInterval(() => void refresh(controller.signal), 5000); return () => { controller.abort(); clearInterval(timer); }; }, [refresh]);
  useEffect(() => () => { generation.current++; microphone.current?.(); listener.current?.(); }, [deviceId]);
  useEffect(() => {
    if (playbackChannel == null) return;
    const channel = playbackChannel;
    return () => { void fetch(`${base}/commands`, { method: "POST", keepalive: true, headers: { "content-type": "application/json" }, body: JSON.stringify({ command: "playbackControl", arguments: { channel, control: 2 } }) }).catch(() => {}); };
  }, [base, playbackChannel]);

  useEffect(() => {
    const channels = activeChannels.current;
    return () => { for (const channel of channels) { void fetch(`${base}/commands`, { method: "POST", keepalive: true, headers: { "content-type": "application/json" }, body: JSON.stringify({ command: "liveControl", arguments: { channel, control: 0 } }) }).catch(() => {}); } channels.clear(); };
  }, [base]);
  const value = (field: Field) => values[field.name] ?? (field.name === "host" ? status?.serverDefaults?.host || "api.smarttracker.cloud" : field.name === "tcpPort" && ["live", "playback"].includes(selected) ? String(status?.serverDefaults?.mediaPort || 5018) : field.name === "tcpPort" && selected === "attachments" ? String(status?.serverDefaults?.attachmentPort || 5017) : field.defaultValue);
  async function send(event: React.FormEvent) {
    event.preventDefault(); if (!action || sending) return;
    if (action.key === "relay" && !window.confirm("Send the relay command to this camera? It may control the vehicle circuit. The server will check that the vehicle is stopped.")) return;
    setError(""); setNotice(""); setSending(true);
    const args = Object.fromEntries(action.fields.map(field => [field.name, value(field)]));
    try {
      const response = await fetch(`${base}/commands`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ command: action.key, arguments: args }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.message || "Camera command failed");
      if (action.key === "live") activeChannels.current.add(Number(args.channel));
      if (action.key === "liveControl" && args.control === "0") activeChannels.current.delete(Number(args.channel));
      if (action.key === "playback") setPlayback({ channel: Number(args.channel), attempt: Date.now() });
      if (action.key === "playbackControl" && args.control === "2") setPlayback(null);
      setValues(current => ({ ...current, password: "" })); setNotice("Command sent. Its result will appear below when the camera replies."); await refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Camera command failed"); } finally { setSending(false); }
  }
  async function toggleMicrophone() {
    if (microphone.current) { microphone.current(); microphone.current = null; setTalking(false); return; }
    const current = ++generation.current;
    let media: MediaStream | null = null;
    let context: AudioContext | null = null;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone access requires a supported browser over HTTPS.");
      media = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
      if (current !== generation.current) { media.getTracks().forEach(track => track.stop()); return; }
      microphone.current = () => { generation.current++; media?.getTracks().forEach(track => track.stop()); if (context && context.state !== "closed") void context.close().catch(() => {}); };
      context = new AudioContext(); await context.resume();
      if (current !== generation.current) { media.getTracks().forEach(track => track.stop()); if (context.state !== "closed") void context.close().catch(() => {}); return; }
      const source = context.createMediaStreamSource(media);
      const processor = context.createScriptProcessor(4096, 1, 1);
      let busy = false;
      let queued = new Uint8Array(0);
      const channel = Number(values.channel || "1");
      const cleanup = () => { generation.current++; processor.disconnect(); source.disconnect(); media?.getTracks().forEach(track => track.stop()); if (context && context.state !== "closed") void context.close().catch(() => {}); };
      microphone.current = cleanup;
      function sendBuffered() {
        if (busy || current !== generation.current || queued.length < 4000) return;
        const payload = queued.slice(0, 4000); queued = queued.slice(4000); busy = true;
        void fetch(`${base}/audio/${channel}`, { method: "POST", headers: { "content-type": "application/octet-stream" }, body: payload.buffer }).then(async response => { if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || "Audio transmission failed"); }).catch(cause => { if (current === generation.current) { setError(cause.message); cleanup(); microphone.current = null; setTalking(false); } }).finally(() => { busy = false; sendBuffered(); });
      }
      processor.onaudioprocess = event => {
        if (current !== generation.current) return;
        const samples = event.inputBuffer.getChannelData(0), ratio = (context?.sampleRate || 48000) / 8000;
        const pcm = new ArrayBuffer(Math.floor(samples.length / ratio) * 2), view = new DataView(pcm);
        for (let i = 0; i < pcm.byteLength / 2; i++) { let total = 0, count = 0; for (let j = Math.floor(i * ratio); j < Math.floor((i + 1) * ratio); j++) { total += samples[j] || 0; count++; } const sample = Math.max(-1, Math.min(1, total / Math.max(count, 1))); view.setInt16(i * 2, sample < 0 ? sample * 32768 : sample * 32767, true); }
        const merged = new Uint8Array(queued.length + pcm.byteLength); merged.set(queued); merged.set(new Uint8Array(pcm), queued.length); queued = merged.slice(Math.max(0, merged.length - 16000)); sendBuffered();
      };
      source.connect(processor); processor.connect(context.destination); setTalking(true); setError("");
    } catch (cause) { media?.getTracks().forEach(track => track.stop()); if (context && context.state !== "closed") void context.close().catch(() => {}); if (current === generation.current) { microphone.current = null; setError(cause instanceof Error ? cause.message : "Microphone unavailable"); } }
  }
  async function toggleListening() {
    if (listener.current) { listener.current(); listener.current = null; setListening(false); return; }
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cursor = 0;
    const player = new CameraAudioPlayer(cause => { setError(cause.message); stop(); });
    function stop() { controller.abort(); if (timer) clearTimeout(timer); player.stop(); listener.current = null; setListening(false); }
    listener.current = stop;
    try { await player.start(); if (controller.signal.aborted) return; setListening(true); setError(""); } catch (cause) { stop(); setError(cause instanceof Error ? cause.message : "Audio unavailable"); return; }
    const channel = Number(values.channel || "1");
    async function poll() {
      try {
        const response = await fetch(`${base}/audio/${channel}?after=${cursor}`, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error((await response.json().catch(() => null))?.message || "Camera audio unavailable");
        const chunks: CameraAudioChunk[] = await response.json();
        if (controller.signal.aborted) return;
        for (const chunk of chunks) { player.feed(chunk); cursor = chunk.sequence; }
        timer = setTimeout(() => void poll(), 200);
      } catch (cause) { if (!controller.signal.aborted) { setError(cause instanceof Error ? cause.message : "Camera audio unavailable"); stop(); } }
    }
    void poll();
  }
  async function readPeripheral() {
    try { const response = await fetch(`${base}/data/${Number(values.channel || "1")}`, { cache: "no-store" }); if (!response.ok) throw new Error("Peripheral data unavailable"); setPeripheral(JSON.stringify(await response.json(), null, 2)); } catch (cause) { setError(cause instanceof Error ? cause.message : "Peripheral data unavailable"); }
  }
  return <div className="space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-bold">Camera tools</h2><p className="mt-1 text-sm text-slate-600">{status?.connected ? "Camera connected · MettaX " + status.version : "Waiting for the camera’s advanced connection"}</p></div><Link href="/app/cctv" className="rounded-lg border px-4 py-2 text-sm">Back to live cameras</Link></header>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>}
    {notice && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-emerald-900">{notice}</p>}
    {!status && <p role="status">Loading camera tools…</p>}
    {status && <>
      {!status.connected && <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Advanced controls become available when this camera connects to the MettaX service. Your existing live camera connection can continue working.</p>}
      <form onSubmit={send} className="rounded-xl border bg-white p-4 sm:p-5">
        <label className="block text-sm font-semibold">Choose an action<select value={selected} onChange={event => { setSelected(event.target.value); setValues({}); setNotice(""); }} className="mt-2 w-full rounded-lg border bg-white p-3">{status.commands.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">{action?.fields.map(field => <label key={field.name} className="block text-sm font-semibold">{field.name.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase())}{choices(selected, field.name) ? <select value={value(field)} onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))} className="mt-1 w-full rounded-lg border bg-white p-2.5 font-normal">{choices(selected, field.name)?.map(([code, label]) => <option key={code} value={code}>{label}</option>)}</select> : <input type={field.type === "password" ? "password" : field.type === "number" ? "number" : field.type === "datetime-local" ? "datetime-local" : "text"} value={value(field)} autoComplete="off" onChange={event => setValues(current => ({ ...current, [field.name]: event.target.value }))} className="mt-1 w-full rounded-lg border p-2.5 font-normal" />}<span className="mt-1 block text-xs font-normal text-slate-500">{field.hint}</span></label>)}</div>
        <button type="submit" disabled={!status.connected || sending} className="mt-5 rounded-lg bg-teal-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{sending ? "Sending…" : "Send to camera"}</button>
      </form>
      {playback && <CameraRecordingPlayer deviceId={deviceId} channel={playback.channel} attempt={playback.attempt} />}
      <section className="rounded-xl border bg-white p-4"><h3 className="font-bold">Talk to the camera</h3><p className="my-2 text-sm text-slate-600">Start an intercom, listening, or broadcast session above, then enable audio or your microphone. Use the same channel. Stop the microphone when finished.</p><button type="button" disabled={!status.connected} onClick={() => void toggleMicrophone()} className={`rounded-lg px-4 py-3 text-white disabled:opacity-50 ${talking ? "bg-red-700" : "bg-teal-700"}`}>{talking ? "Stop microphone" : "Enable microphone"}</button><button type="button" disabled={!status.connected} onClick={() => void toggleListening()} className="ml-3 rounded-lg border px-4 py-3 disabled:opacity-50">{listening ? "Stop listening" : "Listen to camera"}</button></section>
      {(selected === "transparent" || selected === "live" && values.mediaType === "5") && <section className="rounded-xl border bg-white p-4"><h3 className="font-bold">Live peripheral data</h3><button type="button" onClick={() => void readPeripheral()} className="my-3 rounded-lg border px-4 py-2">Read recent data</button>{peripheral && <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs">{peripheral}</pre>}</section>}
      <section className="rounded-xl border bg-white p-4"><h3 className="mb-3 font-bold">Command results</h3>{commands.length === 0 && <p className="text-sm text-slate-500">No commands sent yet.</p>}<div className="space-y-3">{commands.map(command => <div key={command.id} className="border-t pt-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><strong>{status.commands.find(c => c.key === command.command)?.label || command.command}</strong><span>{command.status.replaceAll("_", " ")}</span></div><p className="text-xs text-slate-500">{new Date(command.createdAt).toLocaleString()} · Reference {command.sequence}</p>{command.response && <RecordingResults response={command.response} onChoose={row => { setSelected("playback"); setValues({ host: status.serverDefaults?.host || "api.smarttracker.cloud", tcpPort: String(status.serverDefaults?.mediaPort || 5018), ...Object.fromEntries(Object.entries(row).map(([key, value]) => [key, String(value)]).filter(([key]) => ["channel", "startTime", "endTime", "mediaType", "streamType", "storageType"].includes(key))) }); setNotice("Recording selected. Review the playback settings above, then send to the camera."); }} />} {command.response && <details className="mt-2"><summary className="cursor-pointer">View camera response</summary><pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded bg-slate-50 p-3 text-xs">{pretty(command.response)}</pre></details>}</div>)}</div></section>
      <section className="rounded-xl border bg-white p-4"><h3 className="mb-3 font-bold">Camera reports and files</h3>{events.map(event => <article key={event.id} className="border-t py-3 text-sm"><strong>{event.eventType.replaceAll("_", " ")}</strong><p className="text-xs text-slate-500">{new Date(event.eventTime).toLocaleString()}</p>{event.metadata && <Report metadata={event.metadata} base={base} />}</article>)}</section>
      <details className="rounded-xl border p-4 text-sm text-slate-600"><summary>Vendor specification notes</summary><ul className="mt-2 list-disc space-y-1 pl-5">{status.notSpecified.map(note => <li key={note}>{note}</li>)}</ul></details>
    </>}
  </div>;
}
function pretty(value: string) { try { return JSON.stringify(JSON.parse(value), null, 2); } catch { return value; } }
function Report({ metadata, base }: { metadata: string; base: string }) {
  const [telemetry, setTelemetry] = useState("");
  let file: { id?: string; name?: string } | null = null;
  try { const data = JSON.parse(metadata).data; file = data?.image ?? (data?.fileId ? { id: data.fileId, name: data.name } : null); } catch { /* Legacy metadata may be plain text. */ }
  return <div>{file?.id && <a className="mt-2 inline-block font-semibold text-teal-700 underline" href={`${base}/files/${encodeURIComponent(file.id)}`}>Download {file.name || "camera file"}</a>}{file?.id && file.name?.endsWith(".bin") && <button type="button" onClick={() => { void fetch(`${base}/files/${encodeURIComponent(file?.id || "")}/telemetry`, { cache: "no-store" }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.message || "Cannot decode this telemetry file"); setTelemetry(JSON.stringify(data, null, 2)); }).catch(cause => setTelemetry(cause.message)); }} className="ml-3 rounded border px-3 py-2">View attached telemetry</button>}{telemetry && <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs">{telemetry}</pre>}<details className="mt-2"><summary className="cursor-pointer">View details</summary><pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words rounded bg-slate-50 p-3 text-xs">{pretty(metadata)}</pre></details></div>;
}

function RecordingResults({ response, onChoose }: { response: string; onChoose(row: Record<string, unknown>): void }) {
  let rows: Record<string, unknown>[] = [];
  try { const data = JSON.parse(response); if (Array.isArray(data.recordings)) rows = data.recordings; } catch { return null; }
  if (!rows.length) return null;
  return <div className="mt-3 space-y-2">{rows.map((row, index) => <div key={index} className="flex flex-wrap items-center justify-between gap-2 rounded bg-slate-50 p-3"><span>Channel {String(row.channel)} · {String(row.startTime).replace("T", " ")} → {String(row.endTime).replace("T", " ")}</span><button type="button" onClick={() => onChoose(row)} className="rounded border px-3 py-2 font-semibold text-teal-700">Select recording</button></div>)}</div>;
}

function choices(command: string, field: string): [string, string][] | undefined {
  const list = (labels: string[]) => labels.map((label, index): [string, string] => [String(index), label]);
  if (field === "mediaType") return list(command === "live" ? ["Video and audio", "Video only", "Two-way intercom", "Listen to camera", "Broadcast voice", "Passthrough"] : ["Video and audio", "Audio only", "Video only", "Audio or video"]);
  if (field === "streamType") return list(["live", "liveControl"].includes(command) ? ["Main stream", "Sub-stream"] : ["All streams", "Main stream", "Sub-stream"]);
  if (field === "storageType") return list(["All storage", "Main storage", "Backup storage"]);
  if (field === "save") return list(["Upload to server", "Save on camera"]);
  if (field === "resolution") return ["320 × 240", "640 × 480", "800 × 600", "1024 × 768", "176 × 144", "352 × 288", "704 × 288", "704 × 576"].map((label, i): [string, string] => [String(i + 1), label]);
  if (field === "command" && command === "relay") return [["112", "Relay off"], ["113", "Relay on"]];
  if (field === "control") return list(command === "liveControl" ? ["Close media", "Switch stream", "Pause", "Resume", "Close intercom"] : command === "uploadControl" ? ["Pause transfer", "Resume transfer", "Cancel transfer"] : ["Start playback", "Pause playback", "End playback", "Fast forward", "Rewind keyframes", "Seek to time", "Play keyframes"]);
  if (field === "closeType") return list(["Close video and audio", "Close audio only", "Close video only", "Open video and audio"]);
  if (field === "mode") return list(["Normal playback", "Fast forward", "Rewind keyframes", "Play keyframes", "Single frame"]);
  if (field === "speed") return list(["Default", "1×", "2×", "4×", "8×", "16×"]);
  return undefined;
}

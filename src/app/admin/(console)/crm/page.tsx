"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiEdit3,
  FiInbox,
  FiMail,
  FiPaperclip,
  FiRefreshCw,
  FiSearch,
  FiSend,
  FiX,
} from "react-icons/fi";

type MailMessage = {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  from: string;
  to: string;
  cc?: string[];
  bcc?: string[];
  attachments?: string[];
  subject: string;
  textBody?: string | null;
  deliveryStatus: string;
  sentAt: string;
};

type MailThread = {
  id: string;
  contactEmail: string;
  contactName?: string | null;
  subject: string;
  status: string;
  latestMessageAt: string;
  messages?: MailMessage[];
};

const emptyCompose = { to: "", contactName: "", cc: "", bcc: "", subject: "", message: "" };

function recipientList(value: string) {
  return value.split(/[;,]/).map((item) => item.trim()).filter(Boolean);
}

async function encodedAttachments(files: File[]) {
  return Promise.all(files.map(async (file) => ({
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    content: await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
      reader.onload = () => resolve(String(reader.result).split(",", 2)[1] ?? "");
      reader.readAsDataURL(file);
    }),
  })));
}

function timeText(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function initials(thread: MailThread) {
  return (thread.contactName || thread.contactEmail || "C").slice(0, 1).toUpperCase();
}

export default function AdminCrmPage() {
  const [threads, setThreads] = useState<MailThread[]>([]);
  const [selected, setSelected] = useState<MailThread | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [compose, setCompose] = useState(emptyCompose);
  const [reply, setReply] = useState("");
  const [replyCc, setReplyCc] = useState("");
  const [replyBcc, setReplyBcc] = useState("");
  const [composeFiles, setComposeFiles] = useState<File[]>([]);
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadThreads = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch(`/api/admin/crm/emails?query=${encodeURIComponent(query)}&size=50`, { cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 403 ? "Your admin session has expired." : "Could not load CRM mail.");
      const data = await response.json();
      setThreads(Array.isArray(data) ? data : data?.content ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load CRM mail.");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [query]);

  const openThread = useCallback(async (thread: MailThread) => {
    setError(null);
    const response = await fetch(`/api/admin/crm/emails/${encodeURIComponent(thread.id)}`, { cache: "no-store" });
    if (!response.ok) {
      setError("Could not open this conversation.");
      return;
    }
    setSelected(await response.json());
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => void loadThreads(), 250); return () => window.clearTimeout(timer); }, [loadThreads]);
  useEffect(() => { const timer = window.setInterval(() => void loadThreads(true), 30000); return () => window.clearInterval(timer); }, [loadThreads]);

  const received = useMemo(() => selected?.messages?.filter((message) => message.direction === "INBOUND").length ?? 0, [selected]);
  const sent = useMemo(() => selected?.messages?.filter((message) => message.direction === "OUTBOUND").length ?? 0, [selected]);

  async function sendNew() {
    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/crm/emails", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...compose, cc: recipientList(compose.cc), bcc: recipientList(compose.bcc), attachments: await encodedAttachments(composeFiles) }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message ?? "Could not send email.");
      setCompose(emptyCompose);
      setComposeFiles([]);
      setComposeOpen(false);
      setSelected(data);
      await loadThreads(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send email.");
    } finally {
      setSending(false);
    }
  }

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/crm/emails/${encodeURIComponent(selected.id)}/reply`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: reply, cc: recipientList(replyCc), bcc: recipientList(replyBcc), attachments: await encodedAttachments(replyFiles) }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message ?? "Could not send reply.");
      setSelected(data);
      setReply("");
      setReplyCc("");
      setReplyBcc("");
      setReplyFiles([]);
      await loadThreads(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send reply.");
    } finally {
      setSending(false);
    }
  }

  function selectFiles(files: FileList | null, target: "compose" | "reply") {
    const selectedFiles = Array.from(files ?? []);
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    if (selectedFiles.length > 5 || totalSize > 3 * 1024 * 1024) {
      setError("Attach up to 5 files with a combined size of 3 MB.");
      return;
    }
    setError(null);
    if (target === "compose") setComposeFiles(selectedFiles);
    else setReplyFiles(selectedFiles);
  }

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-lg border border-white/10 bg-[#071e1c] text-white">
      <section className={`${selected ? "hidden md:flex" : "flex"} w-full flex-col border-r border-white/10 md:w-[350px] md:shrink-0`}>
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div><h1 className="text-sm font-extrabold">Customer Mail</h1><p className="mt-0.5 text-[10px] text-[#669995]">Inbox and sent conversations</p></div>
          <button type="button" onClick={() => setComposeOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#f97316] px-3 text-xs font-bold text-white"><FiEdit3 size={14} />Compose</button>
        </div>
        <div className="border-b border-white/10 p-3">
          <div className="relative"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a817d]" size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email or subject" className="h-10 w-full rounded-md border border-white/10 bg-white/5 pl-9 pr-9 text-xs text-white outline-none placeholder:text-[#416d69] focus:border-[#f97316]/60" /><button type="button" onClick={() => void loadThreads()} className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center text-[#669995]" aria-label="Refresh inbox"><FiRefreshCw size={13} /></button></div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? <div className="p-6 text-xs text-[#669995]">Loading conversations...</div> : threads.length === 0 ? <div className="grid h-full min-h-64 place-items-center p-8 text-center"><div><FiInbox className="mx-auto text-[#3e716d]" size={28} /><p className="mt-3 text-xs font-bold text-[#79aaa6]">No conversations yet</p><p className="mt-1 text-[10px] leading-5 text-[#416d69]">Compose an email or configure the Resend inbound webhook.</p></div></div> : threads.map((thread) => (
            <button key={thread.id} type="button" onClick={() => void openThread(thread)} className="flex w-full gap-3 border-b border-white/5 px-4 py-4 text-left transition hover:bg-white/5" style={{ background: selected?.id === thread.id ? "rgba(249,115,22,.09)" : undefined }}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#123c39] text-xs font-extrabold text-[#7bbbb8]">{initials(thread)}</span>
              <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-xs">{thread.contactName || thread.contactEmail}</strong><time className="shrink-0 text-[9px] text-[#416d69]">{timeText(thread.latestMessageAt)}</time></span><span className="mt-1 block truncate text-[11px] text-[#79aaa6]">{thread.subject}</span><span className="mt-1.5 inline-flex rounded bg-[#123c39] px-1.5 py-0.5 text-[8px] font-bold uppercase text-[#58a29c]">{thread.status}</span></span>
            </button>
          ))}
        </div>
      </section>

      <section className={`${selected ? "flex" : "hidden md:flex"} min-w-0 flex-1 flex-col bg-[#0a2a28]`}>
        {!selected ? <div className="grid h-full place-items-center text-center"><div><FiMail className="mx-auto text-[#315f5b]" size={36} /><p className="mt-3 text-sm font-bold text-[#79aaa6]">Select a conversation</p><p className="mt-1 text-xs text-[#416d69]">Messages and replies will appear here.</p></div></div> : <>
          <header className="flex min-h-16 items-center gap-3 border-b border-white/10 px-4 py-3"><button type="button" onClick={() => setSelected(null)} className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-white/5 text-[#7bbbb8] md:hidden" aria-label="Back to conversations"><FiArrowLeft /></button><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#17413e] text-xs font-extrabold text-[#7bbbb8]">{initials(selected)}</span><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-extrabold">{selected.subject}</h2><p className="mt-0.5 truncate text-[10px] text-[#669995]">{selected.contactName ? `${selected.contactName} · ` : ""}{selected.contactEmail}</p></div><div className="hidden gap-2 sm:flex"><span className="rounded-md bg-white/5 px-2 py-1 text-[9px] text-[#79aaa6]">{received} received</span><span className="rounded-md bg-white/5 px-2 py-1 text-[9px] text-[#79aaa6]">{sent} sent</span></div></header>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-8">
            {selected.messages?.map((message) => <article key={message.id} className={`max-w-[760px] ${message.direction === "OUTBOUND" ? "ml-auto" : "mr-auto"}`}><div className="mb-1.5 flex items-center justify-between gap-4 px-1 text-[9px] text-[#56837f]"><span>{message.direction === "OUTBOUND" ? "Smart Tracker" : message.from}</span><time>{timeText(message.sentAt)}</time></div>{((message.cc?.length ?? 0) > 0 || (message.bcc?.length ?? 0) > 0) && <div className="mb-1 px-1 text-[9px] text-[#56837f]">{message.cc?.length ? `CC: ${message.cc.join(", ")}` : ""}{message.cc?.length && message.bcc?.length ? " · " : ""}{message.bcc?.length ? `BCC: ${message.bcc.join(", ")}` : ""}</div>}<div className={`rounded-md border px-4 py-3 text-xs leading-6 ${message.direction === "OUTBOUND" ? "border-[#f97316]/25 bg-[#f97316]/10" : "border-white/10 bg-white/5"}`}><p className="whitespace-pre-wrap">{message.textBody || "This message has HTML content."}</p>{message.attachments?.length ? <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">{message.attachments.map((name) => <span key={name} className="inline-flex items-center gap-1.5 rounded bg-white/5 px-2 py-1 text-[9px] text-[#79aaa6]"><FiPaperclip size={11} />{name}</span>)}</div> : null}</div><div className="mt-1 px-1 text-right text-[8px] uppercase text-[#416d69]">{message.direction === "OUTBOUND" ? message.deliveryStatus : "Received"}</div></article>)}
          </div>
          <footer className="border-t border-white/10 p-3 sm:p-4"><div className="mb-2 grid gap-2 sm:grid-cols-2"><input type="text" value={replyCc} onChange={(event) => setReplyCc(event.target.value)} placeholder="CC (separate with commas)" className="h-8 rounded-md border border-white/10 bg-[#071e1c] px-3 text-[10px] text-white outline-none placeholder:text-[#416d69] focus:border-[#f97316]/50" /><input type="text" value={replyBcc} onChange={(event) => setReplyBcc(event.target.value)} placeholder="BCC (separate with commas)" className="h-8 rounded-md border border-white/10 bg-[#071e1c] px-3 text-[10px] text-white outline-none placeholder:text-[#416d69] focus:border-[#f97316]/50" /></div><div className="flex items-end gap-2 rounded-md border border-white/10 bg-[#071e1c] p-2 focus-within:border-[#f97316]/50"><textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder={`Reply to ${selected.contactName || selected.contactEmail}...`} rows={3} className="min-h-16 flex-1 resize-none bg-transparent px-2 py-1 text-xs leading-5 text-white outline-none placeholder:text-[#416d69]" /><label className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-md bg-white/5 text-[#79aaa6]" title="Attach documents"><FiPaperclip size={16} /><input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg" className="hidden" onChange={(event) => selectFiles(event.target.files, "reply")} /></label><button type="button" disabled={sending || !reply.trim()} onClick={() => void sendReply()} className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#f97316] text-white disabled:opacity-40" aria-label="Send reply"><FiSend size={16} /></button></div>{replyFiles.length > 0 && <p className="mt-2 truncate text-[9px] text-[#79aaa6]">Attached: {replyFiles.map((file) => file.name).join(", ")}</p>}<div className="mt-2 flex items-center gap-1 text-[9px] text-[#416d69]"><FiCheck size={11} />Replies use the Smart Tracker branded template.</div></footer>
        </>}
      </section>

      {composeOpen && <label className="fixed bottom-[calc(10vh+16px)] left-6 z-[60] flex max-w-[55vw] cursor-pointer items-center gap-2 rounded-md border border-white/10 bg-[#123c39] px-3 py-2 text-[10px] font-bold text-[#9bc4c0] shadow-xl sm:left-[calc(50%-310px)]"><FiPaperclip size={14} /><span className="truncate">{composeFiles.length ? composeFiles.map((file) => file.name).join(", ") : "Attach documents"}</span><input type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg" className="hidden" onChange={(event) => selectFiles(event.target.files, "compose")} /></label>}
      {composeOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"><div className="w-full max-w-2xl overflow-hidden rounded-lg border border-white/10 bg-[#0a2a28] shadow-2xl"><header className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><h2 className="text-sm font-extrabold">New customer email</h2><p className="mt-1 text-[10px] text-[#669995]">Sent securely through Resend</p></div><button type="button" onClick={() => setComposeOpen(false)} className="grid h-8 w-8 place-items-center rounded-md bg-white/5 text-[#7bbbb8]" aria-label="Close compose"><FiX /></button></header><div className="grid max-h-[80vh] overflow-y-auto lg:grid-cols-[1fr_260px]"><div className="space-y-4 p-5"><label className="grid gap-1.5 text-[10px] font-bold uppercase text-[#669995]">Recipient email<input type="email" value={compose.to} onChange={(event) => setCompose((value) => ({ ...value, to: event.target.value }))} className="h-10 rounded-md border border-white/10 bg-[#071e1c] px-3 text-xs normal-case text-white outline-none focus:border-[#f97316]/60" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1.5 text-[10px] font-bold uppercase text-[#669995]">CC<input type="text" value={compose.cc} onChange={(event) => setCompose((value) => ({ ...value, cc: event.target.value }))} placeholder="email@example.com" className="h-10 rounded-md border border-white/10 bg-[#071e1c] px-3 text-xs font-normal normal-case text-white outline-none placeholder:text-[#416d69] focus:border-[#f97316]/60" /></label><label className="grid gap-1.5 text-[10px] font-bold uppercase text-[#669995]">BCC<input type="text" value={compose.bcc} onChange={(event) => setCompose((value) => ({ ...value, bcc: event.target.value }))} placeholder="email@example.com" className="h-10 rounded-md border border-white/10 bg-[#071e1c] px-3 text-xs font-normal normal-case text-white outline-none placeholder:text-[#416d69] focus:border-[#f97316]/60" /></label></div><label className="grid gap-1.5 text-[10px] font-bold uppercase text-[#669995]">Customer name<input value={compose.contactName} onChange={(event) => setCompose((value) => ({ ...value, contactName: event.target.value }))} className="h-10 rounded-md border border-white/10 bg-[#071e1c] px-3 text-xs normal-case text-white outline-none focus:border-[#f97316]/60" /></label><label className="grid gap-1.5 text-[10px] font-bold uppercase text-[#669995]">Subject<input value={compose.subject} onChange={(event) => setCompose((value) => ({ ...value, subject: event.target.value }))} className="h-10 rounded-md border border-white/10 bg-[#071e1c] px-3 text-xs normal-case text-white outline-none focus:border-[#f97316]/60" /></label><label className="grid gap-1.5 text-[10px] font-bold uppercase text-[#669995]">Message<textarea value={compose.message} onChange={(event) => setCompose((value) => ({ ...value, message: event.target.value }))} rows={8} className="resize-none rounded-md border border-white/10 bg-[#071e1c] px-3 py-3 text-xs font-normal normal-case leading-6 text-white outline-none focus:border-[#f97316]/60" /></label></div><aside className="border-l border-white/10 bg-[#071e1c] p-4 max-lg:hidden"><p className="mb-3 text-[9px] font-bold uppercase text-[#4f817d]">Template preview</p><div className="overflow-hidden rounded-md bg-[#f3f7f6]"><div className="bg-[#0a2a28] px-4 py-3"><img src="/logo.png" alt="Smart Tracker" className="h-7 w-auto object-contain" /></div><div className="min-h-32 whitespace-pre-wrap px-4 py-5 text-[9px] leading-4 text-[#173d3a]">{compose.message || "Your message will appear here with Smart Tracker branding."}</div><div className="border-t border-[#dce8e6] px-4 py-3 text-[8px] text-[#718986]">Smart Tracker Telematics<br /><span className="text-[#f97316]">smarttracker.cloud</span></div></div></aside></div>{error && <div className="mx-5 mb-3 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}<footer className="flex items-center justify-end gap-2 border-t border-white/10 px-5 py-4"><button type="button" onClick={() => setComposeOpen(false)} className="h-9 rounded-md border border-white/10 px-4 text-xs font-bold text-[#79aaa6]">Cancel</button><button type="button" disabled={sending || !compose.to || !compose.subject || !compose.message} onClick={() => void sendNew()} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#f97316] px-4 text-xs font-bold text-white disabled:opacity-40"><FiSend size={14} />{sending ? "Sending..." : "Send email"}</button></footer></div></div>}

      {error && !composeOpen && <div className="fixed bottom-5 right-5 z-40 flex max-w-sm items-center gap-3 rounded-md border border-red-500/20 bg-[#3a171a] px-4 py-3 text-xs text-red-200 shadow-xl"><span className="flex-1">{error}</span><button onClick={() => setError(null)} aria-label="Dismiss error"><FiX /></button></div>}
    </div>
  );
}

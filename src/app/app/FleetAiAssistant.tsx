"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { FiDownload, FiMessageCircle, FiSend, FiTrash2, FiX, FiZap } from "react-icons/fi";
import { redirectIfUnauthorized } from "@/lib/clientSession";

type Message = { role: "user" | "assistant"; content: string; generatedAt?: string };

const STARTERS = [
  "Give me today's fleet health report",
  "Which vehicles need urgent attention?",
  "Summarise recent safety alerts",
  "How can I reduce fuel and idle costs?",
];

export default function FleetAiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("trackpro-ai-chat");
      if (stored) setMessages(JSON.parse(stored));
    } catch { /* Ignore invalid browser storage. */ }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("trackpro-ai-chat", JSON.stringify(messages.slice(-20)));
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function ask(message: string) {
    const question = message.trim();
    if (!question || loading) return;
    const next = [...messages, { role: "user" as const, content: question }];
    setMessages(next);
    setInput("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: question, history: messages.slice(-8) }),
      });
      if (await redirectIfUnauthorized(response)) return;
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Fleet AI could not answer right now.");
      }
      if (!response.body) throw new Error("Fleet AI returned no response.");

      const assistantMessage: Message = { role: "assistant", content: "", generatedAt: new Date().toISOString() };
      setMessages([...next, assistantMessage]);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...next, { ...assistantMessage, content: answer }]);
      }
      answer += decoder.decode();
      if (!answer.trim()) throw new Error("Fleet AI returned an empty response.");
      setMessages([...next, { ...assistantMessage, content: answer.trim() }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Fleet AI could not answer right now.");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    ask(input);
  }

  function clearChat() {
    setMessages([]);
    setError("");
    sessionStorage.removeItem("trackpro-ai-chat");
  }

  function downloadReport(content: string) {
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `smart-tracker-ai-report-${new Date().toISOString().slice(0, 10)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed bottom-4 right-4 z-[80] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section className="flex h-[min(680px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-[#cfe0df] bg-white shadow-[0_24px_70px_rgba(7,46,44,0.28)]">
          <header className="flex items-center justify-between bg-[#0d4a47] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/12"><FiZap /></span>
              <div><div className="text-sm font-extrabold">Fleet AI</div><div className="text-[10px] font-semibold text-[#b2d4d2]">Private fleet reports and advice</div></div>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" title="Clear conversation" onClick={clearChat} className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"><FiTrash2 size={15} /></button>
              <button type="button" title="Close assistant" onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-white/10 hover:text-white"><FiX size={18} /></button>
            </div>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#f4f8f8] p-3">
            {messages.length === 0 && (
              <div className="rounded-md border border-[#d8e6e5] bg-white p-4">
                <div className="text-sm font-extrabold text-[#0d4a47]">What would you like to know?</div>
                <p className="mt-1 text-xs leading-5 text-[#64748b]">Ask about your vehicles, live status, recent alerts, operational risks, or request a management report.</p>
                <div className="mt-3 grid gap-2">{STARTERS.map((starter) => <button key={starter} type="button" onClick={() => ask(starter)} className="rounded-md border border-[#d8e6e5] bg-[#f8fbfb] px-3 py-2 text-left text-[11px] font-semibold text-[#0d4a47] hover:border-[#1a7a75]">{starter}</button>)}</div>
              </div>
            )}
            {messages.map((message, index) => (
              <article key={`${message.role}-${index}`} className={`group max-w-[92%] rounded-md px-3 py-2.5 text-xs leading-5 ${message.role === "user" ? "ml-auto bg-[#0d4a47] text-white" : "border border-[#d8e6e5] bg-white text-[#25363f]"}`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.role === "assistant" && <div className="mt-2 flex items-center justify-between border-t border-[#edf2f2] pt-2"><span className="text-[9px] font-semibold text-[#94a3b8]">AI advice · verify critical decisions</span><button type="button" title="Download this report" onClick={() => downloadReport(message.content)} className="grid h-7 w-7 place-items-center rounded text-[#1a7a75] hover:bg-[#e8f4f3]"><FiDownload /></button></div>}
              </article>
            ))}
            {loading && <div className="flex w-fit items-center gap-2 rounded-md border border-[#d8e6e5] bg-white px-3 py-2.5 text-xs font-semibold text-[#536987]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#f97316]" />Analysing your fleet...</div>}
            {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</div>}
          </div>

          <form onSubmit={submit} className="flex items-end gap-2 border-t border-[#dbe5e4] bg-white p-3">
            <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); ask(input); } }} rows={2} maxLength={2000} placeholder="Ask Fleet AI..." className="min-h-10 flex-1 resize-none rounded-md border border-[#cbd5e1] px-3 py-2 text-xs text-[#203239] outline-none focus:border-[#1a7a75]" />
            <button type="submit" disabled={!input.trim() || loading} aria-label="Send question" className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#f97316] text-white disabled:opacity-40"><FiSend /></button>
          </form>
        </section>
      )}

      <button type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close Fleet AI" : "Open Fleet AI"} aria-expanded={open} className="grid h-14 w-14 place-items-center rounded-full bg-[#f97316] text-white shadow-[0_14px_35px_rgba(249,115,22,0.38)] transition hover:bg-[#ea6a0a]">
        {open ? <FiX size={23} /> : <FiMessageCircle size={24} />}
      </button>
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  FiDownload,
  FiRefreshCw,
  FiSend,
  FiSquare,
  FiTrash2,
  FiX,
  FiZap,
} from "react-icons/fi";
import { redirectIfUnauthorized } from "@/lib/clientSession";
import { useWorkspace } from "@/components/signature/WorkspaceContext";

type Message = {
  role: "user" | "assistant";
  content: string;
  generatedAt?: string;
};
type PendingAction = {
  actionId: string;
  action: string;
  summary: string;
  requiresConfirmation: boolean;
};

const DEFAULT_STARTERS = [
  "Where are my vehicles?",
  "Summarize today's fleet activity.",
  "Show vehicles with active alerts.",
  "Which vehicles are currently idle?",
  "Show fuel anomalies from today.",
];

export default function FleetAiAssistant() {
  const { account, scope, tenants } = useWorkspace();
  const scopeKey = scope === null ? "all" : [...scope].sort().join(",");
  const storageKey = `st-ai-chat:${account.id}:${scopeKey}`;
  const scopeLabel = scope === null ? account.roles.includes("SUPER_ADMIN") ? "All tenants" : "Your account" : scope.length === 0 ? "No tenants selected" : scope.map((id) => tenants.find((tenant) => tenant.id === id)?.name ?? "Selected tenant").join(", ");
  const [hydratedKey, setHydratedKey] = useState("");
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [starters, setStarters] = useState(DEFAULT_STARTERS);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const lastQuestionRef = useRef("");
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => previous?.focus();
  }, [open]);

  useEffect(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    setLoading(false);
    setPendingAction(null);
    setError("");
    setInput("");
    lastQuestionRef.current = "";
    try {
      const stored = JSON.parse(sessionStorage.getItem(storageKey) ?? "[]");
      setMessages(Array.isArray(stored) ? stored.filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string").slice(-20) : []);
    } catch {
      setMessages([]);
    }
    setHydratedKey(storageKey);
    return () => { requestRef.current?.abort(); requestRef.current = null; };
  }, [storageKey]);

  useEffect(() => {
    fetch("/api/assistant/suggestions", {
      cache: "force-cache",
      credentials: "same-origin",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const values = Array.isArray(data) ? data : data?.suggestions;
        if (Array.isArray(values) && values.length) setStarters(values);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (hydratedKey === storageKey) {
      try { sessionStorage.setItem(storageKey, JSON.stringify(messages.slice(-20))); } catch { /* Storage is optional. */ }
    }
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, storageKey, hydratedKey]);

  useEffect(() => {
    const openInsight = (event: Event) => {
      const question = (event as CustomEvent<{ question?: string }>).detail
        ?.question;
      setOpen(true);
      if (question) setInput(question);
    };
    window.addEventListener("fleet-ai:ask", openInsight);
    return () => window.removeEventListener("fleet-ai:ask", openInsight);
  }, []);

  async function ask(message: string) {
    const question = message.trim();
    if (!question || loading || scope?.length === 0 || hydratedKey !== storageKey) return;
    const next = [...messages, { role: "user" as const, content: question }];
    setMessages(next);
    setInput("");
    setError("");
    setLoading(true);
    lastQuestionRef.current = question;
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const requestChat = () =>
        fetch("/api/assistant/chat", {
          method: "POST",
          credentials: "same-origin",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            message: question,
            history: messages.slice(-6),
            organisationIds: scope,
          }),
          signal: controller.signal,
        });
      let response = await requestChat();
      if (requestRef.current !== controller) return;
      if (response.status === 401) {
        const session = await fetch("/api/auth/me", {
          cache: "no-store",
          credentials: "same-origin",
        }).catch(() => null);
        if (session?.ok) response = await requestChat();
      }
      if (await redirectIfUnauthorized(response)) return;
      if (requestRef.current !== controller) return;
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.message || "Fleet AI could not answer right now.",
        );
      }
      if (!response.body) throw new Error("Fleet AI returned no response.");

      const assistantMessage: Message = {
        role: "assistant",
        content: "",
        generatedAt: new Date().toISOString(),
      };
      setMessages([...next, assistantMessage]);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (requestRef.current !== controller) { await reader.cancel(); return; }
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const eventBlock of events) {
          const event = eventBlock
            .split("\n")
            .find((line) => line.startsWith("event: "))
            ?.slice(7);
          const raw = eventBlock
            .split("\n")
            .find((line) => line.startsWith("data: "))
            ?.slice(6);
          if (!raw) continue;
          const data = JSON.parse(raw) as {
            content?: string;
            message?: string;
            actionId?: string;
            action?: string;
            summary?: string;
            requiresConfirmation?: boolean;
          };
          if (event === "token" && data.content) {
            answer += data.content;
            setMessages([...next, { ...assistantMessage, content: answer }]);
          }
          if (event === "busy" || event === "error")
            throw new Error(
              data.message || "Fleet AI could not answer right now.",
            );
          if (
            event === "action_confirmation" &&
            data.actionId &&
            data.action &&
            data.summary
          ) {
            setPendingAction({
              actionId: data.actionId,
              action: data.action,
              summary: data.summary,
              requiresConfirmation: Boolean(data.requiresConfirmation),
            });
            answer = data.summary;
            setMessages([...next, { ...assistantMessage, content: answer }]);
          }
        }
      }
      if (!answer.trim())
        throw new Error("Fleet AI returned an empty response.");
      setMessages([...next, { ...assistantMessage, content: answer.trim() }]);
    } catch (cause) {
      if (requestRef.current !== controller) return;
      if (cause instanceof DOMException && cause.name === "AbortError")
        setError("Generation cancelled.");
      else
        setError(
          cause instanceof Error
            ? cause.message
            : "Fleet AI could not answer right now.",
        );
    } finally {
      if (requestRef.current === controller) { requestRef.current = null; setLoading(false); }
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    ask(input);
  }

  function clearChat() {
    requestRef.current?.abort();
    requestRef.current = null;
    setLoading(false);
    setMessages([]);
    setError("");
    setPendingAction(null);
    try { sessionStorage.removeItem(storageKey); } catch { /* Storage is optional. */ }
  }

  async function resolveAction(operation: "confirm" | "cancel") {
    if (!pendingAction) return;
    setLoading(true);
    setError("");
    const controller = new AbortController();
    requestRef.current = controller;
    try {
      const response = await fetch(
        `/api/assistant/actions/${pendingAction.actionId}/${operation}`,
        { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify({ organisationIds: scope }), signal: controller.signal },
      );
      if (requestRef.current !== controller) return;
      if (await redirectIfUnauthorized(response)) return;
      const data = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(data?.message || "Fleet AI action failed.");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            data.summary ||
            (operation === "confirm"
              ? "Action completed."
              : "Action cancelled."),
          generatedAt: new Date().toISOString(),
        },
      ]);
      setPendingAction(null);
    } catch (cause) {
      if (requestRef.current !== controller) return;
      setError(
        cause instanceof Error ? cause.message : "Fleet AI action failed.",
      );
    } finally {
      if (requestRef.current === controller) { requestRef.current = null; setLoading(false); }
    }
  }

  function downloadReport(content: string) {
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/plain;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `smart-tracker-ai-report-${new Date().toISOString().slice(0, 10)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="st-ai-layer">
      {open && (
        <section
          className="st-ai-panel"
          role="dialog"
          aria-label="Smart Tracker AI"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              setOpen(false);
            }
          }}
        >
          <header className="flex items-center justify-between bg-[var(--st-button)] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--st-surface)]/12">
                <FiZap />
              </span>
              <div>
                <div className="text-sm font-extrabold">Smart Tracker AI</div>
                <div className="max-w-56 truncate text-xs font-medium text-blue-100" title={scopeLabel}>
                  {scopeLabel}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                title="Clear conversation"
                onClick={clearChat}
                className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-[var(--st-surface)]/10 hover:text-white"
              >
                <FiTrash2 size={15} />
              </button>
              <button
                type="button"
                title="Close assistant"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-white/70 hover:bg-[var(--st-surface)]/10 hover:text-white"
              >
                <FiX size={18} />
              </button>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[var(--st-soft)] p-3"
          >
            {messages.length === 0 && (
              <div className="rounded-md border border-[var(--st-line)] bg-[var(--st-surface)] p-4">
                <div className="text-sm font-extrabold text-[var(--st-ink)]">
                  What would you like to know?
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--st-muted)]">
                  Ask about your vehicles, live status, recent alerts,
                  operational risks, or request a management report.
                </p>
                <div className="mt-3 grid gap-2">
                  {starters.slice(0, 5).map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => ask(starter)}
                      className="rounded-md border border-[var(--st-line)] bg-[#f8fbfb] px-3 py-2 text-left text-[11px] font-semibold text-[var(--st-ink)] hover:border-[#1a7a75]"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`group max-w-[92%] rounded-md px-3 py-2.5 text-xs leading-5 ${message.role === "user" ? "ml-auto bg-[var(--st-button)] text-white" : "border border-[var(--st-line)] bg-[var(--st-surface)] text-[var(--st-ink)]"}`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.role === "assistant" && (
                  <div className="mt-2 flex items-center justify-between border-t border-[#edf2f2] pt-2">
                    <span className="text-[9px] font-semibold text-[#94a3b8]">
                      AI advice · verify critical decisions
                    </span>
                    <button
                      type="button"
                      title="Download this report"
                      onClick={() => downloadReport(message.content)}
                      className="grid h-7 w-7 place-items-center rounded text-[#1a7a75] hover:bg-[#e8f4f3]"
                    >
                      <FiDownload />
                    </button>
                  </div>
                )}
              </article>
            ))}
            {loading && (
              <div className="flex w-fit items-center gap-2 rounded-md border border-[var(--st-line)] bg-[var(--st-surface)] px-3 py-2.5 text-xs font-semibold text-[#536987]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--st-button)]" />
                Analysing your fleet...
              </div>
            )}
            {pendingAction && (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-[#334155]">
                <div className="font-bold">Confirmation required</div>
                <p className="mt-1 leading-5">{pendingAction.summary}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => resolveAction("confirm")}
                    className="rounded bg-[var(--st-button)] px-3 py-2 font-bold text-white"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => resolveAction("cancel")}
                    className="rounded border border-[var(--st-border)] bg-[var(--st-surface)] px-3 py-2 font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                <span>{error}</span>
                {lastQuestionRef.current && (
                  <button
                    type="button"
                    title="Retry"
                    onClick={() => ask(lastQuestionRef.current)}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded hover:bg-red-100"
                  >
                    <FiRefreshCw />
                  </button>
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={submit}
            className="flex items-end gap-2 border-t border-[var(--st-line)] bg-[var(--st-surface)] p-3"
          >
            <textarea
              ref={inputRef}
              aria-label="Ask Smart Tracker AI"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  ask(input);
                }
              }}
              rows={2}
              maxLength={500}
              disabled={scope?.length === 0 || hydratedKey !== storageKey}
              placeholder={scope?.length === 0 ? "Select a tenant first" : "Ask about your fleet…"}
              className="min-h-10 flex-1 resize-none rounded-md border border-[var(--st-border)] px-3 py-2 text-xs text-[var(--st-ink)] outline-none focus:border-[#1a7a75]"
            />
            {loading ? (
              <button
                type="button"
                onClick={() => requestRef.current?.abort()}
                aria-label="Cancel generation"
                title="Cancel generation"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#dc3545] text-white"
              >
                <FiSquare size={14} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim() || scope?.length === 0 || hydratedKey !== storageKey}
                aria-label="Send question"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[var(--st-button)] text-white disabled:opacity-40"
              >
                <FiSend />
              </button>
            )}
          </form>
        </section>
      )}
    </div>
  );
}

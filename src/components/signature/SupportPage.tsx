"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  FiBookOpen,
  FiClock,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiSearch,
  FiSend,
} from "react-icons/fi";
import { redirectIfUnauthorized } from "@/lib/clientSession";
import PageHeader from "./PageHeader";
import { pageById } from "./navigation";
import {
  contactLinks,
  emptyContacts,
  supportFaqs,
  type SupportContacts,
} from "./supportContent";
import { useWorkspace } from "./WorkspaceContext";

export default function SupportPage() {
  const { account, admin } = useWorkspace(),
    [contacts, setContacts] = useState<SupportContacts>(emptyContacts),
    [contactError, setContactError] = useState(""),
    [query, setQuery] = useState(""),
    [sending, setSending] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [revision, setRevision] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(
      admin
        ? "/api/admin/platform/support-contacts"
        : "/api/platform/support-contacts",
      { cache: "no-store", signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok)
          throw Error("Support contact details are temporarily unavailable.");
        return response.json();
      })
      .then((value) => {
        setContacts({ ...emptyContacts, ...value });
        setContactError("");
      })
      .catch((cause) => {
        if (cause.name !== "AbortError") setContactError(cause.message);
      });
    return () => controller.abort();
  }, [admin, revision]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      data = Object.fromEntries(new FormData(form));
    if (sending) return;
    if (
      !String(data.name).trim() ||
      !String(data.subject).trim() ||
      String(data.message).trim().length < 10
    ) {
      setError(
        "Enter your name, a subject and at least 10 characters describing the issue.",
      );
      return;
    }
    setSending(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/fleet-records/support-ticket", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: String(data.subject).trim(),
          payload: {
            name: String(data.name).trim(),
            email: data.email,
            category: data.category,
            message: String(data.message).trim(),
            priority: data.priority,
            status: "OPEN",
          },
          active: true,
        }),
      });
      if (await redirectIfUnauthorized(response)) return;
      const body = await response.json().catch(() => null);
      if (!response.ok)
        throw Error(
          body?.message ?? "Your request could not be submitted. Please retry.",
        );
      setSuccess(
        `Your support request has been submitted${body?.id ? " · " + String(body.id).slice(0, 8).toUpperCase() : ""}.`,
      );
      form.reset();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Your request could not be submitted.",
      );
    } finally {
      setSending(false);
    }
  }
  const links = contactLinks(contacts),
    filtered = supportFaqs.filter((item) =>
      (item.category + " " + item.question + " " + item.answer)
        .toLowerCase()
        .includes(query.toLowerCase()),
    ),
    groups = [...new Set(filtered.map((item) => item.category))];
  const channels = [
    {
      label: "WhatsApp",
      value: contacts.whatsapp,
      href: links.whatsapp,
      action: "Start chat",
      icon: FiMessageCircle,
    },
    {
      label: "Email support",
      value: contacts.email,
      href: links.email,
      action: "Write an email",
      icon: FiMail,
    },
    {
      label: "Technical hotline",
      value: contacts.phone,
      href: links.phone,
      action: "Call support",
      icon: FiPhone,
    },
    {
      label: "Operating hours",
      value: contacts.hours,
      href: "",
      action: "",
      icon: FiClock,
    },
  ].filter((item) => item.value);
  return (
    <>
      <PageHeader
        page={pageById("support")!}
        tenant={false}
        actions={
          <button
            className="st-button"
            onClick={() => {
              formRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              formRef.current?.querySelector("input")?.focus();
            }}
          >
            New request
          </button>
        }
      />
      <section className="st-card st-support-intro">
        <div>
          <h2>How can we help?</h2>
          <p>Find an answer or contact the support team.</p>
        </div>
        {links.help && (
          <a
            className="st-button"
            href={links.help}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiBookOpen />
            Help centre
          </a>
        )}
      </section>
      {contactError ? (
        <div className="st-notice" role="status">
          {contactError}{" "}
          <button
            className="st-link"
            onClick={() => setRevision((value) => value + 1)}
          >
            Retry
          </button>
        </div>
      ) : channels.length ? (
        <div className="st-support-contacts">
          {channels.map(({ label, value, href, action, icon: Icon }) => (
            <article className="st-card st-contact-card" key={label}>
              <span className="st-contact-icon">
                <Icon />
              </span>
              <div>
                <h2>{label}</h2>
                <p>{value}</p>
                {href && (
                  <a
                    className="st-button st-small"
                    href={href}
                    {...(href.startsWith("https:")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {action}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="st-notice">
          You can reach the team using the support request form below.
        </div>
      )}
      <div className="st-support-columns">
        <section className="st-card">
          <div className="st-card-head">
            <h2>Support request</h2>
          </div>
          <form
            className="st-card-body st-form-stack"
            ref={formRef}
            onSubmit={(event) => void submit(event)}
          >
            <div className="st-form-grid">
              <label className="st-field">
                <span>Your name</span>
                <input
                  className="st-input"
                  name="name"
                  defaultValue={account.displayName}
                  autoComplete="name"
                  required
                  maxLength={120}
                />
              </label>
              <label className="st-field">
                <span>Email</span>
                <input
                  className="st-input"
                  name="email"
                  type="email"
                  defaultValue={account.email}
                  autoComplete="email"
                  required
                  maxLength={254}
                />
              </label>
            </div>
            <div className="st-form-grid">
              <label className="st-field">
                <span>Category</span>
                <select className="st-input" name="category">
                  <option>Technical issue</option>
                  <option>Account and access</option>
                  <option>Billing and licences</option>
                  <option>Feature request</option>
                </select>
              </label>
              <label className="st-field">
                <span>Priority</span>
                <select className="st-input" name="priority">
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </label>
            </div>
            <label className="st-field">
              <span>Subject</span>
              <input
                className="st-input"
                name="subject"
                placeholder="Short summary"
                required
                maxLength={120}
              />
            </label>
            <label className="st-field">
              <span>Message</span>
              <textarea
                className="st-input"
                name="message"
                placeholder="Describe the issue, affected vehicles and when it happened."
                required
                minLength={10}
                maxLength={10000}
              />
            </label>
            {error && (
              <p className="st-error" role="alert">
                {error}
              </p>
            )}
            {success && (
              <p className="st-notice" role="status">
                {success}
              </p>
            )}
            <button
              className="st-button st-primary"
              type="submit"
              disabled={sending}
              style={{ justifySelf: "start" }}
            >
              <FiSend />
              {sending ? "Submitting…" : "Submit request"}
            </button>
          </form>
        </section>
        <section className="st-card">
          <div className="st-card-head">
            <h2>Quick answers</h2>
          </div>
          <div className="st-card-body st-faq-tools">
            <label className="st-search">
              <FiSearch />
              <input
                aria-label="Search support answers"
                placeholder="Search answers, e.g. offline or fuel"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>
          <div className="st-faq-list">
            {!groups.length ? (
              <p className="st-empty">
                No matching answers. Try another term or submit a request.
              </p>
            ) : (
              groups.map((group) => (
                <section key={group}>
                  <h3>{group}</h3>
                  {filtered
                    .filter((item) => item.category === group)
                    .map((item) => (
                      <details className="st-faq" key={item.question}>
                        <summary>{item.question}</summary>
                        <p>{item.answer}</p>
                        {item.href && (
                          <Link href={item.href} className="st-link">
                            Open page →
                          </Link>
                        )}
                      </details>
                    ))}
                </section>
              ))
            )}
          </div>
        </section>
      </div>
    </>
  );
}

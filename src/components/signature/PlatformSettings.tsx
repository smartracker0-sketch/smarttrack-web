"use client";
import { useEffect, useState, type FormEvent } from "react";
import PageHeader from "./PageHeader";
import { pageById } from "./navigation";
import { emptyContacts, type SupportContacts } from "./supportContent";
type Fields = keyof SupportContacts;
const fields: { key: Fields; label: string; type: string; hint?: string }[] = [
  { key: "email", label: "Support email", type: "email" },
  {
    key: "phone",
    label: "Support phone",
    type: "tel",
    hint: "International format, for example +country code followed by the number.",
  },
  {
    key: "whatsapp",
    label: "WhatsApp number",
    type: "tel",
    hint: "International format. Spaces are allowed.",
  },
  { key: "hours", label: "Operating hours", type: "text" },
  { key: "helpUrl", label: "Help centre URL", type: "url" },
];
export default function PlatformSettings() {
  const [saved, setSaved] = useState<SupportContacts>(emptyContacts),
    [draft, setDraft] = useState<SupportContacts>(emptyContacts),
    [provider, setProvider] = useState(""),
    [nextProvider, setNextProvider] = useState(""),
    [loading, setLoading] = useState(true),
    [contactsReady, setContactsReady] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const loadContacts = fetch("/api/admin/platform/support-contacts", {
      cache: "no-store",
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok)
        throw Error(
          response.status === 403
            ? "Root superadmin access is required."
            : "Support contacts could not be loaded.",
        );
      const body = { ...emptyContacts, ...(await response.json()) };
      if (controller.signal.aborted) return;
      setSaved(body);
      setDraft(body);
      setContactsReady(true);
    });
    const loadSms = fetch("/api/admin/platform/sms-provider", {
      cache: "no-store",
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw Error("The SMS provider could not be loaded.");
      const source = await response.json();
      if (controller.signal.aborted) return;
      setProvider(source.provider);
      setNextProvider(source.provider);
    });
    void Promise.allSettled([loadContacts, loadSms]).then((results) => {
      if (controller.signal.aborted) return;
      setError(
        results
          .flatMap((result) =>
            result.status === "rejected" && result.reason?.name !== "AbortError"
              ? [result.reason?.message ?? "Settings could not be loaded."]
              : [],
          )
          .join(" "),
      );
      setLoading(false);
    });
    return () => controller.abort();
  }, [revision]);
  const dirty =
    (contactsReady && JSON.stringify(saved) !== JSON.stringify(draft)) ||
    provider !== nextProvider;
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving || loading || !dirty) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (provider !== nextProvider) {
        const response = await fetch("/api/admin/platform/sms-provider", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ provider: nextProvider }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok)
          throw Error(
            data?.message ??
              data?.error ??
              "The SMS provider could not be updated.",
          );
        setProvider(nextProvider);
      }
      if (contactsReady && JSON.stringify(saved) !== JSON.stringify(draft)) {
        const response = await fetch("/api/admin/platform/support-contacts", {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(draft),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok)
          throw Error(data?.message ?? "Support contacts could not be saved.");
        setSaved(data);
        setDraft(data);
      }
      setMessage(
        contactsReady
          ? "Platform settings saved."
          : "SMS provider saved. Support contacts remain unavailable.",
      );
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Settings could not be saved.",
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <PageHeader page={pageById("platform-settings")!} tenant={false} />
      {error && (
        <div className="st-error" role="alert">
          {error}{" "}
          <button
            className="st-link"
            type="button"
            onClick={() => {
              setLoading(true);
              setContactsReady(false);
              setRevision((value) => value + 1);
            }}
          >
            Retry
          </button>
        </div>
      )}
      <form
        className="st-platform-form"
        onSubmit={(event) => void submit(event)}
      >
        <section className="st-card">
          <div className="st-card-head">
            <h2>Support contacts</h2>
            <span className="st-muted">Root superadmin</span>
          </div>
          <div className="st-card-body">
            <p className="st-muted" style={{ marginBottom: 16 }}>
              These contacts appear on Support for every tenant. Leave a channel
              blank to hide it.
            </p>
            {loading ? (
              <p role="status">Loading settings…</p>
            ) : (
              <div className="st-form-grid">
                {fields.map((field) => (
                  <label className="st-field" key={field.key}>
                    <span>{field.label}</span>
                    <input
                      className="st-input"
                      name={field.key}
                      type={field.type}
                      value={draft[field.key]}
                      pattern={
                        field.type === "tel"
                          ? "[+]?[0-9 ]{7,24}"
                          : field.type === "url"
                            ? "https?://.+"
                            : undefined
                      }
                      maxLength={
                        field.key === "hours"
                          ? 300
                          : field.key === "helpUrl"
                            ? 2048
                            : 254
                      }
                      onChange={(event) =>
                        setDraft({ ...draft, [field.key]: event.target.value })
                      }
                      disabled={saving || !contactsReady}
                    />
                    {field.hint && <small>{field.hint}</small>}
                  </label>
                ))}
              </div>
            )}
          </div>
        </section>
        <section className="st-card" style={{ marginTop: 16 }}>
          <div className="st-card-head">
            <h2>SMS gateway</h2>
          </div>
          <div className="st-card-body">
            <label className="st-field">
              <span>Active provider</span>
              <select
                className="st-input"
                value={nextProvider}
                onChange={(event) => setNextProvider(event.target.value)}
                disabled={!provider || saving}
              >
                <option value="" disabled>
                  Provider unavailable
                </option>
                <option value="termii">Termii</option>
                <option value="africastalking">Africa&apos;s Talking</option>
              </select>
              <small>Used for tracker activation and device commands.</small>
            </label>
          </div>
        </section>
        <div className="st-savebar">
          <span role="status">
            {message ||
              (dirty
                ? "Unsaved changes"
                : error
                  ? "Some settings are unavailable"
                  : loading
                    ? "Loading settings…"
                    : "All changes saved")}
          </span>
          <button
            className="st-button"
            type="button"
            disabled={!dirty || saving}
            onClick={() => {
              setDraft(saved);
              setNextProvider(provider);
              setMessage("");
            }}
          >
            Cancel
          </button>
          <button
            className="st-button st-primary"
            type="submit"
            disabled={!dirty || saving || loading}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </>
  );
}

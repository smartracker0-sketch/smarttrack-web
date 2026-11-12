"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import PageHeader from "@/components/signature/PageHeader";
import { pageById } from "@/components/signature/navigation";
import { useWorkspace } from "@/components/signature/WorkspaceContext";
import Icon from "@/components/signature/Icon";

export default function SettingsPage() {
  const { theme, setTheme } = useWorkspace();
  const [draft, setDraft] = useState(theme),
    [message, setMessage] = useState("");
  const dirty = draft !== theme;
  function save(event: FormEvent) {
    event.preventDefault();
    setTheme(draft);
    setMessage("Appearance saved on this browser.");
  }
  return (
    <>
      <PageHeader page={pageById("settings")!} tenant={false} />
      <div className="st-settings-layout">
        <nav className="st-settings-nav" aria-label="Settings sections">
          <a href="#appearance" aria-current="location">
            <Icon name="settings" />
            Appearance
          </a>
          <Link href="/app/profile">
            <Icon name="users" />
            Profile
          </Link>
          <Link href="/app/whitelabel">
            <Icon name="building" />
            Brand settings
          </Link>
          <Link href="/app/support">
            <Icon name="help" />
            Support
          </Link>
        </nav>
        <form onSubmit={save}>
          <section className="st-card" id="appearance">
            <div className="st-card-head">
              <h2>Appearance</h2>
              <span className="st-muted">This browser</span>
            </div>
            <div className="st-card-body st-form-stack">
              <label className="st-field">
                <span>Colour theme</span>
                <select
                  className="st-input"
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value as "light" | "dark");
                    setMessage("");
                  }}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
                <small>
                  Applies to the dashboard, map and workspace controls.
                </small>
              </label>
              <p className="st-muted">
                Manage your name and account details in{" "}
                <Link className="st-link" href="/app/profile">
                  Profile
                </Link>
                .
              </p>
            </div>
          </section>
          <div className="st-savebar">
            <span role="status">
              {message || (dirty ? "Unsaved changes" : "No pending changes")}
            </span>
            <button
              className="st-button"
              type="button"
              disabled={!dirty}
              onClick={() => {
                setDraft(theme);
                setMessage("");
              }}
            >
              Cancel
            </button>
            <button
              className="st-button st-primary"
              type="submit"
              disabled={!dirty}
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

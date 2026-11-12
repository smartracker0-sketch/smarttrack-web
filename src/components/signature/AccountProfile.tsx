"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import PageHeader from "./PageHeader";
import { pageById } from "./navigation";
import { useWorkspace } from "./WorkspaceContext";
export default function AccountProfile() {
  const { account } = useWorkspace();
  const [name, setName] = useState(account.displayName), [saved, setSaved] = useState(account.displayName), [saving, setSaving] = useState(false), [error, setError] = useState(""), [message, setMessage] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault(); if (saving) return; setSaving(true); setError(""); setMessage("");
    try { const response = await fetch("/api/user-profile", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ displayName: name.trim() }) }); const body = await response.json().catch(() => null); if (!response.ok) throw Error(body?.message ?? "Your profile could not be saved."); setSaved(body.displayName); setName(body.displayName); setMessage("Profile saved."); window.dispatchEvent(new CustomEvent("st:profile-updated")); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Your profile could not be saved."); } finally { setSaving(false); }
  }
  return <><PageHeader page={pageById("profile")!} tenant={false} /><form onSubmit={save} style={{ maxWidth: 760 }}><section className="st-card"><div className="st-card-head"><h2>Account details</h2></div><div className="st-card-body st-form-stack">{error && <p role="alert" className="st-error">{error}</p>}<label className="st-field"><span>Display name</span><input className="st-input" required maxLength={120} value={name} onChange={(event) => { setName(event.target.value); setMessage(""); }} /></label><label className="st-field"><span>Email address</span><input className="st-input" type="email" readOnly value={account.email} /><small>Contact your administrator to change your sign-in email.</small></label><div className="st-field"><span>Role</span><p className="st-muted">{account.roles.map((role) => role.toLowerCase().replaceAll("_", " ")).join(", ")}</p></div></div></section><div className="st-savebar"><span role="status">{message || (name !== saved ? "Unsaved changes" : "No pending changes")}</span><button type="button" className="st-button" disabled={saving || name === saved} onClick={() => { setName(saved); setMessage(""); }}>Cancel</button><button className="st-button st-primary" disabled={saving || name === saved}>{saving ? "Saving…" : "Save changes"}</button></div></form><Link className="st-link" href="/app/settings" style={{ display: "inline-block", marginTop: 16 }}>Back to settings</Link></>;
}

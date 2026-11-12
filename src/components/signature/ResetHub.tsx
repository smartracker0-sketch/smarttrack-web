"use client";
import { useEffect, useState, type FormEvent } from "react";
import { FiLock, FiRefreshCw } from "react-icons/fi";
import PageHeader from "./PageHeader";
import { pageById } from "./navigation";
import { allAdminRows } from "./adminData";
import { textOf, type DataRow } from "./data";
import { useWorkspace } from "./WorkspaceContext";

export default function ResetHub() {
  const { account } = useWorkspace();
  const [users, setUsers] = useState<DataRow[]>([]),
    [userId, setUserId] = useState(""),
    [action, setAction] = useState("REVOKE_SESSIONS"),
    [confirmation, setConfirmation] = useState(""),
    [password, setPassword] = useState(""),
    [loading, setLoading] = useState(true),
    [saving, setSaving] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void allAdminRows("/api/admin/users", controller.signal)
      .then((people) => {
        if (!controller.signal.aborted) {
          setUsers(people);
          setError("");
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "Users could not be loaded.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);
  const selected = users.find((user) => String(user.id) === userId);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving || !selected) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/access/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId, action, confirmation, password }),
      });
      const body = await response.json();
      if (!response.ok)
        throw Error(body?.message ?? "The action could not be completed.");
      setPassword("");
      setConfirmation("");
      if (action === "REVOKE_SESSIONS") {
        setNotice("Sessions revoked. The user must sign in again.");
        if (userId === account.id) {
          await fetch("/api/admin/logout", { method: "POST" });
          window.location.assign("/admin/login");
        }
      } else
        setNotice(
          `${Number(body.changed) || 0} saved preference records cleared.`,
        );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The action failed.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <PageHeader
        page={pageById("reset")!}
        tenant={false}
        onRefresh={() => {
          setLoading(true);
          setRevision((value) => value + 1);
        }}
      />
      <div className="st-settings-layout">
        <aside className="st-card st-card-body">
          <h2>Account recovery</h2>
          <p className="st-muted">
            Review the selected user and action before confirming with your
            administrator password.
          </p>
          <p className="st-muted">Actions are recorded in the audit log.</p>
        </aside>
        <section className="st-card">
          <div className="st-card-head">
            <h2>Reset access or preferences</h2>
          </div>
          <form onSubmit={submit}>
            <div className="st-card-body st-form-grid">
              {error && (
                <p className="st-error st-field-wide" role="alert">
                  {error}
                </p>
              )}
              {notice && (
                <p className="st-notice st-field-wide" role="status">
                  {notice}
                </p>
              )}
              <label className="st-field st-field-wide">
                <span>User</span>
                <select
                  aria-label="User"
                  className="st-input"
                  required
                  disabled={loading || saving}
                  value={userId}
                  onChange={(event) => {
                    setUserId(event.target.value);
                    setConfirmation("");
                    setNotice("");
                  }}
                >
                  <option value="">
                    {loading ? "Loading users…" : "Choose a user"}
                  </option>
                  {users.map((user) => (
                    <option value={String(user.id)} key={String(user.id)}>
                      {textOf(user.displayName ?? user.name ?? user.email)} ·{" "}
                      {textOf(user.email)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="st-field st-field-wide">
                <span>Action</span>
                <select
                  aria-label="Action"
                  className="st-input"
                  disabled={saving}
                  value={action}
                  onChange={(event) => {
                    setAction(event.target.value);
                    setNotice("");
                  }}
                >
                  <option value="REVOKE_SESSIONS">Revoke all sessions</option>
                  <option value="RESET_PREFERENCES">
                    Reset saved account preferences
                  </option>
                </select>
              </label>
              <p className="st-muted st-field-wide">
                {action === "REVOKE_SESSIONS"
                  ? "Current access and refresh tokens stop working immediately. The user’s password stays the same."
                  : "Clears saved account preference records. Browser display preferences are managed on each device."}
              </p>
              <label className="st-field st-field-wide">
                <span>Confirm user email</span>
                <input
                  className="st-input"
                  type="email"
                  required
                  autoComplete="off"
                  disabled={saving || !selected}
                  value={confirmation}
                  onChange={(event) => setConfirmation(event.target.value)}
                  placeholder={
                    selected ? textOf(selected.email) : "Select a user first"
                  }
                />
              </label>
              <label className="st-field st-field-wide">
                <span>Your administrator password</span>
                <input
                  className="st-input"
                  type="password"
                  required
                  autoComplete="current-password"
                  disabled={saving}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
            </div>
            <div className="st-savebar">
              <span className="st-muted">
                Administrator confirmation required
              </span>
              <button
                className="st-button st-primary"
                disabled={
                  saving ||
                  loading ||
                  !selected ||
                  !password ||
                  confirmation.trim().toLowerCase() !==
                    textOf(selected?.email, "").toLowerCase()
                }
              >
                {saving ? <FiRefreshCw /> : <FiLock />}
                {saving ? "Applying…" : "Confirm action"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </>
  );
}

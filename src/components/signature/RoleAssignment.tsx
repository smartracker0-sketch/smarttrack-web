"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { FiUserCheck, FiX } from "react-icons/fi";
import { textOf, type DataRow } from "./data";
import { allAdminRows as allRows } from "./adminData";

export default function RoleAssignment({
  onNotice,
}: {
  onNotice: (message: string) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false),
    [users, setUsers] = useState<DataRow[]>([]),
    [profiles, setProfiles] = useState<DataRow[]>([]),
    [userId, setUserId] = useState(""),
    [profileId, setProfileId] = useState(""),
    [loading, setLoading] = useState(false),
    [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    const controller = new AbortController();
    async function load() {
      try {
        const [people, roles] = await Promise.all([
          allRows("/api/admin/users", controller.signal),
          allRows("/api/admin/operations/roles", controller.signal),
        ]);
        if (!controller.signal.aborted) {
          setUsers(
            people.filter(
              (user) =>
                !JSON.stringify(user.roles ?? user.role ?? "").includes(
                  "SUPER_ADMIN",
                ),
            ),
          );
          setProfiles(roles.filter((profile) => profile.active !== false));
        }
      } catch (cause) {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "Choices could not be loaded.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [open]);
  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving || !userId) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        `/api/admin/access/users/${encodeURIComponent(userId)}/profile`,
        {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profileId: profileId || null }),
        },
      );
      const body = await response.json();
      if (!response.ok)
        throw Error(body?.message ?? "The profile could not be assigned.");
      onNotice("Profile updated. The user must sign in again.");
      dialog.current?.close();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Assignment failed.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <button
        className="st-button"
        onClick={() => {
          setUserId("");
          setProfileId("");
          setError("");
          setLoading(true);
          setOpen(true);
        }}
      >
        <FiUserCheck />
        Assign profile
      </button>
      {open && (
        <dialog
          className="st-dialog st-native-dialog"
          aria-labelledby="role-assignment-title"
          ref={dialog}
          onClose={() => setOpen(false)}
          onCancel={(event) => {
            if (saving) event.preventDefault();
          }}
        >
          <form onSubmit={save}>
            <header>
              <h2 id="role-assignment-title">Assign role profile</h2>
              <button
                type="button"
                className="st-icon-button"
                aria-label="Close profile assignment"
                disabled={saving}
                onClick={() => dialog.current?.close()}
              >
                <FiX />
              </button>
            </header>
            <div className="st-dialog-body">
              <p className="st-muted">
                Assigning a profile replaces the user’s base role and ends their
                current sessions. Root administrators retain their built-in
                role.
              </p>
              {error && (
                <p className="st-error" role="alert">
                  {error}
                </p>
              )}
              <label className="st-field" htmlFor="role-assignment-user">
                <span>User</span>
                <select
                  id="role-assignment-user"
                  aria-label="User"
                  className="st-input"
                  required
                  value={userId}
                  disabled={loading || saving}
                  onChange={(event) => {
                    setUserId(event.target.value);
                    setProfileId(
                      String(
                        users.find(
                          (user) => String(user.id) === event.target.value,
                        )?.accessProfileId ?? "",
                      ),
                    );
                  }}
                >
                  <option value="">
                    {loading ? "Loading users…" : "Choose a user"}
                  </option>
                  {users.map((user) => (
                    <option key={String(user.id)} value={String(user.id)}>
                      {textOf(user.displayName ?? user.name ?? user.email)} ·{" "}
                      {textOf(user.email)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="st-field" htmlFor="role-assignment-profile">
                <span>Role profile</span>
                <select
                  id="role-assignment-profile"
                  aria-label="Role profile"
                  className="st-input"
                  value={profileId}
                  disabled={loading || saving}
                  onChange={(event) => setProfileId(event.target.value)}
                >
                  <option value="">
                    No profile · retain current base role
                  </option>
                  {profiles.map((profile) => (
                    <option key={String(profile.id)} value={String(profile.id)}>
                      {textOf(profile.name)}
                    </option>
                  ))}
                </select>
              </label>
              <p className="st-muted">
                Removing a profile restores its base role’s standard access,
                subject to the account’s enabled modules.
              </p>
            </div>
            <footer>
              <button
                className="st-button"
                type="button"
                disabled={saving}
                onClick={() => dialog.current?.close()}
              >
                Cancel
              </button>
              <button
                className="st-button st-primary"
                disabled={saving || loading || !userId}
              >
                {saving ? "Applying…" : "Apply profile"}
              </button>
            </footer>
          </form>
        </dialog>
      )}
    </>
  );
}

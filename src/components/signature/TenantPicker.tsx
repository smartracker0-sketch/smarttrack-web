"use client";
import { useEffect, useRef, useState } from "react";
import { FiCheck, FiChevronDown, FiHome, FiSearch, FiX } from "react-icons/fi";
import { useWorkspace } from "./WorkspaceContext";
export default function TenantPicker() {
  const { account, tenants, scope, setScope } = useWorkspace();
  const [open, setOpen] = useState(false),
    [draft, setDraft] = useState<string[] | null>(scope),
    [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  const label = tenants.length
    ? scope === null
      ? "All tenants"
      : scope.length === 0
        ? "No tenants"
        : scope.length === 1
          ? (tenants.find((t) => t.id === scope[0])?.name ?? "1 tenant")
          : `${scope.length} tenants`
    : account.roles.includes("SUPER_ADMIN") ? "All tenants" : "Your account";
  return (
    <div
      className="st-picker"
      ref={root}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <button
        className="st-button st-tenant"
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          setDraft(scope);
          setQuery("");
          setOpen(!open);
        }}
      >
        <FiHome />
        <span>{label}</span>
        <FiChevronDown />
      </button>
      {open && (
        <div
          className="st-popover st-tenant-menu"
          role="dialog"
          aria-label="Tenant scope"
        >
          <div className="st-popover-head">
            <strong>Tenant scope</strong>
            <button
              className="st-icon-button"
              aria-label="Close tenant picker"
              onClick={() => setOpen(false)}
            >
              <FiX />
            </button>
          </div>
          {tenants.length > 0 ? (
            <>
              <label className="st-search">
                <FiSearch />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tenants"
                  aria-label="Search tenants"
                  autoFocus
                />
              </label>
              <button
                className={`st-tenant-all ${draft === null ? "is-active" : ""}`}
                role="checkbox"
                aria-checked={draft === null}
                onClick={() => setDraft(null)}
              >
                <FiHome />
                <strong>All tenants</strong>
                {draft === null && <FiCheck />}
              </button>
              <div className="st-tenant-options">
                {tenants
                  .filter((t) =>
                    t.name.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((tenant) => (
                    <label key={tenant.id}>
                      <input
                        type="checkbox"
                        checked={draft?.includes(tenant.id) ?? false}
                        onChange={(event) =>
                          setDraft((current) =>
                            event.target.checked
                              ? [...(current ?? []), tenant.id]
                              : (current ?? []).filter(
                                  (id) => id !== tenant.id,
                                ),
                          )
                        }
                      />
                      <span>{tenant.name}</span>
                    </label>
                  ))}
              </div>
              <footer>
                <button
                  className="st-button st-small"
                  onClick={() => setDraft([])}
                >
                  Clear
                </button>
                <button
                  className="st-button st-primary st-small"
                  onClick={() => {
                    setScope(draft);
                    setOpen(false);
                  }}
                >
                  Apply
                </button>
              </footer>
            </>
          ) : (
            <p className="st-muted">
              {account.displayName}&apos;s account is scoped by your
              permissions.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiMoon,
  FiSearch,
  FiSun,
  FiUser,
  FiX,
} from "react-icons/fi";
import { LuSparkles } from "react-icons/lu";
import AlertWatcher from "@/app/app/AlertWatcher";
import FleetAiAssistant from "@/app/app/FleetAiAssistant";
import { redirectIfUnauthorized } from "@/lib/clientSession";
import { useAdminAuthStore } from "@/admin/store/useAdminAuthStore";
import {
  WorkspaceContext,
  type WorkspaceAccount,
  type Tenant,
} from "./WorkspaceContext";
import {
  hubs,
  pages,
  additionalPages,
  pageAtPath,
  pageById,
  type HubDefinition,
} from "./navigation";
import { rowsFrom, read, textOf, vehicleName, type DataRow } from "./data";
import Icon from "./Icon";
import PageHeader from "./PageHeader";
import "./signature.css";
import "./map-panels.css";
import BrandMark from "@/components/BrandMark";
import { canOpenPage, canReadModule } from "./access";

export default function WorkspaceShell({
  children,
  mode = "client",
}: {
  children: ReactNode;
  mode?: "client" | "admin";
}) {
  const admin = mode === "admin",
    pathname = usePathname(),
    router = useRouter();
  const page = pageAtPath(pathname),
    hub = hubs.find((item) => item.id === page?.hub),
    map =
      pathname === "/app/devices" ||
      pathname === "/app/history" ||
      pathname === "/admin/map";
  const [account, setAccount] = useState<WorkspaceAccount | null>(null),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0),
    [theme, setTheme] = useState<"light" | "dark">("light"),
    [sidebarColour, setSidebarColour] = useState<"blue" | "white">("white"),
    [collapsed, setCollapsed] = useState(false),
    [mobile, setMobile] = useState(false),
    [closedHub, setClosedHub] = useState<string | null>(null),
    [tenants, setTenants] = useState<Tenant[]>([]),
    [scope, setScope] = useState<string[] | null>(null),
    [palette, setPalette] = useState(false),
    [query, setQuery] = useState(""),
    [searchRows, setSearchRows] = useState<DataRow[]>([]),
    [searchError, setSearchError] = useState("");
  const paletteRef = useRef<HTMLDivElement>(null);
  const impersonating = useAdminAuthStore((state) => state.impersonating),
    stopImpersonation = useAdminAuthStore((state) => state.stopImpersonation);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function loadSession() {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await fetch(
            admin ? "/api/admin/session" : "/api/auth/me",
            { cache: "no-store", signal: controller.signal },
          );
          if (![502, 503, 504].includes(response.status) || attempt === 2)
            return response;
        } catch (cause) {
          if (controller.signal.aborted || attempt === 2) throw cause;
        }
        await new Promise<void>((resolve, reject) => {
          const timer = setTimeout(done, 500 * (attempt + 1));
          function done() {
            controller.signal.removeEventListener("abort", abort);
            resolve();
          }
          function abort() {
            clearTimeout(timer);
            reject(new DOMException("Aborted", "AbortError"));
          }
          controller.signal.addEventListener("abort", abort, { once: true });
        });
      }
      throw Error("Your workspace could not be loaded. Please retry.");
    }
    void loadSession()
      .then(async (response) => {
        if (admin && (response.status === 401 || response.status === 403)) {
          router.replace("/admin/login");
          return;
        }
        if (
          !admin &&
          (await redirectIfUnauthorized(response, { verifySession: false }))
        )
          return;
        if (!response.ok)
          throw Error("Your workspace could not be loaded. Please retry.");
        const data = await response.json();
        if (active) {
          setAccount({
            id: String(data.id ?? ""),
            displayName:
              data.displayName ?? data.name ?? data.email ?? "Account",
            email: data.email ?? "",
            roles: Array.isArray(data.roles) ? data.roles : [],
            moduleAccess:
              data.moduleAccess && typeof data.moduleAccess === "object"
                ? data.moduleAccess
                : undefined,
          });
          setError("");
        }
      })
      .catch((cause) => {
        if (active && cause.name !== "AbortError") setError(cause.message);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [admin, revision, router, pathname]);
  useEffect(() => {
    if (!error) return;
    function retry() {
      if (document.visibilityState === "visible")
        setRevision((value) => value + 1);
    }
    const timer = setInterval(retry, 15000);
    window.addEventListener("online", retry);
    window.addEventListener("focus", retry);
    return () => {
      clearInterval(timer);
      window.removeEventListener("online", retry);
      window.removeEventListener("focus", retry);
    };
  }, [error]);
  useEffect(() => {
    const refreshProfile = () => setRevision((value) => value + 1);
    window.addEventListener("st:profile-updated", refreshProfile);
    return () => window.removeEventListener("st:profile-updated", refreshProfile);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("st-signature-frame") ?? "{}",
        );
        setTheme(saved.theme === "dark" ? "dark" : "light");
        setSidebarColour(saved.sidebarColour === "blue" ? "blue" : "white");
        setCollapsed(saved.collapsed === true);
      } catch {
        /* Keep the default frame when browser storage is unavailable. */
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette(true);
      }
      if (event.key === "Escape") {
        if (paletteRef.current) {
          event.preventDefault();
          setPalette(false);
        } else setMobile(false);
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, []);
  useEffect(() => {
    if (!account || (!admin && !account.roles.includes("SUPER_ADMIN"))) return;
    const controller = new AbortController();
    fetch(
      admin
        ? "/api/admin/organisations?size=500"
        : "/api/organisations?size=500",
      {
        signal: controller.signal,
        cache: "no-store",
      },
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data)
          setTenants(
            rowsFrom(data).map((row) => ({
              id: String(row.id),
              name: textOf(read(row, "name", "companyName", "displayName")),
            })),
          );
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [account, admin]);
  useEffect(() => {
    if (
      !palette ||
      query.trim().length < 2 ||
      admin ||
      !canReadModule(account, "control")
    )
      return;
    const controller = new AbortController(),
      timer = setTimeout(() => {
        setSearchError("");
        fetch(`/api/devices?search=${encodeURIComponent(query)}&size=100`, {
          signal: controller.signal,
          cache: "no-store",
        })
          .then(async (response) => {
            if (!response.ok)
              throw Error("Vehicle search is temporarily unavailable.");
            return response.json();
          })
          .then((data) =>
            setSearchRows(
              rowsFrom(data)
                .filter((row) =>
                  [vehicleName(row), read(row, "imei", "id")]
                    .join(" ")
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                )
                .slice(0, 6),
            ),
          )
          .catch((cause) => {
            if (cause.name !== "AbortError") setSearchError(cause.message);
          });
      }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, palette, admin, account]);
  function rememberFrame(nextTheme = theme, nextCollapsed = collapsed, nextSidebar = sidebarColour) {
    try {
      localStorage.setItem(
        "st-signature-frame",
        JSON.stringify({ theme: nextTheme, collapsed: nextCollapsed, sidebarColour: nextSidebar }),
      );
    } catch {
      /* The workspace still works without persisted display preferences. */
    }
  }
  function closeLayers() {
    document
      .querySelectorAll<HTMLDetailsElement>(".st-profile[open]")
      .forEach((element) => (element.open = false));
    setMobile(false);
    setPalette(false);
    setQuery("");
    setSearchRows([]);
  }
  async function logout() {
    const response = await fetch(
      admin ? "/api/admin/logout" : "/api/auth/logout",
      { method: "POST" },
    ).catch(() => null);
    if (!response?.ok) {
      setError("Sign out failed. Please retry.");
      return;
    }
    if (admin) useAdminAuthStore.getState().logout();
    router.replace(admin ? "/admin/login" : "/login");
    router.refresh();
  }
  const showHub = Boolean(hub && closedHub !== hub.id),
    rail = collapsed,
    root = admin || account?.roles.includes("SUPER_ADMIN");
  function hubLink(item: HubDefinition) {
    return pageById(item.items[0].page)!.href;
  }
  const mainItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: "dashboard",
      href: "/app/dashboard",
    },
    { id: "live", title: "Live map", icon: "map", href: "/app/devices" },
    {
      id: "control",
      title: "Control Center",
      icon: "shield",
      href: hubLink(hubs[0]),
    },
    { id: "history", title: "History", icon: "history", href: "/app/history" },
    ...hubs
      .filter((item) => !["control", "admin"].includes(item.id))
      .map((item) => ({
        id: item.id,
        title: item.title,
        icon: item.icon,
        href: hubLink(item),
      })),
    {
      id: "settings",
      title: "Settings",
      icon: "settings",
      href: "/app/settings",
    },
    { id: "support", title: "Support", icon: "help", href: "/app/support" },
    ...(root
      ? [
          {
            id: "admin",
            title: "Admin",
            icon: "shield",
            href: "/admin/overview",
          },
        ]
      : []),
  ].filter(
    (item) =>
      ["dashboard", "support"].includes(item.id) ||
      canReadModule(account, item.id === "live" ? "control" : item.id),
  );
  const activeId = page?.hub ?? page?.id;
  const legacy =
    !["/app/dashboard", "/app/support", "/app/control"].includes(pathname) &&
    !pathname.startsWith("/app/control/") &&
    !pathname.startsWith("/app/fuel/") &&
    !pathname.startsWith("/app/video/") &&
    !pathname.startsWith("/app/maintenance/") &&
    !pathname.startsWith("/admin/system/settings");
  return (
    <div
      className={`st-workspace${admin ? " st-admin-mode" : ""}${rail ? " st-rail" : ""}${showHub ? " st-has-hub" : ""}${map ? " st-map-page" : ""}${mobile ? " st-drawer-open" : ""}`}
      data-theme={theme}
      data-sidebar-colour={sidebarColour}
    >
      <WorkspaceContext.Provider
        value={{
          account: account ?? {
            id: "",
            displayName: "Account",
            email: "",
            roles: [],
          },
          admin,
          tenants,
          scope,
          setScope,
          theme,
          sidebarColour,
          setSidebarColour: (value) => {
            setSidebarColour(value);
            rememberFrame(theme, collapsed, value);
          },
          setTheme: (value) => {
            setTheme(value);
            rememberFrame(value);
          },
        }}
      >
        <header className="st-topbar">
          <button
            className="st-icon-button st-mobile-menu"
            aria-label="Open navigation"
            onClick={() => setMobile(true)}
          >
            <FiMenu />
          </button>
          <Link
            href={admin ? "/admin/overview" : "/app/dashboard"}
            className="st-brand st-mobile-brand"
            aria-label="Smart Tracker home"
            onClick={closeLayers}
          >
            <BrandMark size={32} />
          </Link>
          <div className="st-context">
            {hub && (
              <>
                <span>{hub.title}</span>
                <FiChevronRight aria-hidden="true" size={13} />
              </>
            )}
            <strong>{page?.title ?? "Workspace"}</strong>
          </div>
          <button
            className="st-command-button"
            onClick={() => setPalette(true)}
            aria-label="Search pages and vehicles"
          >
            <FiSearch />
            <span>Search vehicles, pages, IMEI…</span>
            <kbd>Ctrl K</kbd>
          </button>
          <div className="st-top-actions">
            <div
              className="st-theme-pill"
              role="group"
              aria-label="Colour theme"
            >
              <button
                type="button"
                aria-label="Use light mode"
                aria-pressed={theme === "light"}
                title="Light mode"
                onClick={() => {
                  setTheme("light");
                  rememberFrame("light");
                }}
              >
                <FiSun />
              </button>
              <button
                type="button"
                aria-label="Use dark mode"
                aria-pressed={theme === "dark"}
                title="Dark mode"
                onClick={() => {
                  setTheme("dark");
                  rememberFrame("dark");
                }}
              >
                <FiMoon />
              </button>
            </div>
            {!admin && canReadModule(account, "control") && (
              <button
                className="st-button st-ai-trigger"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("fleet-ai:ask"))
                }
                aria-label="Open AI Assistant"
              >
                <LuSparkles />
                <span>AI Assistant</span>
              </button>
            )}
            {account &&
              (!admin ? (
                canReadModule(account, "control") ? (
                  <AlertWatcher />
                ) : null
              ) : (
                <Link
                  href="/admin/alerts"
                  className="st-icon-button"
                  aria-label="Alerts"
                >
                  <Icon name="bell" />
                </Link>
              ))}
            <Link
              href="/app/support"
              className="st-icon-button st-help"
              aria-label="Support"
            >
              <FiHelpCircle />
            </Link>
            <details
              className="st-profile"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.stopPropagation();
                  event.currentTarget.open = false;
                  event.currentTarget
                    .querySelector<HTMLElement>("summary")
                    ?.focus();
                }
              }}
            >
              <summary aria-label="Account menu">
                <span className="st-profile-meta">
                  <strong>{account?.displayName ?? "Account"}</strong>
                  <small>
                    {admin
                      ? "Root superadmin"
                      : (account?.roles[0]
                          ?.replaceAll("_", " ")
                          .toLowerCase() ?? "")}
                  </small>
                </span>
                <span className="st-avatar">
                  {account?.displayName
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase() || <FiUser />}
                </span>
              </summary>
              <div className="st-popover">
                <Link href="/app/profile" onClick={closeLayers}>
                  <FiUser />
                  Profile
                </Link>
                <Link
                  href={admin ? "/admin/system/settings" : "/app/settings"}
                  onClick={closeLayers}
                >
                  <Icon name="settings" />
                  Preferences
                </Link>
                {admin && (
                  <>
                    <Link href="/admin/devices" onClick={closeLayers}>
                      Device management
                    </Link>
                    <Link href="/admin/vehicles" onClick={closeLayers}>
                      Vehicle management
                    </Link>
                    <Link href="/admin/crm" onClick={closeLayers}>
                      CRM
                    </Link>
                    <Link href="/admin/support" onClick={closeLayers}>
                      Support tickets
                    </Link>
                  </>
                )}
                <button onClick={() => void logout()}>
                  <FiLogOut />
                  Sign out
                </button>
              </div>
            </details>
          </div>
        </header>
        {mobile && (
          <button
            className="st-drawer-backdrop"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          />
        )}
        <aside className="st-sidebar">
          <div className="st-sidebar-brand">
            <Link
              href={admin ? "/admin/overview" : "/app/dashboard"}
              className="st-brand"
              aria-label="Smart Tracker home"
              onClick={closeLayers}
            >
              <BrandMark size={32} />
            </Link>
          </div>
          <div className="st-drawer-title">
            <Link
              href={admin ? "/admin/overview" : "/app/dashboard"}
              className="st-brand"
              aria-label="Smart Tracker home"
              onClick={closeLayers}
            >
              <BrandMark size={32} />
            </Link>
            <button
              className="st-icon-button"
              aria-label="Close navigation"
              onClick={() => setMobile(false)}
            >
              <FiX />
            </button>
          </div>
          <button
            className="st-sidebar-toggle"
            aria-label={rail ? "Expand navigation" : "Collapse navigation"}
            aria-expanded={!rail}
            title={rail ? "Expand navigation" : "Collapse navigation"}
            onClick={() => {
              setCollapsed(!collapsed);
              rememberFrame(theme, !collapsed);
            }}
          >
            {rail ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
          <nav aria-label="Main navigation">
            {mainItems.map((item) => (
              <div key={item.id}>
                {item.id === "settings" && <div className="st-nav-divider" />}
                <Link
                  href={item.href}
                  className={`st-nav-item${activeId === item.id ? " is-active" : ""}`}
                  aria-label={item.title}
                  title={rail ? item.title : undefined}
                  aria-current={activeId === item.id ? "page" : undefined}
                  onClick={() => {
                    closeLayers();
                    setClosedHub(null);
                  }}
                >
                  <Icon name={item.icon} />
                  <span>{item.title}</span>
                </Link>
                {mobile && activeId === item.id && hub && (
                  <div className="st-mobile-hub">
                    {hub.items.map((child) => (
                      <Link
                        key={child.page}
                        href={pageById(child.page)!.href}
                        onClick={closeLayers}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <button
            className="st-nav-item st-signout"
            onClick={() => void logout()}
            title="Sign out"
          >
            <FiLogOut />
            <span>Sign out</span>
          </button>
        </aside>
        {showHub && hub && (
          <nav className="st-hub" aria-label={hub.title}>
            <div className="st-hub-title">
              <strong>{hub.title}</strong>
              <button
                className="st-icon-button"
                aria-label="Close section navigation"
                onClick={() => setClosedHub(hub.id)}
              >
                <FiX />
              </button>
            </div>
            {hub.items.map((item) => {
              const target = pageById(item.page)!,
                active =
                  target.id === page?.id ||
                  Boolean(target.group && target.group === page?.group);
              return (
                <Link
                  key={item.page}
                  href={target.href}
                  className={active ? "is-active" : ""}
                  aria-current={active ? "page" : undefined}
                  onClick={(event) => {
                    closeLayers();
                    if (
                      !target.group ||
                      event.ctrlKey ||
                      event.metaKey ||
                      event.shiftKey ||
                      event.altKey
                    )
                      return;
                    try {
                      const saved = pageById(
                        localStorage.getItem(
                          `st-tab:${account?.id}:${target.hub ?? "workspace"}:${target.group}`,
                        ) ?? "",
                      );
                      if (
                        saved &&
                        saved.group === target.group &&
                        saved.hub === target.hub &&
                        saved.id !== target.id
                      ) {
                        event.preventDefault();
                        router.push(saved.href);
                      }
                    } catch {
                      /* Open the group's first tab if storage is unavailable. */
                    }
                  }}
                >
                  <Icon name={item.icon} size={17} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        )}
        <main className="st-main" id="workspace-main">
          {admin && impersonating && (
            <div className="st-impersonation">
              Viewing {impersonating.orgName}
              <button
                className="st-button st-small"
                onClick={() => {
                  stopImpersonation();
                  router.push("/admin/organisations");
                }}
              >
                Exit impersonation
              </button>
            </div>
          )}
          {error ? (
            <div className="st-state" role="alert">
              <Icon name="alert" size={28} />
              <h1>Workspace unavailable</h1>
              <p>{error}</p>
              <button
                className="st-button st-primary"
                onClick={() => {
                  setError("");
                  setRevision((value) => value + 1);
                }}
              >
                Retry
              </button>
            </div>
          ) : !account ? (
            <div className="st-state" role="status">
              Checking your session…
            </div>
          ) : page && !canOpenPage(account, page) ? (
            <div className="st-state">
              <Icon name="shield" size={28} />
              <h1>Access unavailable</h1>
              <p>This module is not enabled for your account or role.</p>
              <Link className="st-button" href="/app/dashboard">
                Dashboard
              </Link>
              <Link className="st-link" href="/app/support">
                Contact support
              </Link>
            </div>
          ) : (
            <div
              className={`${map ? "st-map-content" : "st-page-content"}${legacy ? " st-legacy" : ""}`}
            >
              {admin &&
                page &&
                [
                  "/admin/organisations",
                  "/admin/system/audit-log",
                  "/admin/system/health",
                  "/admin/devices",
                  "/admin/vehicles",
                  "/admin/support",
                ].includes(pathname) && (
                  <PageHeader page={page} tenant={false} />
                )}
              {children}
            </div>
          )}
        </main>
        {account && !admin && canReadModule(account, "control") && (
          <FleetAiAssistant />
        )}
        {palette && (
          <div
            className="st-dialog-backdrop"
            onClick={(event) => {
              if (event.target === event.currentTarget) setPalette(false);
            }}
          >
            <section
              className="st-command-dialog"
              role="dialog"
              aria-modal="true"
              aria-label="Search"
              ref={paletteRef}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.stopPropagation();
                  setPalette(false);
                }
                if (event.key === "Tab") {
                  const nodes = [
                    ...event.currentTarget.querySelectorAll<HTMLElement>(
                      "input,a,button",
                    ),
                  ];
                  const first = nodes[0],
                    last = nodes[nodes.length - 1];
                  if (event.shiftKey && document.activeElement === first) {
                    event.preventDefault();
                    last.focus();
                  } else if (
                    !event.shiftKey &&
                    document.activeElement === last
                  ) {
                    event.preventDefault();
                    first.focus();
                  }
                }
              }}
            >
              <label className="st-command-input">
                <FiSearch />
                <input
                  autoFocus
                  placeholder="Search pages, vehicles or IMEI"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSearchRows([]);
                  }}
                />
                <button
                  className="st-icon-button"
                  aria-label="Close search"
                  onClick={() => setPalette(false)}
                >
                  <FiX />
                </button>
              </label>
              <div className="st-command-results">
                {[...pages, ...additionalPages]
                  .filter(
                    (item) =>
                      (!item.admin || root) &&
                      canOpenPage(account, item) &&
                      item.title.toLowerCase().includes(query.toLowerCase()),
                  )
                  .slice(0, 10)
                  .map((item) => (
                    <Link href={item.href} key={item.id} onClick={closeLayers}>
                      <Icon name={item.icon} />
                      <span>{item.title}</span>
                      <small>
                        {hubs.find((h) => h.id === item.hub)?.title}
                      </small>
                    </Link>
                  ))}
                {searchRows.map((row) => (
                  <Link
                    key={String(row.id)}
                    href={`/app/devices?vehicle=${encodeURIComponent(String(row.id))}`}
                    onClick={closeLayers}
                  >
                    <Icon name="truck" />
                    <span>{vehicleName(row)}</span>
                    <small>{textOf(row.imei, "")}</small>
                  </Link>
                ))}
                {searchError && (
                  <p role="status" className="st-muted">
                    {searchError}
                  </p>
                )}
              </div>
            </section>
          </div>
        )}
      </WorkspaceContext.Provider>
    </div>
  );
}

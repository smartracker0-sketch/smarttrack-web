"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useWorkspace } from "./WorkspaceContext";
import { FiMoreHorizontal, FiRefreshCw } from "react-icons/fi";
import Icon from "./Icon";
import TenantPicker from "./TenantPicker";
import { groupPages, hubs, type PageDefinition } from "./navigation";
import { canOpenPage } from "./access";
export default function PageHeader({
  page,
  actions,
  onRefresh,
  tenant = true,
}: {
  page: PageDefinition;
  actions?: ReactNode;
  onRefresh?: () => void;
  tenant?: boolean;
}) {
  const { account } = useWorkspace();
  const tabs = groupPages(page).filter((tab) => canOpenPage(account, tab)),
    hub = hubs.find((item) => item.id === page.hub);
  useEffect(() => {
    if (!page.group) return;
    try {
      localStorage.setItem(
        `st-tab:${account.id}:${page.hub ?? "workspace"}:${page.group}`,
        page.id,
      );
    } catch {
      /* Keep navigation usable without browser storage. */
    }
  }, [account.id, page.group, page.hub, page.id]);
  const [more, setMore] = useState(false);
  const overflow = useRef<HTMLDetailsElement>(null);
  return (
    <header className="st-page-header">
      <div className="st-page-identity">
        <span className="st-page-icon">
          <Icon name={page.icon} size={24} />
        </span>
        <div>
          <div className="st-eyebrow">{hub?.title ?? "Workspace"}</div>
          <h1>{page.group ?? page.title}</h1>
        </div>
      </div>
      <div className="st-page-actions">
        {tenant && !page.admin && <TenantPicker />}
        {onRefresh && (
          <button
            className="st-icon-button"
            aria-label={`Refresh ${page.title}`}
            onClick={onRefresh}
          >
            <FiRefreshCw />
          </button>
        )}
        {actions && <div className="st-header-actions">{actions}</div>}
        {actions && (
          <details
            ref={overflow}
            className="st-header-overflow"
            open={more}
            onToggle={(event) => setMore(event.currentTarget.open)}
          >
            <summary className="st-button">
              <FiMoreHorizontal />
              More
            </summary>
            <div className="st-popover">{more && actions}</div>
          </details>
        )}
      </div>
      {tabs.length > 0 && (
        <nav
          className="st-tabs"
          aria-label={page.group}
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
              return;
            const links = [
                ...event.currentTarget.querySelectorAll<HTMLAnchorElement>("a"),
              ],
              current = links.indexOf(
                document.activeElement as HTMLAnchorElement,
              );
            if (current < 0) return;
            event.preventDefault();
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? links.length - 1
                  : (current +
                      (event.key === "ArrowRight" ? 1 : -1) +
                      links.length) %
                    links.length;
            links[next].focus();
            links[next].click();
          }}
        >
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={page.id === tab.id ? "is-active" : ""}
              aria-current={page.id === tab.id ? "page" : undefined}
            >
              <Icon name={tab.icon} size={15} />
              {tab.title}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
  FiDownload,
  FiSearch,
  FiSettings,
  FiX,
} from "react-icons/fi";
import { redirectIfUnauthorized } from "@/lib/clientSession";
import { csvDownload, read, rowsFrom, textOf, type DataRow } from "./data";
import { useWorkspace } from "./WorkspaceContext";
import RowActions, { type RowAction } from "./RowActions";
export type Column = {
  key: string;
  label: string;
  numeric?: boolean;
  sortable?: boolean;
  render?: (row: DataRow) => ReactNode;
};
export default function DataTable({
  id,
  endpoint,
  columns,
  serverPaged = false,
  scoped = serverPaged,
  rowFilter,
  actions,
  deviceRows = false,
  onEdit,
  onDelete,
  detailColumns,
  mapIdKey = "id",
  onQueryChange,
  refreshKey = 0,
  rowActions,
}: {
  id: string;
  endpoint: string;
  columns: Column[];
  serverPaged?: boolean;
  scoped?: boolean;
  rowFilter?: (row: DataRow) => boolean;
  actions?: ReactNode;
  deviceRows?: boolean;
  onEdit?: (row: DataRow) => void;
  onDelete?: (row: DataRow) => void;
  detailColumns?: Column[];
  mapIdKey?: string;
  onQueryChange?: (query: { search: string; sort: string }) => void;
  refreshKey?: number;
  rowActions?: (row: DataRow) => RowAction[];
}) {
  const { account, scope } = useWorkspace();
  const [rows, setRows] = useState<DataRow[]>([]),
    [total, setTotal] = useState(0),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [search, setSearch] = useState(""),
    [sort, setSort] = useState(""),
    [descending, setDescending] = useState(false),
    [size, setSize] = useState(10),
    [page, setPage] = useState(1),
    [picked, setPicked] = useState<string[]>([]),
    [detail, setDetail] = useState<DataRow | null>(null),
    [hidden, setHidden] = useState<string[]>([]),
    [revision, setRevision] = useState(0),
    [ready, setReady] = useState(false);
  const top = useRef<HTMLDivElement>(null),
    body = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLElement>(null),
    lastFocus = useRef<HTMLElement | null>(null);
  const previousScope = useRef(JSON.stringify(scope));
  const storageKey = `st-table:${account.id}:${id}`;
  useEffect(() => {
    if (ready)
      onQueryChange?.({
        search,
        sort: sort ? `${sort},${descending ? "desc" : "asc"}` : "",
      });
  }, [ready, search, sort, descending, onQueryChange]);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const value = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
        if ([10, 25, 50, 100].includes(value.size)) setSize(value.size);
        if (typeof value.search === "string") setSearch(value.search);
        if (
          typeof value.sort === "string" &&
          columns.some((column) => column.key === value.sort && column.sortable !== false)
        )
          setSort(value.sort);
        setDescending(value.descending === true);
        if (Array.isArray(value.hidden))
          setHidden(
            value.hidden.filter((key: string) =>
              columns.some((column) => column.key === key),
            ),
          );
      } catch {
        /* A damaged preference never prevents loading records. */
      }
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [storageKey, columns]);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ size, search, sort, descending, hidden }),
      );
    } catch {
      /* Display preferences remain usable in memory. */
    }
  }, [storageKey, ready, size, search, sort, descending, hidden]);
  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController(),
      timer = setTimeout(
        () => {
          const scopeKey = JSON.stringify(scope);
          if (scoped && previousScope.current !== scopeKey) {
            previousScope.current = scopeKey;
            setPicked([]);
            if (page !== 1) {
              setPage(1);
              return;
            }
          }
          if (scoped && scope?.length === 0) {
            setRows([]);
            setTotal(0);
            setLoading(false);
            return;
          }
          setLoading(true);
          setError("");
          const url = new URL(endpoint, window.location.origin);
          if (serverPaged) {
            url.searchParams.set("page", String(page - 1));
            url.searchParams.set("size", String(size));
            url.searchParams.set("search", search);
            if (sort)
              url.searchParams.set(
                "sort",
                sort + "," + (descending ? "desc" : "asc"),
              );
            scope?.forEach((value) =>
              url.searchParams.append("organisationId", value),
            );
          }
          fetch(url.pathname + url.search, {
            cache: "no-store",
            signal: controller.signal,
          })
            .then(async (response) => {
              if (await redirectIfUnauthorized(response))
                throw Error("Your session expired.");
              const data = await response.json().catch(() => null);
              if (controller.signal.aborted) return;
              if (!response.ok)
                throw Error(data?.message ?? "Records could not be loaded.");
              setRows(rowsFrom(data));
              setTotal(
                typeof data?.totalElements === "number"
                  ? data.totalElements
                  : rowsFrom(data).length,
              );
              setPicked([]);
            })
            .catch((cause) => {
              if (cause.name !== "AbortError") {
                setError(cause.message);
                setRows([]);
                setTotal(0);
              }
            })
            .finally(() => {
              if (!controller.signal.aborted) setLoading(false);
            });
        },
        serverPaged ? 180 : 0,
      );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    endpoint,
    ready,
    serverPaged,
    page,
    size,
    search,
    sort,
    descending,
    revision,
    refreshKey,
    scope,
    scoped,
  ]);
  const visibleColumns = useMemo(
    () => columns.filter((column) => !hidden.includes(column.key)),
    [columns, hidden],
  );
  const filtered = useMemo(() => {
    let values = rows;
    if (rowFilter) values = values.filter(rowFilter);
    if (scoped && scope !== null && !serverPaged)
      values = values.filter((row) =>
        scope.includes(String(row.organisationId ?? "")),
      );
    if (!serverPaged && search)
      values = values.filter((row) =>
        columns
          .map((column) => textOf(read(row, column.key), ""))
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    if (!serverPaged && sort)
      values = [...values].sort((a, b) => {
        const x = read(a, sort),
          y = read(b, sort);
        const result =
          typeof x === "number" && typeof y === "number"
            ? x - y
            : textOf(x, "").localeCompare(textOf(y, ""), undefined, {
                numeric: true,
              });
        return descending ? -result : result;
      });
    return values;
  }, [
    rows,
    rowFilter,
    scope,
    scoped,
    serverPaged,
    search,
    columns,
    sort,
    descending,
  ]);
  const count = serverPaged ? total : filtered.length,
    pages = Math.max(1, Math.ceil(count / size)),
    safePage = Math.min(page, pages),
    slice = serverPaged
      ? filtered
      : filtered.slice((safePage - 1) * size, safePage * size);
  const rowKey = (row: DataRow, index: number) =>
    String(row.id ?? row.deviceId ?? index);
  const all =
    slice.length > 0 &&
    slice.every((row, index) => picked.includes(rowKey(row, index)));
  useEffect(() => {
    const upper = top.current,
      lower = body.current;
    if (!upper || !lower) return;
    const resize = () => {
      const inner = upper.firstElementChild as HTMLElement;
      if (inner) inner.style.width = lower.scrollWidth + "px";
      upper.hidden = lower.scrollWidth <= lower.clientWidth + 2;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(lower);
    if (lower.firstElementChild) observer.observe(lower.firstElementChild);
    return () => observer.disconnect();
  }, [visibleColumns, loading, rows]);
  useEffect(() => {
    if (!detail) return;
    lastFocus.current = document.activeElement as HTMLElement;
    dialog.current?.focus();
    return () => {
      lastFocus.current?.focus();
    };
  }, [detail]);
  function download(selected = false) {
    const values = selected
      ? filtered.filter((row, index) => picked.includes(rowKey(row, index)))
      : filtered;
    csvDownload(
      id + ".csv",
      visibleColumns.map((column) => column.label),
      values.map((row) =>
        visibleColumns.map((column) => read(row, column.key)),
      ),
    );
  }
  return (
    <>
      <section className="st-card">
        <div className={`st-table-tools${picked.length ? " st-bulk" : ""}`}>
          {picked.length ? (
            <>
              <strong>{picked.length} selected</strong>
              <button
                className="st-button st-small"
                onClick={() => download(true)}
              >
                <FiDownload />
                Export selected
              </button>
              <button
                className="st-button st-small"
                onClick={() => setPicked([])}
              >
                Clear
              </button>
            </>
          ) : (
            <>
              <label className="st-search">
                <FiSearch />
                <input
                  aria-label="Search table"
                  placeholder="Search records"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                    setPicked([]);
                  }}
                />
              </label>
              <div className="st-toolbar-right">
                <details className="st-column-picker">
                  <summary className="st-button">
                    <FiSettings />
                    Columns
                    <FiChevronDown />
                  </summary>
                  <div className="st-popover">
                    {columns.map((column) => (
                      <label key={column.key}>
                        <input
                          type="checkbox"
                          checked={!hidden.includes(column.key)}
                          disabled={
                            !hidden.includes(column.key) &&
                            visibleColumns.length === 1
                          }
                          onChange={(event) =>
                            setHidden(
                              event.target.checked
                                ? hidden.filter((key) => key !== column.key)
                                : [...hidden, column.key],
                            )
                          }
                        />
                        {column.label}
                      </label>
                    ))}
                  </div>
                </details>
                <button
                  className="st-button"
                  disabled={loading || !filtered.length}
                  onClick={() => download()}
                >
                  <FiDownload />
                  Export CSV
                </button>
                {actions}
              </div>
            </>
          )}
        </div>
        {error && (
          <div className="st-error" role="alert">
            {error}{" "}
            <button onClick={() => setRevision((value) => value + 1)}>
              Retry
            </button>
          </div>
        )}
        <div
          className="st-dual-scroll"
          ref={top}
          onScroll={(event) => {
            if (body.current)
              body.current.scrollLeft = event.currentTarget.scrollLeft;
          }}
        >
          <div style={{ height: 1 }} />
        </div>
        <div
          className="st-table-scroll"
          ref={body}
          onScroll={(event) => {
            if (top.current)
              top.current.scrollLeft = event.currentTarget.scrollLeft;
          }}
        >
          <table className="st-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Select visible rows"
                    checked={all}
                    onChange={(event) =>
                      setPicked(event.target.checked ? slice.map(rowKey) : [])
                    }
                  />
                </th>
                {visibleColumns.map((column) => (
                  <th
                    key={column.key}
                    className={column.numeric ? "st-number" : ""}
                    aria-sort={column.sortable === false ? undefined : sort === column.key ? descending ? "descending" : "ascending" : "none"}
                  >
                    {column.sortable === false ? column.label : <button
                      type="button"
                      onClick={() => {
                        if (sort === column.key)
                          setDescending((value) => !value);
                        else {
                          setSort(column.key);
                          setDescending(false);
                        }
                        setPage(1);
                      }}
                    >
                      {column.label}
                      {sort === column.key ? (descending ? " ↓" : " ↑") : ""}
                    </button>}
                  </th>
                ))}
                <th className="st-row-actions-heading"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2}>
                    <div className="st-empty" role="status">
                      Loading records…
                    </div>
                  </td>
                </tr>
              ) : !slice.length ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2}>
                    <div className="st-empty">
                      {error
                        ? "No records loaded."
                        : search
                          ? "No records match your search."
                          : "No records in this scope."}
                    </div>
                  </td>
                </tr>
              ) : (
                slice.map((row, index) => {
                  const key = rowKey(row, index);
                  return (
                    <tr
                      key={key}
                      data-selected={picked.includes(key)}
                      tabIndex={0}
                      aria-label={`Open ${textOf(read(row, columns[0].key))}`}
                      onClick={(event) => {
                        if (
                          !(event.target as HTMLElement).closest(
                            "input,button,a,[role=menu]",
                          )
                        )
                          setDetail(row);
                      }}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          event.target === event.currentTarget
                        ) {
                          event.preventDefault();
                          setDetail(row);
                        }
                      }}
                    >
                      <td>
                        <input
                          type="checkbox"
                          aria-label={`Select ${textOf(read(row, columns[0].key))}`}
                          checked={picked.includes(key)}
                          onChange={(event) =>
                            setPicked(
                              event.target.checked
                                ? [...picked, key]
                                : picked.filter((id) => id !== key),
                            )
                          }
                        />
                      </td>
                      {visibleColumns.map((column) => (
                        <td
                          key={column.key}
                          className={column.numeric ? "st-number" : ""}
                        >
                          {column.render
                            ? column.render(row)
                            : textOf(read(row, column.key))}
                        </td>
                      ))}
                      <td className="st-row-actions-cell"><RowActions label={textOf(read(row,columns[0].key))} items={[
                        { label: "View details", onClick: () => setDetail(row) },
                        ...(onEdit ? [{ label: "Edit", onClick: () => onEdit(row) }] : []),
                        ...(deviceRows && Boolean(row[mapIdKey]) ? [{ label: "View on live map", href: `/app/devices?vehicle=${encodeURIComponent(String(row[mapIdKey]))}` },{ label: "Device actions", href: `/app/devices/${encodeURIComponent(String(row[mapIdKey]))}` }] : []),
                        ...(rowActions?.(row) ?? []),
                        ...(onDelete ? [{ label: "Delete record", destructive: true, onClick: () => onDelete(row) }] : []),
                      ]} /></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <footer className="st-table-footer">
          <span>
            Showing {count ? (safePage - 1) * size + 1 : 0}–
            {Math.min(safePage * size, count)} of {count}
          </span>
          <div className="st-pagination">
            <label>
              Rows{" "}
              <select
                aria-label="Rows per page"
                value={size}
                onChange={(event) => {
                  setSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                {[10, 25, 50, 100].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <button
              aria-label="First page"
              disabled={safePage <= 1}
              onClick={() => setPage(1)}
            >
              <FiChevronsLeft />
            </button>
            <button
              aria-label="Previous page"
              disabled={safePage <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              <FiChevronLeft />
            </button>
            <span>
              {safePage} / {pages}
            </span>
            <button
              aria-label="Next page"
              disabled={safePage >= pages}
              onClick={() => setPage((value) => value + 1)}
            >
              <FiChevronRight />
            </button>
            <button
              aria-label="Last page"
              disabled={safePage >= pages}
              onClick={() => setPage(pages)}
            >
              <FiChevronsRight />
            </button>
          </div>
        </footer>
      </section>
      {detail && (
        <div
          className="st-dialog-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setDetail(null);
          }}
        >
          <section
            className="st-dialog"
            tabIndex={-1}
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-label="Record details"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                setDetail(null);
              }
              if (event.key === "Tab") {
                const controls = [
                    ...event.currentTarget.querySelectorAll<HTMLElement>(
                      "button,a,input,select",
                    ),
                  ],
                  first = controls[0],
                  last = controls[controls.length - 1];
                if (
                  event.shiftKey &&
                  (document.activeElement === first ||
                    document.activeElement === event.currentTarget)
                ) {
                  event.preventDefault();
                  last?.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                  event.preventDefault();
                  first?.focus();
                }
              }
            }}
          >
            <header>
              <h2>{textOf(read(detail, columns[0].key))}</h2>
              <button
                className="st-icon-button"
                aria-label="Close record details"
                onClick={() => setDetail(null)}
              >
                <FiX />
              </button>
            </header>
            <div className="st-dialog-body">
              <dl className="st-detail-fields">
                {(detailColumns ?? columns).map((column) => (
                  <div key={column.key} style={{ display: "contents" }}>
                    <dt>{column.label}</dt>
                    <dd>
                      {column.render
                        ? column.render(detail)
                        : textOf(read(detail, column.key))}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            <footer>
              {onDelete && (
                <details className="st-detail-actions">
                  <summary className="st-button">
                    Actions <FiChevronDown />
                  </summary>
                  <button
                    className="st-button"
                    type="button"
                    onClick={() => {
                      onDelete(detail);
                      setDetail(null);
                    }}
                  >
                    Delete record
                  </button>
                </details>
              )}
              {deviceRows && Boolean(detail[mapIdKey]) && (
                <Link
                  className="st-button"
                  href={`/app/devices/${encodeURIComponent(String(detail[mapIdKey]))}`}
                >
                  Device actions
                </Link>
              )}
              <button className="st-button" onClick={() => setDetail(null)}>
                Close
              </button>
              {onEdit && (
                <button
                  className="st-button st-primary"
                  onClick={() => {
                    onEdit(detail);
                    setDetail(null);
                  }}
                >
                  Edit
                </button>
              )}
              {deviceRows && Boolean(detail[mapIdKey]) && (
                <Link
                  className="st-button st-primary"
                  href={`/app/devices?vehicle=${encodeURIComponent(String(detail[mapIdKey]))}`}
                >
                  View on live map
                </Link>
              )}
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

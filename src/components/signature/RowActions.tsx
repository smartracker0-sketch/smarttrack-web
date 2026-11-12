"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiMoreVertical } from "react-icons/fi";
import { useWorkspace } from "./WorkspaceContext";
import styles from "./RowActions.module.css";
export type RowAction = { label: string; href?: string; onClick?: () => void; destructive?: boolean; disabled?: boolean };
export default function RowActions({ label, items }: { label: string; items: RowAction[] }) {
  const { theme } = useWorkspace();
  const [open, setOpen] = useState(false), [position, setPosition] = useState({ top: 0, left: 0 });
  const trigger = useRef<HTMLButtonElement>(null), menu = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => { const anchor = trigger.current?.getBoundingClientRect(), popup = menu.current; if (!anchor || !popup) return; const height = popup.offsetHeight; setPosition({ left: Math.max(8, Math.min(innerWidth - 232, anchor.right - 224)), top: anchor.bottom + height + 8 <= innerHeight ? anchor.bottom + 4 : Math.max(8, anchor.top - height - 4) }); };
    place(); menu.current?.querySelector<HTMLElement>("button:not(:disabled),a")?.focus();
    window.addEventListener("resize", place); window.addEventListener("scroll", place, true);
    return () => { window.removeEventListener("resize", place); window.removeEventListener("scroll", place, true); };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", outside); return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  function close() { setOpen(false); trigger.current?.focus(); }
  return <><button ref={trigger} type="button" className="st-icon-button" aria-label={`Actions for ${label}`} aria-haspopup="menu" aria-expanded={open} onClick={(event) => { event.stopPropagation(); setOpen((value) => !value); }}><FiMoreVertical /></button>{open && createPortal(<div ref={menu} role="menu" aria-label={`Actions for ${label}`} data-theme={theme} className={styles.menu} style={position} onClick={(event) => event.stopPropagation()} onKeyDown={(event) => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); }
    if (event.key === "Tab") { setOpen(false); return; }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) { event.preventDefault(); const entries = [...event.currentTarget.querySelectorAll<HTMLElement>("[role=menuitem]:not(:disabled)")], index = entries.indexOf(document.activeElement as HTMLElement); entries[event.key === "Home" ? 0 : event.key === "End" ? entries.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + entries.length) % entries.length]?.focus(); }
  }}>{items.map((item) => item.href ? <Link key={item.label} role="menuitem" href={item.href} onClick={close}>{item.label}</Link> : <button key={item.label} type="button" role="menuitem" disabled={item.disabled} data-destructive={item.destructive || undefined} onClick={() => { close(); item.onClick?.(); }}>{item.label}</button>)}</div>, document.body)}</>;
}

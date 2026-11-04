"use client";

import { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { FiCheck, FiChevronDown, FiDownload, FiList, FiMap, FiSearch, FiSliders, FiX } from "react-icons/fi";
import { HiOutlineLightBulb } from "react-icons/hi";

type Props = {
  search: string;
  onSearch: (value: string) => void;
  status: string;
  onStatus: (value: string) => void;
  panelOpen: boolean;
  onPanelOpen: (value: boolean) => void;
  mapStyle: string;
  styles: readonly { id: string; label: string }[];
  onMapStyle: (value: string) => void;
  onGeofences: () => void;
  onDownload: () => void;
  downloadDisabled: boolean;
  onSos: () => void;
};
const subscribe = () => () => {};
const snapshot = () => document.getElementById("live-tracking-toolbar");
const serverSnapshot = () => null;
const statusOptions = [["all", "All vehicles"], ["moving", "Running"], ["idle", "Idling"], ["stopped", "Stopped"], ["offline", "Inactive"]];
const actionClass = "grid h-10 w-10 xl:h-11 xl:w-11 shrink-0 place-items-center rounded-xl bg-white text-[#687f95] transition hover:bg-[#e7f3f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#45aaba]";

export function LiveTrackingToolbarContent(props: Props) {
  const [open, setOpen] = useState<"filters" | "geofences" | "customize" | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const toggle = (menu: typeof open) => setOpen(open === menu ? null : menu);
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-3 xl:gap-x-7 text-[#536987]" onKeyDown={(event) => { if (event.key === "Escape") { setOpen(null); setSearchOpen(false); } }}>
      {open && <button type="button" aria-label="Close tracking options" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(null)} />}
      <div className="mr-auto w-full min-w-[100px] pl-12 leading-tight md:pl-0 xl:w-auto">
        <div className="text-[13px] font-medium text-[#687a8b]">Live Track</div>
        <h1 className="mt-1 text-[19px] font-semibold text-[#101828]">Live</h1>
      </div>
      <div className="flex w-full flex-wrap items-center gap-2.5 xl:w-auto xl:gap-5">
        <div className={`flex h-10 items-center gap-2 rounded-full bg-white px-3.5 xl:px-4 ${searchOpen || props.search ? "w-48" : ""}`}>
          <FiSearch size={20} aria-hidden="true" />
          {searchOpen || props.search ? <>
            <input autoFocus aria-label="Search live vehicles" placeholder="Search vehicles" value={props.search} onChange={(event) => props.onSearch(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            <button type="button" aria-label="Clear vehicle search" onClick={() => { props.onSearch(""); setSearchOpen(false); }}><FiX size={15} /></button>
          </> : <button type="button" onClick={() => setSearchOpen(true)} className="text-sm font-semibold xl:text-[15px]">Search</button>}
        </div>
        <div className="relative z-20">
          <button type="button" aria-expanded={open === "geofences"} aria-controls="tracking-geofences" onClick={() => toggle("geofences")} className="flex h-10 items-center gap-3 rounded-full bg-white px-4 text-sm font-semibold xl:px-5 xl:text-[15px] hover:bg-[#e7f3f5]">Geofences : All <FiChevronDown size={17} /></button>
          {open === "geofences" && <div id="tracking-geofences" className="absolute left-0 top-full mt-2 w-52 rounded-xl border border-[#e0e8ee] bg-white p-2 text-sm shadow-lg">
            <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-[#f1f7fa]" onClick={() => { props.onGeofences(); setOpen(null); }}><FiCheck /> All geofences</button>
            <Link href="/app/geofences" className="block rounded-lg px-3 py-2 hover:bg-[#f1f7fa]">Manage geofences</Link>
          </div>}
        </div>
        <div className="relative z-20">
          <button type="button" title="Filter vehicles" aria-label="Filter vehicles" aria-expanded={open === "filters"} aria-controls="tracking-filters" onClick={() => toggle("filters")} className={`${actionClass} ${props.status !== "all" ? "ring-2 ring-[#4fb0be]" : ""}`}><FiSliders size={21} /></button>
          {open === "filters" && <div id="tracking-filters" className="absolute right-0 top-full sm:left-0 sm:right-auto mt-2 w-48 rounded-xl border border-[#e0e8ee] bg-white p-3 text-sm shadow-lg">
            <label htmlFor="tracking-status" className="mb-2 block font-semibold">Vehicle status</label>
            <select id="tracking-status" value={props.status} onChange={(event) => props.onStatus(event.target.value)} className="h-10 w-full rounded-lg border border-[#d5e2ec] bg-white px-2">{statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
          </div>}
        </div>
        <button type="button" title="Download visible vehicles" aria-label="Download visible vehicles" disabled={props.downloadDisabled} onClick={props.onDownload} className={`${actionClass} disabled:cursor-not-allowed disabled:opacity-40`}><FiDownload size={22} /></button>
        <div className="flex h-10 items-center rounded-xl xl:h-11 bg-white p-1" role="group" aria-label="Tracking view">
          <button type="button" title="Map view" aria-label="Map view" aria-pressed={!props.panelOpen} onClick={() => props.onPanelOpen(false)} className={`grid h-8 w-8 place-items-center rounded-lg xl:h-9 xl:w-9 ${!props.panelOpen ? "bg-[#edf8fa] text-[#46afbd]" : "text-[#8499aa]"}`}><FiMap size={19} /></button>
          <button type="button" title="Map and vehicle list" aria-label="Map and vehicle list" aria-pressed={props.panelOpen} onClick={() => props.onPanelOpen(true)} className={`grid h-8 w-8 place-items-center rounded-lg xl:h-9 xl:w-9 ${props.panelOpen ? "bg-[#edf8fa] text-[#46afbd]" : "text-[#8499aa]"}`}><FiList size={19} /></button>
        </div>
        <div className="relative z-20">
          <button type="button" aria-expanded={open === "customize"} aria-controls="tracking-customize" aria-label="Customize" title="Customize" onClick={() => toggle("customize")} className="flex h-10 items-center gap-2 rounded-full bg-white px-3 text-sm font-semibold text-[#48aab7] hover:bg-[#e7f3f5] sm:px-4"><FiList size={18} /><span className="hidden sm:inline">Customize</span></button>
          {open === "customize" && <div id="tracking-customize" className="absolute left-0 top-full sm:left-auto sm:right-0 mt-2 w-56 rounded-xl border border-[#e0e8ee] bg-white p-4 text-sm shadow-lg">
            <label htmlFor="tracking-map-style" className="mb-2 block font-semibold">Map style</label>
            <select id="tracking-map-style" value={props.mapStyle} onChange={(event) => props.onMapStyle(event.target.value)} className="h-10 w-full rounded-lg border border-[#d5e2ec] bg-white px-2">{props.styles.map((style) => <option key={style.id} value={style.id}>{style.label}</option>)}</select>
            <label className="mt-4 flex items-center gap-2"><input type="checkbox" checked={props.panelOpen} onChange={(event) => props.onPanelOpen(event.target.checked)} className="accent-[#48aab7]" /> Show vehicle list</label>
          </div>}
        </div>
      <div className="contents xl:ml-3 xl:flex xl:h-11 xl:items-center xl:gap-6 xl:border-l xl:border-[#c7d3df] xl:pl-7">
        <button type="button" title="View SOS and panic alerts" onClick={props.onSos} className="h-8 rounded-full border border-[#ed6e72] bg-[#fff0f1] px-4 text-[11px] font-bold text-[#dc454b] hover:bg-[#ffe1e4]">SOS</button>
        <Link href="/app/support" title="Help and support" aria-label="Help and support" className="absolute right-[124px] top-4 grid h-10 w-8 place-items-center text-[#399aaa] xl:static"><HiOutlineLightBulb size={25} /></Link>
      </div>
      </div>
    </div>
  );
}

export default function LiveTrackingToolbar(props: Props) {
  const host = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return host ? createPortal(<LiveTrackingToolbarContent {...props} />, host) : null;
}

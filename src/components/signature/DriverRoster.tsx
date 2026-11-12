"use client";
import Link from "next/link";
import PageHeader from "./PageHeader";
import DataTable, { type Column } from "./DataTable";
import { pageById } from "./navigation";
import { useWorkspace } from "./WorkspaceContext";
import { canReadModule } from "./access";
const columns: Column[] = [{ key: "displayName", label: "Driver" }, { key: "email", label: "Email" }, { key: "organisationName", label: "Account" }, { key: "scoreTotal", label: "Score", numeric: true, render: (row) => row.scoreTotal == null ? "—" : Number(row.scoreTotal).toLocaleString(undefined,{maximumFractionDigits:0}) }, { key: "scoreBand", label: "Band" }, { key: "totalTripsScored", label: "Scored trips", numeric: true }, { key: "lastScoredAt", label: "Last scored", render: (row) => row.lastScoredAt ? new Date(String(row.lastScoredAt)).toLocaleString() : "—" }];
export default function DriverRoster() { const { account } = useWorkspace(); return <><PageHeader page={pageById("drivers")!} actions={canReadModule(account,"video")?<Link className="st-button st-primary" href="/app/drivers/performance">View driver scores</Link>:undefined}/><DataTable id="driver-roster" endpoint="/api/fleet-ledger/drivers" columns={columns} scoped rowActions={(row) => typeof row.email === "string" ? [{label:"Email driver",href:`mailto:${encodeURIComponent(row.email)}`}] : []}/></>; }

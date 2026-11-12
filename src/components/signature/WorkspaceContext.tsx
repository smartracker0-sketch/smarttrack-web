"use client";
import { createContext, useContext } from "react";
export type WorkspaceAccount = {
  id: string;
  displayName: string;
  email: string;
  roles: string[];
  moduleAccess?: Record<string, string>;
};
export type Tenant = { id: string; name: string };
export type WorkspaceState = {
  account: WorkspaceAccount;
  admin: boolean;
  tenants: Tenant[];
  scope: string[] | null;
  setScope: (ids: string[] | null) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  sidebarColour: "blue" | "white";
  setSidebarColour: (colour: "blue" | "white") => void;
};
export const WorkspaceContext = createContext<WorkspaceState | null>(null);
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context)
    throw Error("Workspace components require a workspace provider");
  return context;
}

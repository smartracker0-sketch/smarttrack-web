import type { Metadata } from "next";
import WorkspaceShell from "@/components/signature/WorkspaceShell";
export const metadata: Metadata = { title: "Smart Tracker" };
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <WorkspaceShell>{children}</WorkspaceShell>;
}

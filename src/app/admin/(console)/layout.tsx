import type { Metadata } from "next";
import WorkspaceShell from "@/components/signature/WorkspaceShell";
export const metadata: Metadata = { title: "Smart Tracker" };
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceShell mode="admin">{children}</WorkspaceShell>;
}

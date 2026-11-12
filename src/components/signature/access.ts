import type { WorkspaceAccount } from "./WorkspaceContext";
import type { PageDefinition } from "./navigation";
export function pageModule(page: PageDefinition) {
  if (page.admin || ["dashboard", "support"].includes(page.id)) return null;
  if (page.hub) return page.hub;
  if (page.id === "live") return "control";
  if (
    page.id === "history" ||
    page.href.startsWith("/app/history") ||
    page.href.startsWith("/app/trips")
  )
    return "history";
  if (
    page.href.startsWith("/app/settings") ||
    page.href.startsWith("/app/branding")
  )
    return "settings";
  if (page.href.includes("/drivers/performance")) return "video";
  if (
    ["documents", "expenses", "vendors", "consigners", "tyres", "elock"].some(
      (name) => page.href.startsWith(`/app/${name}`),
    )
  )
    return "maintenance";
  return "control";
}
export function canReadModule(
  account: WorkspaceAccount | null,
  module: string,
) {
  return (
    account?.roles.includes("SUPER_ADMIN") ||
    !account?.moduleAccess ||
    ["READ", "WRITE"].includes(account.moduleAccess[module])
  );
}
export function canOpenPage(
  account: WorkspaceAccount | null,
  page: PageDefinition,
) {
  if (page.admin) return Boolean(account?.roles.includes("SUPER_ADMIN"));
  const area = pageModule(page);
  return area === null || canReadModule(account, area);
}

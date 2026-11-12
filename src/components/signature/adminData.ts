import { rowsFrom, type DataRow } from "./data";
export async function allAdminRows(path: string, signal: AbortSignal) {
  const rows: DataRow[] = [];
  let page = 0,
    total = 1;
  while (page < total) {
    const response = await fetch(`${path}?size=100&page=${page}`, {
      signal,
      cache: "no-store",
    });
    const body = await response.json();
    if (!response.ok)
      throw Error(body?.message ?? "Choices could not be loaded.");
    rows.push(...rowsFrom(body));
    total = Number(body.totalPages) || 1;
    page++;
  }
  return rows;
}

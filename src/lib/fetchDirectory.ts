import { redirectIfUnauthorized } from "./clientSession";

/** Load every server page, preserving a stable order and aborting with the caller. */
export async function fetchDirectory<T>(endpoint: string, signal?: AbortSignal): Promise<T[]> {
  const url = new URL(endpoint, window.location.origin);
  url.searchParams.set("size", "200");
  url.searchParams.set("sort", "id,asc");
  const rows: T[] = [];
  let page = 0, totalPages = 1;
  do {
    url.searchParams.set("page", String(page));
    const response = await fetch(url.pathname + url.search, { cache: "no-store", signal });
    if (await redirectIfUnauthorized(response)) throw Error("Your session expired.");
    if (!response.ok) throw Error("The vehicle directory could not be loaded.");
    const body = await response.json();
    const content = Array.isArray(body) ? body : body?.content;
    if (!Array.isArray(content)) throw Error("The vehicle directory response is incomplete.");
    rows.push(...content);
    totalPages = Number.isSafeInteger(body?.totalPages) && body.totalPages > 0 ? body.totalPages : 1;
    page++;
  } while (page < totalPages);
  return rows;
}

export async function realtimeTicket(admin = false): Promise<string> {
  const response = await fetch(`/api/realtime-ticket${admin ? "?admin=true" : ""}`, { method: "POST", cache: "no-store" });
  if (!response.ok) throw Error("Realtime connection is unavailable");
  const body = await response.json();
  if (typeof body.ticket !== "string") throw Error("Realtime authentication is unavailable");
  return body.ticket;
}

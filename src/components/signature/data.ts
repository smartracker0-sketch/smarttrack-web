export type DataRow = Record<string, unknown>;
export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ]!,
  );
}
export function rowsFrom(value: unknown): DataRow[] {
  if (Array.isArray(value))
    return value.filter((row) => row && typeof row === "object");
  if (value && typeof value === "object") {
    const data = value as DataRow;
    for (const key of ["content", "data", "items", "devices", "results"])
      if (Array.isArray(data[key])) return rowsFrom(data[key]);
  }
  return [];
}
export function textOf(value: unknown, fallback = "—"): string {
  return value == null || value === ""
    ? fallback
    : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);
}
export function numeric(value: unknown): number | null {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
export function read(row: DataRow, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = key
      .split(".")
      .reduce<unknown>(
        (current, part) =>
          current && typeof current === "object"
            ? (current as DataRow)[part]
            : undefined,
        row,
      );
    if (value != null && value !== "") return value;
  }
  return undefined;
}
export function vehicleName(row: DataRow): string {
  return textOf(
    read(
      row,
      "vehiclePlate",
      "plateNumber",
      "plate",
      "registrationNumber",
      "licensePlate",
      "name",
      "imei",
    ),
  );
}
export function telemetryOf(row: DataRow): DataRow {
  const latest = read(row, "latestTelemetry", "telemetry");
  return latest && typeof latest === "object" ? (latest as DataRow) : row;
}
export function motionOf(
  row: DataRow,
  now = Date.now(),
): "moving" | "idle" | "stopped" | "inactive" {
  const t = telemetryOf(row),
    seen = read(t, "receivedAt", "eventTime", "timestamp");
  if (
    !seen ||
    !Number.isFinite(Date.parse(String(seen))) ||
    now - Date.parse(String(seen)) >= 15 * 60000
  )
    return "inactive";
  if ((numeric(read(t, "speedKph", "speedKmh", "speed")) ?? 0) > 5)
    return "moving";
  return read(t, "ignition", "ignitionOn") == true ? "idle" : "stopped";
}
export function csvDownload(
  name: string,
  headers: string[],
  rows: unknown[][],
) {
  const cell = (value: unknown) => {
    const text = textOf(value, "");
    return (
      '"' +
      (/^[=+@\-\t\r]/.test(text) ? "'" : "") +
      text.replaceAll('"', '""') +
      '"'
    );
  };
  const blob = new Blob(
    [
      "\uFEFF" +
        [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n"),
    ],
    { type: "text/csv;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

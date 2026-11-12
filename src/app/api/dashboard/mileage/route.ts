import { NextResponse } from "next/server";
import { proxyUser } from "@/lib/userBackend";
export async function GET(request: Request) {
  const input = new URL(request.url).searchParams,
    from = input.get("from"),
    to = input.get("to");
  if (
    !from ||
    !to ||
    !Number.isFinite(Date.parse(from)) ||
    !Number.isFinite(Date.parse(to))
  )
    return NextResponse.json(
      { message: "A valid date range is required" },
      { status: 400 },
    );
  const query = new URLSearchParams({ from, to });
  for (const id of input.getAll("organisationId"))
    query.append("organisationId", id);
  return proxyUser(`/api/v1/dashboard/mileage?${query}`);
}

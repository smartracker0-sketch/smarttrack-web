"use client";
import { useCallback, useEffect, useState } from "react";
import { redirectIfUnauthorized } from "@/lib/clientSession";
import { rowsFrom, type DataRow } from "./data";
import { useWorkspace } from "./WorkspaceContext";
import { canReadModule } from "./access";
import { fetchDirectory } from "@/lib/fetchDirectory";
export function useFleetData() {
  const { account, scope } = useWorkspace();
  const control = canReadModule(account, "control"),
    video = canReadModule(account, "video");
  const [data, setData] = useState<{
      objects: DataRow[];
      devices: DataRow[];
      alerts: DataRow[];
      drivers: DataRow[];
      cameras: DataRow[];
      insights: DataRow | null;
    }>({
      objects: [],
      devices: [],
      alerts: [],
      drivers: [],
      cameras: [],
      insights: null,
    }),
    [loading, setLoading] = useState(true),
    [errors, setErrors] = useState<string[]>([]),
    [loadedAt, setLoadedAt] = useState(0);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      const endpoints = [
        ["objects", "/api/live-tracking?tab=objects", control],
        ["devices", "/api/devices?size=500", control],
        [
          "alerts",
          "/api/telemetry?type=alerts&unacknowledgedOnly=false",
          control,
        ],
        ["drivers", "/api/drivers", control],
        ["cameras", "/api/dashcams", video],
        ["insights", "/api/assistant/insights?limit=30", control],
      ] as const;
      const responses = await Promise.allSettled(
        endpoints
          .filter(([, , allowed]) => allowed)
          .map(async ([key, url]) => {
            if (key === "devices" || key === "drivers") return { key, value: await fetchDirectory<DataRow>(url, signal) };
            if (key === "insights" && scope?.length === 0) return { key, value: null };
            const scopedUrl=key === "insights" && scope !== null ? url+scope.map((id)=>`&organisationId=${encodeURIComponent(id)}`).join("") : url;
            const response = await fetch(scopedUrl, { signal, cache: "no-store" });
            if (await redirectIfUnauthorized(response))
              throw Error("Your session expired.");
            if (!response.ok)
              throw Error(`${key[0].toUpperCase() + key.slice(1)} unavailable`);
            return { key, value: await response.json() };
          }),
      );
      if (signal?.aborted) return;
      const next = {
        objects: [],
        devices: [],
        alerts: [],
        drivers: [],
        cameras: [],
        insights: null,
      } as typeof data;
      const failures: string[] = [];
      responses.forEach((result) => {
        if (result.status === "fulfilled") {
          const { key, value } = result.value;
          if (key === "insights") next.insights = value;
          else next[key] = rowsFrom(value);
        } else if (result.reason?.name !== "AbortError")
          failures.push(result.reason?.message ?? "Fleet data unavailable");
      });
      setData(next);
      setErrors(failures);
      setLoadedAt(Date.now());
      setLoading(false);
    },
    [control, video, scope],
  );
  useEffect(() => {
    const controller = new AbortController();
    const initial = setTimeout(() => void load(controller.signal), 0);
    const timer = setInterval(() => void load(controller.signal), 30000);
    return () => {
      controller.abort();
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [load]);
  return { ...data, loading, errors, loadedAt, refresh: () => void load() };
}

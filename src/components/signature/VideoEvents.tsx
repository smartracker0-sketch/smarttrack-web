"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiFilm, FiDownload } from "react-icons/fi";
import PageHeader from "./PageHeader";
import { pageById } from "./navigation";
import { rowsFrom, textOf, csvDownload, type DataRow } from "./data";
function mediaUrl(value: unknown) {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
function eventDate(value: unknown) {
  const date = new Date(String(value));
  return Number.isFinite(date.getTime())
    ? date.toLocaleString()
    : "Time unavailable";
}
export default function VideoEvents({
  priority = false,
}: {
  priority?: boolean;
}) {
  const [cameras, setCameras] = useState<DataRow[]>([]),
    [cameraId, setCameraId] = useState(""),
    [events, setEvents] = useState<DataRow[]>([]),
    [selected, setSelected] = useState<string | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [page, setPage] = useState(0),
    [pages, setPages] = useState(1),
    [revision, setRevision] = useState(0),
    [cameraError, setCameraError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/dashcams", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw Error("Cameras could not be loaded.");
        return rowsFrom(await response.json());
      })
      .then((rows) => {
        setCameras(rows);
        setCameraId((current) =>
          rows.some((row) => row.id === current)
            ? current
            : String(rows[0]?.id ?? ""),
        );
        setCameraError("");
        if (!rows.length) setLoading(false);
      })
      .catch((cause) => {
        if (cause.name !== "AbortError") {
          setCameraError(cause.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [revision]);
  useEffect(() => {
    if (!cameraId) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
      fetch(
        `/api/dashcams/${encodeURIComponent(cameraId)}/events?size=24&page=${page}`,
        { signal: controller.signal, cache: "no-store" },
      )
        .then(async (response) => {
          if (!response.ok) throw Error("Camera events could not be loaded.");
          return response.json();
        })
        .then((data) => {
          setEvents(rowsFrom(data));
          setPages(Math.max(1, Number(data.totalPages) || 1));
          setSelected(null);
        })
        .catch((cause) => {
          if (cause.name !== "AbortError") {
            setError(cause.message);
            setEvents([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [cameraId, page, revision]);
  const filtered = events.filter(
    (event) =>
      (!priority ||
        ["HIGH", "CRITICAL"].includes(String(event.severity).toUpperCase())) &&
      [event.eventType, event.severity]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const active = filtered.find((event) => event.id === selected) ?? filtered[0];
  const clip = mediaUrl(active?.clipUrl);
  const camera = cameras.find((row) => row.id === cameraId);
  return (
    <>
      <PageHeader
        page={pageById(priority ? "incidents" : "video-events")!}
        tenant={false}
        onRefresh={() => setRevision((value) => value + 1)}
        actions={
          <button
            className="st-button"
            disabled={!filtered.length}
            onClick={() =>
              csvDownload(
                "camera-events.csv",
                ["Event", "Severity", "Time", "Clip"],
                filtered.map((event) => [
                  event.eventType,
                  event.severity,
                  event.eventTime,
                  event.clipUrl,
                ]),
              )
            }
          >
            <FiDownload />
            Export events
          </button>
        }
      />
      <div className="st-card">
        <div className="st-table-tools">
          <label className="st-field">
            <span className="sr-only">Camera</span>
            <select
              className="st-input"
              aria-label="Camera"
              value={cameraId}
              onChange={(event) => {
                setCameraId(event.target.value);
                setPage(0);
              }}
            >
              <option value="" disabled>
                Select a camera
              </option>
              {cameras.map((row) => (
                <option key={String(row.id)} value={String(row.id)}>
                  {textOf(row.vehiclePlate ?? row.name)}
                </option>
              ))}
            </select>
          </label>
          <input
            className="st-input"
            aria-label="Search events on this page"
            placeholder="Search this page"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {cameraError || error ? (
          <div className="st-error" role="alert">
            {cameraError || error}
            <button
              className="st-link"
              onClick={() => setRevision((value) => value + 1)}
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="st-empty" role="status">
            Loading camera events…
          </div>
        ) : !filtered.length ? (
          <div className="st-empty">
            <FiFilm size={32} />
            <h2>
              No {priority ? "priority incidents" : "events"} on this page
            </h2>
            <p>
              {cameras.length
                ? "Choose another camera or event page."
                : "Assign a camera to review recorded events."}
            </p>
          </div>
        ) : (
          <div className="st-media-workspace">
            <section className="st-media-review" aria-label="Event review">
              <div className="st-media-player">
                {clip ? (
                  <video
                    key={String(active.id)}
                    src={clip}
                    poster={mediaUrl(active.thumbnailUrl)}
                    controls
                    preload="metadata"
                    aria-label="Event clip"
                  />
                ) : (
                  <div>
                    <FiFilm size={40} />
                    <p>Clip pending</p>
                    <small>
                      The event has been received. Its recording is not
                      available yet.
                    </small>
                  </div>
                )}
              </div>
              <div className="st-card-body">
                <h2>{textOf(active.eventType).replaceAll("_", " ")}</h2>
                <p className="st-muted">
                  {eventDate(active.eventTime)} · {textOf(active.severity)}
                </p>
                <p className="st-muted">
                  {textOf(camera?.vehiclePlate ?? camera?.name)}
                </p>
                <div className="st-media-links">
                  <Link
                    className="st-button st-small"
                    href={`/app/cctv?deviceId=${encodeURIComponent(cameraId)}`}
                  >
                    Live video
                  </Link>
                  {camera?.assignedVehicleId ? (
                    <Link
                      className="st-button st-small"
                      href={`/app/devices?vehicle=${encodeURIComponent(String(camera.assignedVehicleId))}`}
                    >
                      View on map
                    </Link>
                  ) : null}
                </div>
              </div>
            </section>
            <section className="st-media-events" aria-label="Camera events">
              {filtered.map((event) => (
                <button
                  key={String(event.id)}
                  className={`st-media-event${event.id === active.id ? " is-selected" : ""}`}
                  onClick={() => setSelected(String(event.id))}
                >
                  <span className="st-media-thumbnail">
                    {mediaUrl(event.thumbnailUrl) ? (
                      <video
                        preload="none"
                        poster={mediaUrl(event.thumbnailUrl)}
                        aria-hidden="true"
                      />
                    ) : (
                      <FiFilm size={24} />
                    )}
                  </span>
                  <span>
                    <strong>
                      {textOf(event.eventType).replaceAll("_", " ")}
                    </strong>
                    <small>{eventDate(event.eventTime)}</small>
                    <small>
                      {textOf(event.severity)} ·{" "}
                      {mediaUrl(event.clipUrl) ? "Clip ready" : "Clip pending"}
                    </small>
                  </span>
                </button>
              ))}
            </section>
          </div>
        )}
        <div className="st-table-footer">
          <span>
            Page {page + 1} of {pages}
          </span>
          <div className="st-pagination">
            <button
              className="st-button st-small"
              disabled={!page || loading}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </button>
            <button
              className="st-button st-small"
              disabled={page + 1 >= pages || loading}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

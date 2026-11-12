"use client";
import { useRef, useState, type FormEvent } from "react";
import {
  FiCalendar,
  FiChevronDown,
  FiDownload,
  FiSearch,
} from "react-icons/fi";
type Device = {
  id: string;
  name?: string;
  vehiclePlate?: string;
  imei?: string;
};
type Props = {
  devices: Device[];
  deviceId: string;
  onDevice: (id: string) => void;
  period: string;
  onPeriod: (period: string) => void;
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
  movement: string;
  onMovement: (value: string) => void;
  loading: boolean;
  hasResults: boolean;
  onSearch: () => void;
  onExport: () => void;
  onClear: () => void;
};
function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date)
    : "Choose date";
}
export default function HistorySearch(props: Props) {
  const [advanced, setAdvanced] = useState(false),
    [query, setQuery] = useState("");
  const dateRange = useRef<HTMLDetailsElement>(null);
  const range = `${dateLabel(props.from)} – ${dateLabel(props.to)}`;
  const devices = props.devices.filter((device) =>
    [device.name, device.vehiclePlate, device.imei]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !props.loading &&
      props.deviceId &&
      props.from &&
      props.to &&
      props.from < props.to
    )
      props.onSearch();
  }
  return (
    <form
      className="st-history-search"
      aria-label="History filters"
      onSubmit={submit}
    >
      <label className="st-field">
        <span>Vehicle</span>
        <select
          className="st-input"
          aria-label="History vehicle"
          value={props.deviceId}
          onChange={(event) => props.onDevice(event.target.value)}
          required
        >
          <option value="" disabled>
            Select a vehicle
          </option>
          {props.devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.vehiclePlate || device.name || device.imei}
            </option>
          ))}
        </select>
      </label>
      <div className="st-field">
        <span>Date range</span>
        <details
          className="st-history-date"
          ref={dateRange}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.stopPropagation();
              event.currentTarget.open = false;
              event.currentTarget
                .querySelector<HTMLElement>("summary")
                ?.focus();
            }
          }}
        >
          <summary className="st-input" title={range}>
            <FiCalendar />
            <span>{range}</span>
            <FiChevronDown />
          </summary>
          <div className="st-history-date-fields">
            <label className="st-field">
              <span>Period</span>
              <select
                className="st-input"
                value={props.period}
                onChange={(event) => props.onPeriod(event.target.value)}
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="six-hours">Last 6 hours</option>
                <option value="custom">Custom</option>
              </select>
            </label>
            <label className="st-field">
              <span>From</span>
              <input
                className="st-input"
                type="datetime-local"
                aria-label="History from"
                value={props.from}
                max={props.to}
                onChange={(event) => props.onFrom(event.target.value)}
              />
            </label>
            <label className="st-field">
              <span>To</span>
              <input
                className="st-input"
                type="datetime-local"
                aria-label="History to"
                value={props.to}
                min={props.from}
                onChange={(event) => props.onTo(event.target.value)}
              />
            </label>
            {props.from && props.to && props.from >= props.to && (
              <p className="st-error" role="alert">
                The end must be after the start.
              </p>
            )}
            <button
              className="st-button st-small"
              type="button"
              onClick={() => {
                if (dateRange.current) dateRange.current.open = false;
              }}
            >
              Done
            </button>
          </div>
        </details>
      </div>
      <button
        className="st-history-advanced-toggle"
        type="button"
        aria-expanded={advanced}
        onClick={() => setAdvanced((value) => !value)}
      >
        Advanced
        <FiChevronDown className={advanced ? "is-open" : ""} />
      </button>
      {advanced && (
        <div className="st-history-advanced">
          <label className="st-field">
            <span>Movement</span>
            <select
              className="st-input"
              value={props.movement}
              onChange={(event) => props.onMovement(event.target.value)}
            >
              <option value="all">All movement</option>
              <option value="stops">Stops only</option>
            </select>
          </label>
          <label className="st-field">
            <span>Find a vehicle</span>
            <span className="st-search">
              <FiSearch />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Plate, name or IMEI"
                aria-label="Find history vehicle"
              />
            </span>
          </label>
          {query && (
            <div className="st-history-vehicle-results">
              {devices.length ? (
                devices.slice(0, 20).map((device) => (
                  <button
                    type="button"
                    key={device.id}
                    onClick={() => {
                      props.onDevice(device.id);
                      setQuery("");
                    }}
                  >
                    {device.vehiclePlate || device.name || device.imei}
                    <small>{device.imei}</small>
                  </button>
                ))
              ) : (
                <p>No matching vehicles.</p>
              )}
            </div>
          )}
        </div>
      )}
      <div className="st-history-search-actions">
        <button
          className="st-button st-primary"
          type="submit"
          disabled={
            props.loading ||
            !props.deviceId ||
            !props.from ||
            !props.to ||
            props.from >= props.to
          }
        >
          {props.loading ? "Loading…" : "Show history"}
        </button>
        <button
          className="st-button"
          type="button"
          aria-label="Export history"
          title="Export history"
          disabled={!props.hasResults}
          onClick={props.onExport}
        >
          <FiDownload />
        </button>
      </div>
      {props.hasResults && (
        <button
          className="st-link st-history-clear"
          type="button"
          onClick={props.onClear}
        >
          Clear route
        </button>
      )}
    </form>
  );
}

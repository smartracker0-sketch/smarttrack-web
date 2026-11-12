"use client";
import { realtimeTicket } from "@/lib/realtimeTicket";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { FiBell } from "react-icons/fi";
import { redirectIfUnauthorized } from "@/lib/clientSession";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AlertRow = Record<string, any>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SettingRow = Record<string, any>;

const TYPE_TO_SETTING: Record<string, string> = {
  IGNITION_ANOMALY: "ignition",
  IGNITION_ON: "ignition",
  IGNITION_OFF: "ignition",
  VIBRATION_SHOCK: "vibrationShock",
  SHOCK: "vibrationShock",
  PANIC: "sos",
  DOOR_OPEN: "doorIntrusion",
  INTRUSION: "doorIntrusion",
  CRASH: "crash",
  COLLISION: "crash",
  IMPACT: "crash",
  DEVICE_BATTERY_LIMIT: "vehicleBatteryLimit",
  LOW_EXTERNAL_BATTERY: "vehicleBatteryLimit",
  LOW_INTERNAL_BATTERY: "deviceLowBattery",
  GPS_SIGNAL_LOSS: "gpsSignalLoss",
  ANTENNA_CUT: "antennaTamper",
  POWER_CUT: "powerCut",
  EXTERNAL_POWER_DISCONNECTED: "deviceRemoval",
  DEVICE_REMOVAL: "deviceRemoval",
  DEVICE_DISASSEMBLE: "deviceDisassemble",
  TAMPER: "deviceDisassemble",
  GEOFENCE_ENTER: "geofence",
  GEOFENCE_EXIT: "geofence",
  LOW_BATTERY: "deviceLowBattery",
  DEVICE_LOW_BATTERY: "deviceLowBattery",
  UNEXPECTED_MOVEMENT: "unexpectedMovement",
  OVERSPEED: "overspeed",
  LOW_FUEL: "fuelTheft",
  FUEL_DRAINAGE: "fuelTheft",
  FUEL_THEFT: "fuelTheft",
  SERVICE_DUE: "serviceDue",
  TEMPERATURE_ALERT: "temperature",
  WEIGHT_LOAD_CHANGE: "weightLoad",
  POWER_OFF: "powerOff",
  POWER_ON: "powerOn",
  REFUELLING: "refuelling",
  RFID_TAP: "rfidTap",
  ROUTE_DEVIATION: "routeDeviation",
  SHARP_TURN: "cornering",
  SHUTDOWN: "shutdown",
  SOS: "sos",
  STOPPAGE: "stoppage",
  STOPPAGE_IN_GEOFENCE: "stoppageGeofence",
  HARSH_ACCEL: "acceleration",
  SUDDEN_ACCELERATION: "acceleration",
  HARSH_BRAKE: "braking",
  SUDDEN_BRAKING: "braking",
  HARSH_CORNERING: "cornering",
  TRIP: "trip",
  TRIP_DELAY: "tripDelay",
  TRIP_UPDATE: "tripUpdates",
  VEHICLE_ARRIVAL: "arrival",
  DTC_FAULT: "dtc",
  VEHICLE_DTC_FAULT: "dtc",
  IDLE_EXCEEDED: "idling",
  VEHICLE_IDLING: "idling",
  VEHICLE_BATTERY_LIMIT: "vehicleBatteryLimit",
};

function alertId(alert: AlertRow) {
  return String(
    alert.id ??
      `${alert.alertType ?? alert.type}-${alert.alertTime ?? alert.receivedAt ?? ""}`,
  );
}

function alertSettingKey(alert: AlertRow) {
  return (
    TYPE_TO_SETTING[
      String(alert.alertType ?? alert.type ?? "")
        .trim()
        .toUpperCase()
    ] ?? ""
  );
}

function shouldNotify(alert: AlertRow, settings: Map<string, SettingRow>) {
  const key = alertSettingKey(alert);
  const setting = key ? settings.get(key) : null;
  if (!setting) return true;
  if (setting.webNotifications === false && setting.sound !== true)
    return false;
  const vehicleIds = Array.isArray(setting.vehicleIds)
    ? setting.vehicleIds.map(String)
    : [];
  return (
    vehicleIds.length === 0 || vehicleIds.includes(String(alert.deviceId ?? ""))
  );
}

function playAlertSound() {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return;
  const ctx = new AudioContextClass();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, ctx.currentTime);
  oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.12);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.34);
}

function alertSocketUrl() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const wsBase = apiBase
    ? apiBase.replace(/^http/, "ws")
    : `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.host}`;
  return `${wsBase}/ws/websocket`;
}

function parseStompMessages(frame: string) {
  return frame
    .split("\0")
    .map((part) => part.trim())
    .filter((part) => part.startsWith("MESSAGE"))
    .map((part) => {
      const bodyStart = part.indexOf("\n\n");
      if (bodyStart < 0) return null;
      try {
        return JSON.parse(part.slice(bodyStart + 2)) as AlertRow;
      } catch {
        return null;
      }
    })
    .filter((alert): alert is AlertRow => Boolean(alert));
}

export default function AlertWatcher({
  tracking = false,
}: {
  tracking?: boolean;
}) {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [settings, setSettings] = useState<Map<string, SettingRow>>(new Map());
  const [authenticated, setAuthenticated] = useState(true);
  const seenRef = useRef<Set<string>>(new Set());
  const settingsRef = useRef(settings);
  const readyRef = useRef(false);
  const audioUnlockedRef = useRef(false);
  const authBlockedRef = useRef(false);
  const menuRef = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (
        menuRef.current?.open &&
        !menuRef.current.contains(event.target as Node)
      )
        menuRef.current.open = false;
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    function unlockAudio() {
      audioUnlockedRef.current = true;
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    }
    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  const notifyAlert = useCallback((alert: AlertRow) => {
    const activeSettings = settingsRef.current;
    if (!shouldNotify(alert, activeSettings)) return;

    const key = alertSettingKey(alert);
    const setting = key ? activeSettings.get(key) : null;
    const webEnabled = setting?.webNotifications !== false;
    const soundEnabled = setting?.sound === true;

    if (webEnabled && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(String(alert.alertType ?? "Fleet alert"), {
          body: String(alert.message ?? "A new fleet alert was triggered."),
        });
      } else if (Notification.permission === "default") {
        void Notification.requestPermission();
      }
    }
    if (soundEnabled && audioUnlockedRef.current) playAlertSound();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      if (authBlockedRef.current) return;
      const res = await fetch("/api/telemetry/alert-settings", {
        cache: "no-store",
      }).catch(() => null);
      if (res?.status === 401) {
        authBlockedRef.current = true;
        setAuthenticated(false);
        await redirectIfUnauthorized(res);
        return;
      }
      if (!res?.ok || cancelled) return;
      const data = await res.json().catch(() => []);
      const next = new Map<string, SettingRow>();
      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (item?.alertKey) next.set(String(item.alertKey), item);
        });
      }
      setSettings(next);
    }

    void loadSettings();
    const id = window.setInterval(loadSettings, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadAlerts() {
      if (authBlockedRef.current) return;
      const res = await fetch(
        "/api/telemetry?type=alerts&unacknowledgedOnly=false",
        { cache: "no-store" },
      ).catch(() => null);
      if (res?.status === 401) {
        authBlockedRef.current = true;
        setAuthenticated(false);
        await redirectIfUnauthorized(res);
        return;
      }
      if (!res?.ok || cancelled) return;
      const data = await res.json().catch(() => []);
      const list: AlertRow[] = Array.isArray(data)
        ? data
        : (data?.content ?? []);
      setAlerts(list);

      const currentIds = new Set(list.map(alertId));
      if (!readyRef.current) {
        seenRef.current = currentIds;
        readyRef.current = true;
        return;
      }

      const fresh = list.filter(
        (alert) => !seenRef.current.has(alertId(alert)),
      );
      seenRef.current = currentIds;
      fresh.slice(0, 3).forEach(notifyAlert);
    }

    void loadAlerts();
    const id = window.setInterval(loadAlerts, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [notifyAlert]);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_LIVE_WEBSOCKET_ENABLED === "false") return;
    let closed = false;
    let reconnectId: number | null = null;
    let socket: WebSocket | null = null;

    function connect() {
      if (closed || authBlockedRef.current) return;
      let stompBuffer = "";
      try {
        socket = new WebSocket(alertSocketUrl());
      } catch {
        reconnectId = window.setTimeout(connect, 5000);
        return;
      }

      socket.onopen = async () => {
        try {
          const ticket = await realtimeTicket();
          if (!closed && socket?.readyState === WebSocket.OPEN)
            socket.send(`CONNECT\naccept-version:1.2\nheart-beat:0,0\nauthorization:Bearer ${ticket}\n\n\0`);
        } catch { socket?.close(); }
      };
      socket.onmessage = (event) => {
        stompBuffer += String(event.data);
        if (stompBuffer.includes("CONNECTED")) {
          socket?.send(
            "SUBSCRIBE\nid:sub-user-alerts\ndestination:/topic/alerts\n\n\0",
          );
        }
        parseStompMessages(stompBuffer).forEach((alert) => {
          const id = alertId(alert);
          if (seenRef.current.has(id)) return;
          seenRef.current.add(id);
          setAlerts((current) =>
            [alert, ...current.filter((item) => alertId(item) !== id)].slice(
              0,
              200,
            ),
          );
          notifyAlert(alert);
        });
        if (stompBuffer.includes("\0")) stompBuffer = "";
      };
      socket.onclose = () => {
        if (!closed) reconnectId = window.setTimeout(connect, 5000);
      };
      socket.onerror = () => {
        socket?.close();
      };
    }

    connect();
    return () => {
      closed = true;
      if (reconnectId !== null) window.clearTimeout(reconnectId);
      socket?.close();
    };
  }, [notifyAlert]);

  const activeCount = useMemo(
    () => alerts.filter((alert) => !alert.acknowledged).length,
    [alerts],
  );

  return (
    <details
      ref={menuRef}
      className={`st-notifications${tracking ? " is-map" : ""}`}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          event.currentTarget.open = false;
          event.currentTarget.querySelector<HTMLElement>("summary")?.focus();
        }
      }}
    >
      <summary aria-label="Notifications" title="Notifications">
        <FiBell />
        {authenticated && activeCount > 0 && (
          <span className="st-notification-count">
            {activeCount > 99 ? "99+" : activeCount}
          </span>
        )}
      </summary>
      <section className="st-notification-feed" aria-label="Notifications">
        <header>
          <strong>Notifications</strong>
          <span>{activeCount} open</span>
        </header>
        {alerts.length ? (
          alerts.slice(0, 5).map((alert) => (
            <Link
              key={alertId(alert)}
              href="/app/alerts"
              onClick={() => {
                if (menuRef.current) menuRef.current.open = false;
              }}
            >
              <strong>
                {String(
                  alert.message ?? alert.alertType ?? "Fleet alert",
                ).replaceAll("_", " ")}
              </strong>
              <span>
                {String(alert.deviceName ?? alert.vehiclePlate ?? "")}
              </span>
            </Link>
          ))
        ) : (
          <p>No recent notifications.</p>
        )}
        <footer>
          <Link
            className="st-link"
            href="/app/alerts"
            onClick={() => {
              if (menuRef.current) menuRef.current.open = false;
            }}
          >
            View all alerts
          </Link>
        </footer>
      </section>
    </details>
  );
}

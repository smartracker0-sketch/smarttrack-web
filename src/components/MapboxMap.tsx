"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useCallback } from "react";
import { objectIconSvg } from "@/lib/objectIcons";

export type MarkerData = {
  id: string;
  lat: number;
  lng: number;
  color: string;
  pulsing: boolean;
  popupHtml: string;
  heading?: number;
  ignition?: boolean;
  moving?: boolean;
  motionLabel?: string;
  objectIcon?: string;
  label?: string;
};

interface Props {
  markers: MarkerData[];
  flyToId?: string | null;
  followId?: string | null;
  center?: [number, number];
  zoom?: number;
  style?: string;
  className?: string;
  onMarkerClick?: (id: string) => void;
}

const DEFAULT_CENTER: [number, number] = [3.3792, 6.5244];
const DEFAULT_ZOOM = 12;
const DEFAULT_STYLE = "mapbox://styles/mapbox/outdoors-v12";

export default function MapboxMap({
  markers,
  flyToId,
  followId,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  style = DEFAULT_STYLE,
  className = "w-full h-full",
  onMarkerClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupsRef = useRef<Map<string, mapboxgl.Popup>>(new Map());
  const animationRef = useRef<Map<string, number>>(new Map());
  const initializedRef = useRef(false);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  const buildMarkerEl = useCallback((color: string, pulsing: boolean, heading = 0, label = "", ignition = false, moving = false, motionLabel?: string, objectIcon?: string) => {
    const badgeLabel = motionLabel ?? (moving ? "MOVING" : ignition ? "ON" : "OFF");
    const assetSvg = objectIconSvg(objectIcon, color);
    const el = document.createElement("div");
    el.style.cssText = `
      width: 0; height: 0; cursor: pointer; position: relative;
      pointer-events: auto; overflow: visible; transform: translateZ(0);
    `;

    el.innerHTML = `
      ${pulsing ? `
        <span style="
          position:absolute; left:-30px; top:-30px; width:60px; height:60px; border-radius:50%;
          background:${color}; opacity:0.2;
          animation: tp-pulse 1.4s ease-out infinite;
        "></span>
      ` : ""}
      <div style="
        position:absolute; left:0; top:-55px; transform:translateX(-50%); z-index:3; display:flex; gap:4px;
        align-items:center; padding:3px 6px; border-radius:999px; background:#fff;
        box-shadow:0 4px 12px rgba(15,23,42,.18); color:#061337;
        font:800 9px/1 Inter, system-ui, sans-serif;
      ">
        <span style="width:7px;height:7px;border-radius:50%;background:${ignition ? "#22C55E" : "#94A3B8"};"></span>
        <span>${badgeLabel}</span>
      </div>
      <div style="
        position:absolute; left:-37px; top:-37px; width:74px; height:74px; z-index:2;
        transform:rotate(${heading}deg); transform-origin:center center;
        filter:drop-shadow(0 5px 7px rgba(15,23,42,0.35));
      ">${assetSvg}</div>
      <span style="
        position:absolute; left:-4px; top:-4px; z-index:1; width:8px; height:8px;
        box-sizing:border-box;
        border-radius:999px; background:${color}; border:2px solid #fff;
        box-shadow:0 1px 4px rgba(15,23,42,.28);
      "></span>
      ${label ? `
        <div style="
          position:absolute; left:0; top:38px; transform:translateX(-50%);
          width:max-content; max-width:122px; padding:8px 10px; border-radius:10px;
          background:#fff; color:#061337; font:700 13px/1.15 Inter, system-ui, sans-serif;
          text-align:center; box-shadow:0 4px 12px rgba(15,23,42,.18);
          white-space:normal; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
        ">${label}</div>
      ` : ""}
    `;
    return el;
  }, []);

  const animateMarkerTo = useCallback((id: string, marker: mapboxgl.Marker, lng: number, lat: number) => {
    const current = marker.getLngLat();
    const startLng = current.lng;
    const startLat = current.lat;
    const deltaLng = lng - startLng;
    const deltaLat = lat - startLat;

    window.cancelAnimationFrame(animationRef.current.get(id) ?? 0);

    if (Math.abs(deltaLng) < 0.000001 && Math.abs(deltaLat) < 0.000001) {
      marker.setLngLat([lng, lat]);
      return;
    }

    const startedAt = performance.now();
    const duration = 4200;
    const step = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      marker.setLngLat([startLng + deltaLng * eased, startLat + deltaLat * eased]);
      if (progress < 1) {
        animationRef.current.set(id, window.requestAnimationFrame(step));
      } else {
        marker.setLngLat([lng, lat]);
        animationRef.current.delete(id);
      }
    };
    animationRef.current.set(id, window.requestAnimationFrame(step));
  }, []);

  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const container = containerRef.current;
    const markerStore = markersRef.current;
    const popupStore = popupsRef.current;
    const animationStore = animationRef.current;
    let resizeObserver: ResizeObserver | null = null;
    let disposed = false;
    if (!token) {
      console.error("[MapboxMap] NEXT_PUBLIC_MAPBOX_TOKEN is not set");
      return;
    }

    import("mapbox-gl").then((mbgl) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapboxgl = (mbgl.default ?? mbgl) as any;
      mapboxgl.accessToken = token;

      if (disposed) return;

      container.innerHTML = "";
      const map = new mapboxgl.Map({
        container,
        style,
        center,
        zoom,
        attributionControl: false,
        logoPosition: "bottom-left",
      });

      map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "bottom-right");
      map.addControl(new mapboxgl.FullscreenControl(), "bottom-right");

      mapRef.current = map;
      initializedRef.current = true;
      resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(container);

      map.on("load", () => {
        markers.forEach((m) => addMarker(m, mapboxgl, map as mapboxgl.Map));
      });
    });

    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markerStore.clear();
      popupStore.clear();
      initializedRef.current = false;
      animationStore.forEach((id) => window.cancelAnimationFrame(id));
      animationStore.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function addMarker(m: MarkerData, mgl: any, map: mapboxgl.Map) {
    const el = buildMarkerEl(m.color, m.pulsing, m.heading ?? 0, m.label, m.ignition, m.moving, m.motionLabel, m.objectIcon);

    const popup = new mgl.Popup({ offset: 58, maxWidth: "460px", closeButton: true, className: "tp-vehicle-popup" })
      .setHTML(m.popupHtml);
    popupsRef.current.set(m.id, popup);

    const marker = new mgl.Marker({ element: el, anchor: "center", offset: [0, 0] })
      .setLngLat([m.lng, m.lat])
      .setPopup(popup)
      .addTo(map);

    el.addEventListener("click", () => onMarkerClickRef.current?.(m.id));
    markersRef.current.set(m.id, marker);
  }

  useEffect(() => {
    if (!mapRef.current || !initializedRef.current) return;
    import("mapbox-gl").then((mbgl) => {
      const mapboxgl = mbgl.default ?? mbgl;
      const map = mapRef.current!;
      const existing = new Set(markersRef.current.keys());

      markers.forEach((m) => {
        const marker = markersRef.current.get(m.id);
        if (marker) {
          animateMarkerTo(m.id, marker, m.lng, m.lat);
          const el = marker.getElement();
          el.innerHTML = buildMarkerEl(m.color, m.pulsing, m.heading ?? 0, m.label, m.ignition, m.moving, m.motionLabel, m.objectIcon).innerHTML;
          const popup = popupsRef.current.get(m.id);
          popup?.setHTML(m.popupHtml);
          existing.delete(m.id);
        } else {
          addMarker(m, mapboxgl, map);
        }
      });

      existing.forEach((id) => {
        markersRef.current.get(id)?.remove();
        markersRef.current.delete(id);
        popupsRef.current.delete(id);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  useEffect(() => {
    if (!flyToId || !mapRef.current) return;
    const marker = markersRef.current.get(flyToId);
    if (!marker) return;
    const lngLat = marker.getLngLat();
    mapRef.current.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 16, duration: 1200, essential: true });
    marker.getPopup()?.addTo(mapRef.current);
  }, [flyToId, markers]);

  useEffect(() => {
    if (!followId || !mapRef.current) return;
    const marker = markersRef.current.get(followId);
    if (!marker) return;
    const lngLat = marker.getLngLat();
    mapRef.current.easeTo({ center: [lngLat.lng, lngLat.lat], duration: 1000, essential: true });
  }, [followId, markers]);

  useEffect(() => {
    if (!mapRef.current || !style) return;
    mapRef.current.setStyle(style);
  }, [style]);

  return (
    <>
      <style>{`
        @keyframes tp-pulse {
          0%   { transform: scale(0.8); opacity: 0.4; }
          70%  { transform: scale(1.8); opacity: 0;   }
          100% { transform: scale(0.8); opacity: 0;   }
        }
        .tp-vehicle-popup .mapboxgl-popup-content {
          background: #ffffff;
          color: #061337;
          border-radius: 6px;
          padding: 0;
          border: 0;
          box-shadow: 0 18px 42px rgba(15,23,42,0.2);
        }
        .tp-vehicle-popup .mapboxgl-popup-tip { border-top-color: #ffffff; }
        .tp-vehicle-popup .mapboxgl-popup-close-button {
          width: 28px; height: 28px; border-radius: 999px;
          background: #58708f; color: #fff; font-size: 19px;
          line-height: 24px; top: 15px; right: 15px;
          font-weight: 800;
        }
        .tp-popup-inner {
          min-width: 360px;
          max-width: 420px;
          padding: 26px 28px 21px;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .tp-popup-title {
          padding-right: 42px;
          color: #061337;
          font-size: 18px;
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: 0;
        }
        .tp-popup-title span {
          margin-left: 7px;
          font-size: 22px;
          font-weight: 900;
        }
        .tp-popup-status {
          margin-top: 20px;
          color: #536987;
          font-size: 14px;
          line-height: 1.3;
          font-weight: 700;
        }
        .tp-popup-status strong {
          color: #1a9b89;
        }
        .tp-popup-muted,
        .tp-popup-row {
          margin-top: 12px;
          color: #536987;
          font-size: 13px;
          line-height: 1.25;
          font-weight: 500;
        }
        .tp-popup-row strong {
          color: #536987;
          font-weight: 800;
        }
        .tp-popup-location {
          margin-top: 23px;
          color: #061337;
          font-size: 13px;
          line-height: 1.35;
          font-weight: 800;
          white-space: normal;
        }
        .tp-popup-coords {
          margin-top: 14px;
          color: #061337;
          font-size: 13px;
          line-height: 1.25;
          font-weight: 600;
        }
        .tp-popup-coords span {
          margin-left: 9px;
          color: #061337;
        }
        .tp-popup-actions {
          margin-top: 21px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 19px;
          color: #536987;
          font-size: 18px;
          line-height: 1;
        }
      `}</style>
      <div ref={containerRef} className={className} />
    </>
  );
}

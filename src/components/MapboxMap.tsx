"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useCallback } from "react";

export type MarkerData = {
  id: string;
  lat: number;
  lng: number;
  color: string;
  pulsing: boolean;
  popupHtml: string;
  heading?: number;
};

interface Props {
  markers: MarkerData[];
  flyToId?: string | null;
  center?: [number, number];
  zoom?: number;
  style?: string;
  className?: string;
  onMarkerClick?: (id: string) => void;
}

const DEFAULT_CENTER: [number, number] = [6.5244, 3.3792];
const DEFAULT_ZOOM = 12;
const DEFAULT_STYLE = "mapbox://styles/mapbox/dark-v11";

export default function MapboxMap({
  markers,
  flyToId,
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
  const initializedRef = useRef(false);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  const buildMarkerEl = useCallback((color: string, pulsing: boolean, heading = 0) => {
    const el = document.createElement("div");
    el.style.cssText = `
      width: 32px; height: 32px; cursor: pointer; position: relative;
      display: flex; align-items: center; justify-content: center;
    `;
    el.innerHTML = `
      ${pulsing ? `
        <span style="
          position:absolute; inset:0; border-radius:50%;
          background:${color}; opacity:0.25;
          animation: tp-pulse 1.4s ease-out infinite;
        "></span>
      ` : ""}
      <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"
        style="transform:rotate(${heading}deg)">
        <circle cx="16" cy="16" r="10" fill="${color}" stroke="white" stroke-width="2.5"/>
        <path d="M10 16 L15 12 L22 16 L15 20 Z" fill="white" opacity="0.9"/>
      </svg>
    `;
    return el;
  }, []);

  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      console.error("[MapboxMap] NEXT_PUBLIC_MAPBOX_TOKEN is not set");
      return;
    }

    import("mapbox-gl").then((mbgl) => {
      const mapboxgl = mbgl.default ?? mbgl;
      mapboxgl.accessToken = token;

      containerRef.current!.innerHTML = "";
      const map = new mapboxgl.Map({
        container: containerRef.current!,
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

      map.on("load", () => {
        markers.forEach((m) => addMarker(m, mapboxgl, map));
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current.clear();
      popupsRef.current.clear();
      initializedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addMarker(m: MarkerData, mapboxgl: typeof import("mapbox-gl"), map: mapboxgl.Map) {
    const el = buildMarkerEl(m.color, m.pulsing, m.heading ?? 0);

    const popup = new mapboxgl.Popup({ offset: 20, maxWidth: "300px", closeButton: true })
      .setHTML(m.popupHtml);
    popupsRef.current.set(m.id, popup);

    const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
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
          marker.setLngLat([m.lng, m.lat]);
          const el = marker.getElement();
          el.innerHTML = buildMarkerEl(m.color, m.pulsing, m.heading ?? 0).innerHTML;
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
    mapRef.current.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 15, duration: 1200, essential: true });
    marker.getPopup()?.addTo(mapRef.current);
  }, [flyToId]);

  return (
    <>
      <style>{`
        @keyframes tp-pulse {
          0%   { transform: scale(0.8); opacity: 0.4; }
          70%  { transform: scale(1.8); opacity: 0;   }
          100% { transform: scale(0.8); opacity: 0;   }
        }
        .mapboxgl-popup-content {
          background: #0f1923;
          color: #e5e7eb;
          border-radius: 12px;
          padding: 14px 16px;
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .mapboxgl-popup-tip { border-top-color: #0f1923; }
        .mapboxgl-popup-close-button { color: #9ca3af; font-size: 18px; top: 6px; right: 8px; }
      `}</style>
      <div ref={containerRef} className={className} />
    </>
  );
}

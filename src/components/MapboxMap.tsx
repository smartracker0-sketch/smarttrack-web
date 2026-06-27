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
      width: 40px; height: 40px; cursor: pointer; position: relative;
      display: flex; align-items: center; justify-content: center;
    `;
    el.innerHTML = `
      ${pulsing ? `
        <span style="
          position:absolute; inset:0; border-radius:50%;
          background:${color}; opacity:0.22;
          animation: tp-pulse 1.4s ease-out infinite;
        "></span>
      ` : ""}
      <div style="
        width:36px; height:36px; border-radius:50%;
        background:white; box-shadow:0 2px 8px rgba(0,0,0,0.35);
        display:flex; align-items:center; justify-content:center;
        transform:rotate(${heading}deg);
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="7" y="4" width="10" height="16" rx="3" fill="${color}"/>
          <rect x="8.5" y="5.5" width="7" height="5" rx="1.5" fill="white" opacity="0.7"/>
          <rect x="7" y="15" width="3.5" height="3" rx="1" fill="white" opacity="0.5"/>
          <rect x="13.5" y="15" width="3.5" height="3" rx="1" fill="white" opacity="0.5"/>
          <rect x="5.5" y="8" width="2" height="5" rx="1" fill="${color}" stroke="white" stroke-width="0.5"/>
          <rect x="16.5" y="8" width="2" height="5" rx="1" fill="${color}" stroke="white" stroke-width="0.5"/>
          <circle cx="9.5" cy="18.5" r="1.5" fill="#1e293b"/>
          <circle cx="14.5" cy="18.5" r="1.5" fill="#1e293b"/>
        </svg>
      </div>
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapboxgl = (mbgl.default ?? mbgl) as any;
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
        markers.forEach((m) => addMarker(m, mapboxgl, map as mapboxgl.Map));
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function addMarker(m: MarkerData, mgl: any, map: mapboxgl.Map) {
    const el = buildMarkerEl(m.color, m.pulsing, m.heading ?? 0);

    const popup = new mgl.Popup({ offset: 20, maxWidth: "300px", closeButton: true })
      .setHTML(m.popupHtml);
    popupsRef.current.set(m.id, popup);

    const marker = new mgl.Marker({ element: el, anchor: "center" })
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

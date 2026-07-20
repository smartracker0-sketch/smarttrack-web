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
  followId?: string | null;
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
  const initializedRef = useRef(false);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  const buildMarkerEl = useCallback((color: string, pulsing: boolean, heading = 0) => {
    const el = document.createElement("div");
    el.style.cssText = `
      width: 64px; height: 64px; cursor: pointer; position: relative;
      display: flex; align-items: center; justify-content: center;
    `;

    el.innerHTML = `
      ${pulsing ? `
        <span style="
          position:absolute; inset:4px; border-radius:50%;
          background:${color}; opacity:0.2;
          animation: tp-pulse 1.4s ease-out infinite;
        "></span>
      ` : ""}
      <div style="width:56px;height:56px;transform:rotate(${heading}deg);transform-origin:28px 53.5px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.45));">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="body${color.replace('#','')}" cx="50%" cy="35%" r="60%">
              <stop offset="0%" stop-color="rgba(255,255,255,0.55)" stop-opacity="0.7"/>
              <stop offset="100%" stop-color="rgba(0,0,0,0.35)" stop-opacity="0.5"/>
            </radialGradient>
            <linearGradient id="roof${color.replace('#','')}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="white" stop-opacity="0.45"/>
              <stop offset="100%" stop-color="black" stop-opacity="0.2"/>
            </linearGradient>
            <linearGradient id="glass${color.replace('#','')}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="white" stop-opacity="0.85"/>
              <stop offset="100%" stop-color="#a0d8ef" stop-opacity="0.55"/>
            </linearGradient>
            <filter id="shadow${color.replace('#','')}">
              <feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="rgba(0,0,0,0.4)"/>
            </filter>
          </defs>

          <!-- Ground shadow ellipse -->
          <ellipse cx="28" cy="50" rx="14" ry="3.5" fill="rgba(0,0,0,0.25)"/>

          <!-- Car body base -->
          <rect x="12" y="22" width="32" height="20" rx="4" fill="${color}"/>
          <!-- Body shading overlay -->
          <rect x="12" y="22" width="32" height="20" rx="4" fill="url(#body${color.replace('#','')})"/>

          <!-- Left side panel (3D depth) -->
          <path d="M12 24 Q10 28 10 32 Q10 38 12 42 L12 22 Z" fill="${color}" opacity="0.7"/>
          <path d="M12 24 Q10 28 10 32 Q10 38 12 42 L12 22 Z" fill="rgba(0,0,0,0.25)"/>

          <!-- Right side panel (3D depth highlight) -->
          <path d="M44 24 Q46 28 46 32 Q46 38 44 42 L44 22 Z" fill="${color}" opacity="0.8"/>
          <path d="M44 24 Q46 28 46 32 Q46 38 44 42 L44 22 Z" fill="rgba(255,255,255,0.12)"/>

          <!-- Car roof/cabin -->
          <path d="M18 22 Q20 12 28 11 Q36 12 38 22 Z" fill="${color}"/>
          <path d="M18 22 Q20 12 28 11 Q36 12 38 22 Z" fill="url(#roof${color.replace('#','')})"/>

          <!-- Windscreen (front glass) -->
          <path d="M20 22 Q21.5 14.5 28 13.5 Q34.5 14.5 36 22 Z" fill="url(#glass${color.replace('#','')})"/>
          <!-- Glass glare -->
          <path d="M22 21 Q23 16 27 15" stroke="white" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>

          <!-- Rear window -->
          <rect x="20" y="31" width="16" height="6" rx="1.5" fill="url(#glass${color.replace('#','')})"/>
          <line x1="22" y1="32" x2="22" y2="36" stroke="white" stroke-width="0.8" opacity="0.5"/>
          <line x1="26" y1="32" x2="26" y2="36" stroke="white" stroke-width="0.8" opacity="0.5"/>
          <line x1="30" y1="32" x2="30" y2="36" stroke="white" stroke-width="0.8" opacity="0.5"/>
          <line x1="34" y1="32" x2="34" y2="36" stroke="white" stroke-width="0.8" opacity="0.5"/>

          <!-- Front headlights -->
          <rect x="14" y="23" width="5" height="3" rx="1" fill="#fffde7" opacity="0.95"/>
          <rect x="37" y="23" width="5" height="3" rx="1" fill="#fffde7" opacity="0.95"/>
          <!-- Headlight glow -->
          <rect x="14" y="23" width="5" height="3" rx="1" fill="white" opacity="0.5"/>

          <!-- Rear tail lights -->
          <rect x="14" y="38" width="5" height="3" rx="1" fill="#ef4444" opacity="0.95"/>
          <rect x="37" y="38" width="5" height="3" rx="1" fill="#ef4444" opacity="0.95"/>

          <!-- Wheels -->
          <circle cx="18" cy="43" r="4.5" fill="#1e293b"/>
          <circle cx="18" cy="43" r="2.5" fill="#475569"/>
          <circle cx="18" cy="43" r="1" fill="#94a3b8"/>

          <circle cx="38" cy="43" r="4.5" fill="#1e293b"/>
          <circle cx="38" cy="43" r="2.5" fill="#475569"/>
          <circle cx="38" cy="43" r="1" fill="#94a3b8"/>

          <!-- Door line -->
          <line x1="28" y1="22" x2="28" y2="42" stroke="rgba(0,0,0,0.2)" stroke-width="0.8"/>
          <!-- Door handle left -->
          <rect x="20" y="30" width="4" height="1.5" rx="0.75" fill="rgba(255,255,255,0.5)"/>
          <!-- Door handle right -->
          <rect x="32" y="30" width="4" height="1.5" rx="0.75" fill="rgba(255,255,255,0.5)"/>

          <!-- Top highlight shine -->
          <ellipse cx="28" cy="16" rx="5" ry="2" fill="white" opacity="0.25"/>
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

    const marker = new mgl.Marker({ element: el, anchor: "bottom", offset: [0, 6.5] })
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

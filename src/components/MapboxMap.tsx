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

  const buildMarkerEl = useCallback((color: string, pulsing: boolean, heading = 0, label = "") => {
    const el = document.createElement("div");
    el.style.cssText = `
      width: 138px; height: 112px; cursor: pointer; position: relative;
      display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
      pointer-events: auto;
    `;

    el.innerHTML = `
      ${pulsing ? `
        <span style="
          position:absolute; top:14px; left:39px; width:60px; height:60px; border-radius:50%;
          background:${color}; opacity:0.2;
          animation: tp-pulse 1.4s ease-out infinite;
        "></span>
      ` : ""}
      <div style="width:74px;height:74px;transform:rotate(${heading}deg);transform-origin:37px 59px;filter:drop-shadow(0 5px 7px rgba(15,23,42,0.35));">
        <svg width="74" height="74" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="assetBody${color.replace('#','')}" x1="16" y1="11" x2="58" y2="63" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#ff7f7a"/>
              <stop offset="1" stop-color="${color}"/>
            </linearGradient>
          </defs>
          <ellipse cx="37" cy="63" rx="18" ry="5" fill="#0f172a" opacity=".22"/>
          <path d="M22 17C27 10 47 10 52 17C56 22 57 43 52 52C48 59 26 59 22 52C17 43 18 22 22 17Z" fill="url(#assetBody${color.replace('#','')})"/>
          <path d="M25 20C30 15 44 15 49 20L47 31H27L25 20Z" fill="#ef6b66"/>
          <path d="M27 31H47L45 44H29L27 31Z" fill="#f47671"/>
          <path d="M30 19C34 17 40 17 44 19L43 29H31L30 19Z" fill="#1f2937" opacity=".9"/>
          <path d="M29 45H45L43 53C40 55 34 55 31 53L29 45Z" fill="#1f2937" opacity=".86"/>
          <path d="M20 26L14 30L15 40L20 43" stroke="#1f2937" stroke-width="5" stroke-linecap="round"/>
          <path d="M54 26L60 30L59 40L54 43" stroke="#1f2937" stroke-width="5" stroke-linecap="round"/>
          <path d="M24 18C22 26 22 43 24 51" stroke="#b94a49" stroke-width="2" opacity=".45"/>
          <path d="M50 18C52 26 52 43 50 51" stroke="#b94a49" stroke-width="2" opacity=".45"/>
          <path d="M29 22L34 19" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity=".45"/>
        </svg>
      </div>
      ${label ? `
        <div style="
          max-width:122px; margin-top:-1px; padding:8px 10px; border-radius:10px;
          background:#fff; color:#061337; font:700 13px/1.15 Inter, system-ui, sans-serif;
          text-align:center; box-shadow:0 4px 12px rgba(15,23,42,.18);
          white-space:normal; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
        ">${label}</div>
      ` : ""}
    `;
    return el;
  }, []);

  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    const container = containerRef.current;
    const markerStore = markersRef.current;
    const popupStore = popupsRef.current;
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function addMarker(m: MarkerData, mgl: any, map: mapboxgl.Map) {
    const el = buildMarkerEl(m.color, m.pulsing, m.heading ?? 0, m.label);

    const popup = new mgl.Popup({ offset: 28, maxWidth: "420px", closeButton: true, className: "tp-vehicle-popup" })
      .setHTML(m.popupHtml);
    popupsRef.current.set(m.id, popup);

    const marker = new mgl.Marker({ element: el, anchor: "bottom", offset: [0, 8] })
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
          el.innerHTML = buildMarkerEl(m.color, m.pulsing, m.heading ?? 0, m.label).innerHTML;
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
          border-radius: 10px;
          padding: 0;
          border: 0;
          box-shadow: 0 14px 35px rgba(15,23,42,0.18);
        }
        .tp-vehicle-popup .mapboxgl-popup-tip { border-top-color: #ffffff; }
        .tp-vehicle-popup .mapboxgl-popup-close-button {
          width: 27px; height: 27px; border-radius: 999px;
          background: #58708f; color: #fff; font-size: 20px;
          line-height: 23px; top: 14px; right: 14px;
        }
        .tp-popup-inner {
          min-width: 270px;
          max-width: 300px;
          padding: 23px 25px 18px;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .tp-popup-title {
          padding-right: 34px;
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
          margin-top: 16px;
          color: #536987;
          font-size: 14px;
          line-height: 1.3;
          font-weight: 700;
        }
        .tp-popup-status strong {
          color: #ef334a;
        }
        .tp-popup-muted,
        .tp-popup-row {
          margin-top: 11px;
          color: #536987;
          font-size: 13.5px;
          line-height: 1.25;
          font-weight: 500;
        }
        .tp-popup-row strong {
          color: #536987;
          font-weight: 800;
        }
        .tp-popup-location {
          margin-top: 21px;
          color: #061337;
          font-size: 13.5px;
          line-height: 1.35;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .tp-popup-coords {
          margin-top: 13px;
          color: #061337;
          font-size: 13.5px;
          line-height: 1.25;
          font-weight: 600;
        }
        .tp-popup-coords span {
          margin-left: 9px;
          color: #061337;
        }
        .tp-popup-actions {
          margin-top: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          color: #536987;
          font-size: 18px;
          line-height: 1;
        }
      `}</style>
      <div ref={containerRef} className={className} />
    </>
  );
}

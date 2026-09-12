"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";

type Coordinate = [number, number];

type Props = {
  path: Coordinate[];
  cursorIndex?: number | null;
  cursorHeading?: number;
  cursorSpeedKph?: number;
  playbackActive?: boolean;
  playbackMode?: boolean;
  transitionMs?: number;
  drawing?: boolean;
  onMapClick?: (coordinate: Coordinate) => void;
  className?: string;
};

const SOURCE_ID = "tp-route";
const PROGRESS_SOURCE_ID = "tp-route-progress";
const LINE_LAYER_ID = "tp-route-line";
const TRAIL_LAYER_ID = "tp-route-trail";
const POINT_LAYER_ID = "tp-route-points";

export default function RouteCanvas({ path, cursorIndex = null, cursorHeading = 0, cursorSpeedKph = 0, playbackActive = false, playbackMode = false, transitionMs = 500, drawing = false, onMapClick, className = "h-full w-full" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const cursorMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const pathRef = useRef(path);
  const clickRef = useRef(onMapClick);
  const fittedKeyRef = useRef("");
  const markerAnimationRef = useRef<number | null>(null);
  const markerHeadingRef = useRef(0);
  pathRef.current = path;
  clickRef.current = onMapClick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;
    let disposed = false;

    import("mapbox-gl").then((module) => {
      if (disposed || !containerRef.current) return;
      const mapboxgl = module.default ?? module;
      mapboxgl.accessToken = token;
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        center: [3.3792, 6.5244],
        zoom: 11,
        attributionControl: false,
      });
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "bottom-right");
      map.addControl(new mapboxgl.FullscreenControl(), "bottom-right");
      map.on("click", (event) => clickRef.current?.([event.lngLat.lng, event.lngLat.lat]));
      map.on("load", () => {
        map.addSource(SOURCE_ID, { type: "geojson", data: feature(pathRef.current) });
        map.addSource(PROGRESS_SOURCE_ID, { type: "geojson", data: feature(pathRef.current) });
        map.addLayer({ id: LINE_LAYER_ID, type: "line", source: SOURCE_ID, paint: { "line-color": playbackMode ? "#ffffff" : "#cbd5e1", "line-width": playbackMode ? 9 : 7, "line-opacity": 0.92 } });
        map.addLayer({ id: TRAIL_LAYER_ID, type: "line", source: PROGRESS_SOURCE_ID, paint: { "line-color": playbackMode ? "#f24464" : "#0D8A80", "line-width": playbackMode ? 5 : 4, "line-opacity": 0.95 } });
        map.addLayer({ id: POINT_LAYER_ID, type: "circle", source: SOURCE_ID, paint: { "circle-radius": 4, "circle-color": "#ffffff", "circle-stroke-color": "#0D8A80", "circle-stroke-width": 2 } });
      });
      mapRef.current = map;
    });

    return () => {
      disposed = true;
      if (markerAnimationRef.current) window.cancelAnimationFrame(markerAnimationRef.current);
      cursorMarkerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [playbackMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.getCanvas().style.cursor = drawing ? "crosshair" : "grab";
  }, [drawing]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const update = () => {
      const source = map.getSource(SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
      source?.setData(feature(path));
      const progressSource = map.getSource(PROGRESS_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
      progressSource?.setData(feature(cursorIndex == null ? path : path.slice(0, cursorIndex + 1)));
      const key = path.length ? `${path[0].join(",")}:${path[path.length - 1].join(",")}:${path.length}` : "";
      if (path.length > 1 && fittedKeyRef.current !== key) {
        const lngs = path.map(([lng]) => lng);
        const lats = path.map(([, lat]) => lat);
        map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 70, maxZoom: 16, duration: 700 });
        fittedKeyRef.current = key;
      }
    };
    if (map.isStyleLoaded()) update();
    else map.once("load", update);
  }, [cursorIndex, path]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || cursorIndex == null || !path[cursorIndex]) {
      cursorMarkerRef.current?.remove();
      cursorMarkerRef.current = null;
      return;
    }
    const coordinate = path[cursorIndex];
    import("mapbox-gl").then((module) => {
      if (!mapRef.current) return;
      const mapboxgl = module.default ?? module;
      if (!cursorMarkerRef.current) {
        const element = document.createElement("div");
        element.style.cssText = "width:58px;height:58px;display:grid;place-items:center;will-change:transform;filter:drop-shadow(0 8px 10px rgba(15,23,42,.32))";
        element.innerHTML = `<span data-playback-halo style="position:absolute;width:42px;height:42px;border-radius:999px;background:rgba(242,68,100,.20);transition:opacity .2s ease"></span><img data-playback-car src="/toyota-top-down-tracker-icon.svg" alt="Playback vehicle" style="position:relative;width:50px;height:50px;object-fit:contain;transform-origin:center;transition:transform .18s linear;will-change:transform" />`;
        cursorMarkerRef.current = new mapboxgl.Marker({ element, anchor: "center" }).setLngLat(coordinate).addTo(map);
      } else {
        if (markerAnimationRef.current) window.cancelAnimationFrame(markerAnimationRef.current);
        const marker = cursorMarkerRef.current;
        const start = marker.getLngLat();
        const startedAt = performance.now();
        const duration = Math.max(80, Number(transitionMs) || 500);
        const animate = (now: number) => {
          const progress = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          marker.setLngLat([
            start.lng + (coordinate[0] - start.lng) * eased,
            start.lat + (coordinate[1] - start.lat) * eased,
          ]);
          if (progress < 1) markerAnimationRef.current = window.requestAnimationFrame(animate);
          else markerAnimationRef.current = null;
        };
        markerAnimationRef.current = window.requestAnimationFrame(animate);
      }
      const markerElement = cursorMarkerRef.current.getElement();
      const car = markerElement.querySelector<HTMLElement>("[data-playback-car]");
      const halo = markerElement.querySelector<HTMLElement>("[data-playback-halo]");
      const heading = Number(cursorHeading || 0);
      let delta = ((heading - markerHeadingRef.current + 540) % 360) - 180;
      if (!Number.isFinite(delta)) delta = 0;
      markerHeadingRef.current += delta;
      if (car) car.style.transform = `rotate(${markerHeadingRef.current}deg) scale(${playbackActive ? 1.06 : 1})`;
      if (halo) {
        halo.style.opacity = playbackActive ? "1" : ".35";
        halo.style.animation = playbackActive && cursorSpeedKph > 2 ? "tp-playback-pulse 1.2s ease-out infinite" : "none";
      }
      map.easeTo({ center: coordinate, duration: Math.max(120, transitionMs), easing: (value) => 1 - Math.pow(1 - value, 3), essential: true });
    });
  }, [cursorHeading, cursorIndex, cursorSpeedKph, path, playbackActive, transitionMs]);

  return <><style>{`@keyframes tp-playback-pulse{0%{transform:scale(.8);opacity:.7}100%{transform:scale(1.7);opacity:0}}`}</style><div ref={containerRef} className={className} /></>;
}

function feature(path: Coordinate[]) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "LineString" as const, coordinates: path },
  };
}

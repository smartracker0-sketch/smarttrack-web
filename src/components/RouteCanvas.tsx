"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";

type Coordinate = [number, number];

type Props = {
  path: Coordinate[];
  cursorIndex?: number | null;
  drawing?: boolean;
  onMapClick?: (coordinate: Coordinate) => void;
  className?: string;
};

const SOURCE_ID = "tp-route";
const PROGRESS_SOURCE_ID = "tp-route-progress";
const LINE_LAYER_ID = "tp-route-line";
const TRAIL_LAYER_ID = "tp-route-trail";
const POINT_LAYER_ID = "tp-route-points";

export default function RouteCanvas({ path, cursorIndex = null, drawing = false, onMapClick, className = "h-full w-full" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const cursorMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const pathRef = useRef(path);
  const clickRef = useRef(onMapClick);
  const fittedKeyRef = useRef("");
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
        map.addLayer({ id: LINE_LAYER_ID, type: "line", source: SOURCE_ID, paint: { "line-color": "#cbd5e1", "line-width": 7, "line-opacity": 0.9 } });
        map.addLayer({ id: TRAIL_LAYER_ID, type: "line", source: PROGRESS_SOURCE_ID, paint: { "line-color": "#0D8A80", "line-width": 4 } });
        map.addLayer({ id: POINT_LAYER_ID, type: "circle", source: SOURCE_ID, paint: { "circle-radius": 4, "circle-color": "#ffffff", "circle-stroke-color": "#0D8A80", "circle-stroke-width": 2 } });
      });
      mapRef.current = map;
    });

    return () => {
      disposed = true;
      cursorMarkerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

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
        element.style.cssText = "width:22px;height:22px;border-radius:999px;background:#F24464;border:4px solid white;box-shadow:0 6px 18px rgba(15,23,42,.35)";
        cursorMarkerRef.current = new mapboxgl.Marker({ element, anchor: "center" }).setLngLat(coordinate).addTo(map);
      } else {
        cursorMarkerRef.current.setLngLat(coordinate);
      }
      map.easeTo({ center: coordinate, duration: 450, essential: true });
    });
  }, [cursorIndex, path]);

  return <div ref={containerRef} className={className} />;
}

function feature(path: Coordinate[]) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "LineString" as const, coordinates: path },
  };
}

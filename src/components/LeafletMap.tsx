"use client";
import "leaflet/dist/leaflet.css";
import "./LeafletMap.css";
import { useEffect, useRef, useState } from "react";
import type { Map as Leaflet, Marker, TileLayer, Polyline } from "leaflet";
import type { MapProps } from "./MapboxMap";
const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services/";
const EMPTY_ROUTE: [number, number][] = [];
export default function LeafletMap({
  markers,
  flyToId,
  followId,
  center = [3.3792, 6.5244],
  zoom = 12,
  style = "",
  className = "w-full h-full",
  onMarkerClick,
  route = EMPTY_ROUTE,
  routeProgress,
  fitRoute = true,
  onMapClick,
}: MapProps) {
  const container = useRef<HTMLDivElement>(null),
    map = useRef<Leaflet | null>(null),
    library = useRef<typeof import("leaflet") | null>(null),
    store = useRef(new Map<string, Marker>()),
    tiles = useRef<TileLayer[]>([]),
    initial = useRef({ center, zoom }),
    click = useRef(onMarkerClick),
    didFit = useRef(false),
    lastFly = useRef<string | null>(null);
  const routeLayer = useRef<Polyline | null>(null),
    progressLayer = useRef<Polyline | null>(null),
    routeKey = useRef(""),
    mapClick = useRef(onMapClick);
  const [ready, setReady] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    click.current = onMarkerClick;
    mapClick.current = onMapClick;
  }, [onMarkerClick, onMapClick]);
  useEffect(() => {
    let disposed = false;
    let observer: ResizeObserver | null = null;
    const entries = store.current;
    import("leaflet")
      .then((L) => {
        if (disposed || !container.current) return;
        library.current = L;
        const options = initial.current;
        map.current = L.map(container.current, { zoomControl: false }).setView(
          [options.center[1], options.center[0]],
          options.zoom,
        );
        L.control.zoom({ position: "bottomleft" }).addTo(map.current);
        map.current.on("click", (event) =>
          mapClick.current?.([event.latlng.lng, event.latlng.lat]),
        );
        observer = new ResizeObserver(() => map.current?.invalidateSize());
        observer.observe(container.current);
        setReady(true);
      })
      .catch(() => {
        if (!disposed)
          setError("The map could not be loaded. Please reload this page.");
      });
    return () => {
      disposed = true;
      observer?.disconnect();
      map.current?.remove();
      map.current = null;
      entries.clear();
    };
  }, []);
  useEffect(() => {
    if (!ready || !map.current || !library.current) return;
    const L = library.current;
    const apply = () => {
      const instance = map.current;
      if (!instance) return;
      tiles.current.forEach((layer) => instance.removeLayer(layer));
      const dark =
        container.current
          ?.closest(".st-workspace")
          ?.getAttribute("data-theme") === "dark";
      const satellite = /satellite/i.test(style),
        terrain = /outdoors|terrain/i.test(style);
      const services = satellite
        ? ["World_Imagery", "Reference/World_Boundaries_and_Places"]
        : dark
          ? ["Canvas/World_Dark_Gray_Base", "Canvas/World_Dark_Gray_Reference"]
          : terrain
            ? ["World_Topo_Map"]
            : ["World_Street_Map"];
      tiles.current = services.map((service, index) =>
        L.tileLayer(ESRI + service + "/MapServer/tile/{z}/{y}/{x}", {
          attribution: index ? "" : "Tiles © Esri",
          maxZoom: 19,
          maxNativeZoom: 18,
        }).addTo(instance),
      );
    };
    apply();
    const host = container.current?.closest(".st-workspace");
    const observer = new MutationObserver(apply);
    if (host)
      observer.observe(host, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    return () => observer.disconnect();
  }, [ready, style]);
  useEffect(() => {
    const instance = map.current,
      L = library.current;
    if (!ready || !instance || !L) return;
    const ids = new Set(markers.map((marker) => marker.id));
    store.current.forEach((marker, id) => {
      if (!ids.has(id)) {
        marker.remove();
        store.current.delete(id);
      }
    });
    markers.forEach((data) => {
      if (!Number.isFinite(data.lat) || !Number.isFinite(data.lng)) return;
      const icon = L.divIcon({
        className: "st-map-marker",
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        html: `<span style="background:${/^#[0-9a-f]{3,8}$/i.test(data.color) ? data.color : "#1d4ed8"};transform:rotate(${Number(data.heading) || 0}deg)">${data.moving ? "▲" : "●"}</span>`,
      });
      let marker = store.current.get(data.id);
      if (marker) {
        marker.setLatLng([data.lat, data.lng]);
        marker.setIcon(icon);
        marker.setPopupContent(data.popupHtml);
      } else {
        marker = L.marker([data.lat, data.lng], { icon })
          .addTo(instance)
          .bindPopup(data.popupHtml, {
            maxWidth: 280,
            minWidth: 264,
            className: "st-map-popup",
          });
        marker.on("click", () => click.current?.(data.id));
        marker.on("mouseover", () => marker?.openPopup());
        store.current.set(data.id, marker);
      }
    });
    if (!didFit.current && markers.length) {
      const positions = markers
        .filter(
          (point) => Number.isFinite(point.lat) && Number.isFinite(point.lng),
        )
        .map((point) => [point.lat, point.lng] as [number, number]);
      if (positions.length) {
        instance.fitBounds(L.latLngBounds(positions), {
          padding: [50, 50],
          maxZoom: 14,
        });
        didFit.current = true;
      }
    }
  }, [markers, ready]);
  useEffect(() => {
    if (!ready) return;
    const fit = () => {
      const points = Array.from(store.current.values()).map((marker) =>
        marker.getLatLng(),
      );
      if (points.length && library.current)
        map.current?.fitBounds(library.current.latLngBounds(points), {
          padding: [50, 50],
          maxZoom: 14,
        });
    };
    window.addEventListener("st-map:fit", fit);
    return () => window.removeEventListener("st-map:fit", fit);
  }, [ready]);
  useEffect(() => {
    const instance = map.current,
      L = library.current;
    if (!ready || !instance || !L) return;
    const points = route
      .filter((point) => point.every(Number.isFinite))
      .map(([lng, lat]) => [lat, lng] as [number, number]);
    if (!routeLayer.current)
      routeLayer.current = L.polyline([], {
        color: "#94a3b8",
        weight: 6,
      }).addTo(instance);
    if (!progressLayer.current)
      progressLayer.current = L.polyline([], {
        color: "#1d4ed8",
        weight: 4,
      }).addTo(instance);
    routeLayer.current.setLatLngs(points);
    progressLayer.current.setLatLngs(
      points.slice(0, (routeProgress ?? points.length - 1) + 1),
    );
    const key = JSON.stringify([points.length, points[0], points.at(-1)]);
    if (fitRoute && points.length && key !== routeKey.current) {
      instance.fitBounds(L.latLngBounds(points), {
        padding: [50, 50],
        maxZoom: 16,
      });
      routeKey.current = key;
    }
  }, [ready, route, routeProgress, fitRoute]);
  useEffect(() => {
    const instance = map.current;
    if (!flyToId) {
      lastFly.current = null;
      return;
    }
    if (!ready || !instance || !flyToId || lastFly.current === flyToId) return;
    const marker = store.current.get(flyToId);
    if (marker) {
      lastFly.current = flyToId;
      instance.flyTo(marker.getLatLng(), 16, { duration: 0.7 });
      marker.openPopup();
    }
  }, [flyToId, markers, ready]);
  useEffect(() => {
    if (!ready || !followId || !map.current) return;
    const marker = store.current.get(followId);
    if (marker) map.current.panTo(marker.getLatLng());
  }, [followId, markers, ready]);
  return (
    <div
      className={"st-leaflet-map " + className}
      style={{ position: "relative" }}
    >
      <div ref={container} style={{ height: "100%", width: "100%" }} />
      {error && (
        <div className="st-map-load-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

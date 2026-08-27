"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { MapViewProps, LatLng, MapMarkerData } from "@/lib/maps/types";
import { cn } from "@/lib/utils";

// OpenFreeMap: free, key-less, no account/card required — https://openfreemap.org.
// We tried CARTO's "free" Positron tiles before; they started requiring an API key
// and the map rendered "API KEY REQUIRED" watermarks. Do not go back to CARTO or
// any other provider that can start gating behind a key.
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

// MapLibre spawns its tile-parsing worker via `new Worker(new URL(...), {type:
// "module"})`, which Next.js's bundler (webpack and Turbopack alike, as of
// Next 16 / maplibre-gl 6) resolves to an empty URL — the worker silently
// never parses any vector tiles (no error, no network request, just a
// permanently gray basemap). Pointing at the prebuilt worker bundle copied to
// `public/maplibre-gl-worker.mjs` (from `node_modules/maplibre-gl/dist/`)
// sidesteps the broken auto-resolution. Re-copy that file if maplibre-gl is
// ever upgraded.
maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

function pinHtml(selected: boolean, label?: string) {
  const color = "var(--app-accent, #a21cdb)";
  const pinHeight = 40;
  const labelHtml = label
    ? `<span style="
        position:absolute; left:50%; top:-6px; transform:translate(-50%,-100%);
        background:white; color:#18181b; font:600 11px/1.2 var(--font-grotesk, ui-sans-serif, sans-serif);
        padding:3px 8px; border-radius:9999px; white-space:nowrap;
        box-shadow:0 1px 2px rgba(0,0,0,0.08),0 4px 10px -2px rgba(0,0,0,0.15);
      ">${label}</span>`
    : "";
  return `<div style="position:relative; width:30px; height:${pinHeight}px; cursor:pointer;">
      ${labelHtml}
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="${color}" opacity="${selected ? 1 : 0.9}"/>
        <circle cx="15" cy="15" r="6" fill="white"/>
      </svg>
    </div>`;
}

function clusterHtml(count: number) {
  const size = count < 10 ? 36 : count < 50 ? 44 : 52;
  const fontSize = count < 100 ? 14 : 12;
  return `<div style="
      width:${size}px; height:${size}px; border-radius:9999px; cursor:pointer;
      background: var(--app-accent, #a21cdb); color:#fff; display:flex;
      align-items:center; justify-content:center; font:700 ${fontSize}px var(--font-grotesk, ui-sans-serif, sans-serif);
      box-shadow:0 2px 4px rgba(0,0,0,0.15), 0 8px 20px -6px rgba(0,0,0,0.3); border:3px solid white;
    ">${count}</div>`;
}

type ClusterPoint = { key: string; position: LatLng; count: number; marker?: MapMarkerData };

/** Grid-based clustering: cell size shrinks with zoom, so pins separate naturally as the user zooms in. */
function clusterMarkers(markers: MapMarkerData[], zoom: number): ClusterPoint[] {
  if (markers.length === 0) return [];
  if (zoom >= 15) {
    return markers.map((m) => ({ key: m.id, position: m.position, count: 1, marker: m }));
  }
  const cellSize = 20 / 2 ** zoom;
  const cells = new Map<string, MapMarkerData[]>();
  for (const m of markers) {
    const key = `${Math.floor(m.position.lat / cellSize)}:${Math.floor(m.position.lng / cellSize)}`;
    const arr = cells.get(key);
    if (arr) arr.push(m);
    else cells.set(key, [m]);
  }
  return Array.from(cells.entries()).map(([key, group]) => {
    if (group.length === 1) return { key, position: group[0].position, count: 1, marker: group[0] };
    const lat = group.reduce((s, m) => s + m.position.lat, 0) / group.length;
    const lng = group.reduce((s, m) => s + m.position.lng, 0) / group.length;
    return { key, position: { lat, lng }, count: group.length };
  });
}

export default function OsmMapView({
  center,
  zoom = 13,
  markers,
  selectedMarkerId,
  onMarkerClick,
  onBoundsChange,
  className,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRefs = useRef<maplibregl.Marker[]>([]);
  const [liveZoom, setLiveZoom] = useState(zoom);

  // Callbacks are re-created every render by callers — keep refs so the map
  // (created once) always invokes the latest without needing to be recreated.
  const onBoundsChangeRef = useRef(onBoundsChange);
  const onMarkerClickRef = useRef(onMarkerClick);
  useEffect(() => {
    onBoundsChangeRef.current = onBoundsChange;
  }, [onBoundsChange]);
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick;
  }, [onMarkerClick]);

  // center/zoom are only used as the initial viewport, matching the previous
  // Leaflet behavior — updating them later does not recenter an existing map.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [center.lng, center.lat],
      zoom,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.on("moveend", () => {
      const b = map.getBounds();
      const c = map.getCenter();
      onBoundsChangeRef.current?.(
        { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() },
        { lat: c.lat, lng: c.lng },
      );
    });
    map.on("zoomend", () => setLiveZoom(map.getZoom()));

    // The container can mount at 0x0 (e.g. behind a `hidden md:block` mobile
    // list/map toggle); MapLibre doesn't detect that resize on its own.
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clusters = useMemo(() => clusterMarkers(markers, liveZoom), [markers, liveZoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markerRefs.current.forEach((m) => m.remove());
    markerRefs.current = clusters.map((c) => {
      const el = document.createElement("div");
      el.innerHTML = c.count > 1 ? clusterHtml(c.count) : pinHtml(c.marker!.id === selectedMarkerId, c.marker!.label);
      const wrapper = el.firstElementChild as HTMLElement;
      wrapper.addEventListener("click", () => {
        if (c.count > 1) {
          map.easeTo({ center: [c.position.lng, c.position.lat], zoom: Math.min(liveZoom + 3, 18) });
        } else {
          onMarkerClickRef.current?.(c.marker!.id);
        }
      });
      return new maplibregl.Marker({ element: wrapper, anchor: c.count > 1 ? "center" : "bottom" })
        .setLngLat([c.position.lng, c.position.lat])
        .addTo(map);
    });
  }, [clusters, selectedMarkerId, liveZoom]);

  return <div ref={containerRef} className={cn("overflow-hidden rounded-2xl", className)} />;
}

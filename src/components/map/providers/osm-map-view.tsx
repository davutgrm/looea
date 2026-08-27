"use client";

import "leaflet/dist/leaflet.css";
import { useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { MapViewProps, LatLng, MapMarkerData } from "@/lib/maps/types";
import { cn } from "@/lib/utils";

function pinIcon(selected: boolean, label?: string) {
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
  return L.divIcon({
    className: "salonix-map-pin",
    html: `<div style="position:relative; width:30px; height:${pinHeight}px;">
      ${labelHtml}
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="${color}" opacity="${selected ? 1 : 0.9}"/>
        <circle cx="15" cy="15" r="6" fill="white"/>
      </svg>
    </div>`,
    iconSize: [30, pinHeight],
    iconAnchor: [15, pinHeight],
    popupAnchor: [0, -36],
  });
}

function clusterIcon(count: number) {
  const size = count < 10 ? 36 : count < 50 ? 44 : 52;
  const fontSize = count < 100 ? 14 : 12;
  return L.divIcon({
    className: "salonix-map-cluster",
    html: `<div style="
      width:${size}px; height:${size}px; border-radius:9999px;
      background: var(--app-accent, #a21cdb); color:#fff; display:flex;
      align-items:center; justify-content:center; font:700 ${fontSize}px var(--font-grotesk, ui-sans-serif, sans-serif);
      box-shadow:0 2px 4px rgba(0,0,0,0.15), 0 8px 20px -6px rgba(0,0,0,0.3); border:3px solid white;
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
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

function BoundsWatcher({ onBoundsChange, onZoom }: Pick<MapViewProps, "onBoundsChange"> & { onZoom: (z: number) => void }) {
  useMapEvents({
    moveend(e) {
      if (!onBoundsChange) return;
      const b = e.target.getBounds();
      const c = e.target.getCenter();
      onBoundsChange(
        { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() },
        { lat: c.lat, lng: c.lng },
      );
    },
    zoomend(e) {
      onZoom(e.target.getZoom());
    },
  });
  return null;
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
  const mapRef = useRef<L.Map | null>(null);
  const [liveZoom, setLiveZoom] = useState(zoom);

  const clusters = useMemo(() => clusterMarkers(markers, liveZoom), [markers, liveZoom]);

  const icons = useMemo(
    () =>
      clusters.map((c) =>
        c.count > 1 ? clusterIcon(c.count) : pinIcon(c.marker!.id === selectedMarkerId, c.marker!.label),
      ),
    [clusters, selectedMarkerId],
  );

  return (
    <div className={cn("overflow-hidden rounded-2xl", className)}>
      <MapContainer
        ref={mapRef}
        center={[center.lat, center.lng]}
        zoom={zoom}
        scrollWheelZoom
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <BoundsWatcher onBoundsChange={onBoundsChange} onZoom={setLiveZoom} />
        {clusters.map((c, i) => (
          <Marker
            key={c.key}
            position={[c.position.lat, c.position.lng]}
            icon={icons[i]}
            eventHandlers={{
              click: () => {
                if (c.count > 1) {
                  mapRef.current?.setView([c.position.lat, c.position.lng], Math.min(liveZoom + 3, 18));
                } else {
                  onMarkerClick?.(c.marker!.id);
                }
              },
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

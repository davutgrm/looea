"use client";

import "leaflet/dist/leaflet.css";
import { useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { MapViewProps } from "@/lib/maps/types";
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

function BoundsWatcher({ onBoundsChange }: Pick<MapViewProps, "onBoundsChange">) {
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
  const icons = useMemo(
    () => markers.map((m) => pinIcon(m.id === selectedMarkerId, m.label)),
    [markers, selectedMarkerId],
  );
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={cn("overflow-hidden rounded-2xl", className)}>
      <MapContainer
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
        <BoundsWatcher onBoundsChange={onBoundsChange} />
        {markers.map((m, i) => (
          <Marker
            key={m.id}
            position={[m.position.lat, m.position.lng]}
            icon={icons[i]}
            eventHandlers={{
              click: () => onMarkerClick?.(m.id),
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}

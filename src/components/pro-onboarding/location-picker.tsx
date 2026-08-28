"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import type { LatLng } from "@/lib/maps/types";
import { cn } from "@/lib/utils";

// Aynı key-less vektör stili + worker düzeltmesi (bkz. osm-map-view.tsx yorumları).
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

const ACCENT = "#a21cdb";

/** Adres için sürüklenebilir tek pin'li harita. Pin bırakıldığında ya da haritaya
 * tıklandığında onChange ile lat/lng döner. */
export function LocationPicker({
  value,
  center,
  onChange,
  className,
}: {
  value: LatLng | null;
  center: LatLng;
  onChange: (latlng: LatLng) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const start = value ?? center;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [start.lng, start.lat],
      zoom: 13,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    const marker = new maplibregl.Marker({ color: ACCENT, draggable: true })
      .setLngLat([start.lng, start.lat])
      .addTo(map);
    markerRef.current = marker;

    // Başlangıç konumunu (şehir merkezi ya da mevcut değer) hemen bildir ki adım
    // geçerli olsun; kullanıcı pin'i sürükleyerek hassaslaştırır.
    onChangeRef.current({ lat: start.lat, lng: start.lng });

    marker.on("dragend", () => {
      const { lat, lng } = marker.getLngLat();
      onChangeRef.current({ lat, lng });
    });

    map.on("click", (e) => {
      marker.setLngLat(e.lngLat);
      onChangeRef.current({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Yalnızca ilk mount'ta kurulur (adım her açılışında yeniden mount olur).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className={cn("overflow-hidden rounded-2xl", className)} />;
}

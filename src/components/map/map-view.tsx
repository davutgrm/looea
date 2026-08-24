"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { activeMapProvider } from "@/lib/maps/provider";
import type { MapViewProps } from "@/lib/maps/types";

const OsmMapView = dynamic(() => import("./providers/osm-map-view"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

// Add a new file under providers/ implementing the same MapViewProps contract
// and register it here to swap the rendering engine (e.g. mapbox, google).
const providers: Record<string, ComponentType<MapViewProps>> = {
  osm: OsmMapView,
};

export function MapView(props: MapViewProps) {
  const Provider = providers[activeMapProvider] ?? OsmMapView;
  return <Provider {...props} />;
}

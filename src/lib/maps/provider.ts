import type { MapProviderName } from "./types";

export const activeMapProvider: MapProviderName =
  (process.env.NEXT_PUBLIC_MAP_PROVIDER as MapProviderName) || "osm";

export type LatLng = { lat: number; lng: number };

export type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type MapMarkerData = {
  id: string;
  position: LatLng;
  label?: string;
};

export type MapViewProps = {
  center: LatLng;
  zoom?: number;
  markers: MapMarkerData[];
  selectedMarkerId?: string | null;
  onMarkerClick?: (id: string) => void;
  onBoundsChange?: (bounds: MapBounds, center: LatLng) => void;
  className?: string;
  /**
   * Gömülü (kaydırılabilir sayfa içindeki) küçük konum haritaları için `true`.
   * MapLibre "cooperativeGestures" modunu açar: tek parmak sayfayı kaydırır,
   * haritayı hareket ettirmek için iki parmak gerekir — mobilde harita sayfa
   * kaydırmasını "yakalamaz". Tam ekran arama haritasında `false` bırak.
   */
  cooperativeGestures?: boolean;
};

export type MapProviderName = "osm" | "mapbox" | "google";

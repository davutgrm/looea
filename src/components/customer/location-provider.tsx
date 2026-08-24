"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { LatLng } from "@/lib/maps/types";

type LocationState = {
  coords: LatLng | null;
  label: string;
  loading: boolean;
  permissionDenied: boolean;
  setManualLocation: (label: string, coords: LatLng) => void;
  requestGeolocation: () => void;
};

export const DEFAULT_LOCATION = {
  label: "İstanbul, Kadıköy",
  coords: { lat: 40.9903, lng: 29.0275 } as LatLng,
};

const STORAGE_KEY = "salonix:location";

const LocationContext = createContext<LocationState | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [label, setLabel] = useState<string>(DEFAULT_LOCATION.label);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestGeolocation = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setCoords(DEFAULT_LOCATION.coords);
      setLoading(false);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setLabel("Konumunuz");
        setPermissionDenied(false);
        setLoading(false);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ coords: c, label: "Konumunuz" }));
      },
      () => {
        setPermissionDenied(true);
        setCoords(DEFAULT_LOCATION.coords);
        setLabel(DEFAULT_LOCATION.label);
        setLoading(false);
      },
      { timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { coords: LatLng; label: string };
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage, unavailable during SSR/render
        setCoords(parsed.coords);
        setLabel(parsed.label);
        setLoading(false);
        return;
      } catch {
        // fall through to geolocation request
      }
    }
    requestGeolocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setManualLocation = useCallback((newLabel: string, newCoords: LatLng) => {
    setCoords(newCoords);
    setLabel(newLabel);
    setPermissionDenied(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ coords: newCoords, label: newLabel }));
  }, []);

  return (
    <LocationContext.Provider
      value={{ coords, label, loading, permissionDenied, setManualLocation, requestGeolocation }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
}

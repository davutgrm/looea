"use client";

import { useCallback, useEffect, useState } from "react";

export type ClientSegment = "MALE" | "FEMALE";

const STORAGE_KEY = "kuafi-guest-segment";

export function getStoredGuestSegment(): ClientSegment | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "MALE" || value === "FEMALE" ? value : null;
}

function setStoredGuestSegment(segment: ClientSegment) {
  window.localStorage.setItem(STORAGE_KEY, segment);
}

/** Resolves the guest's segment preference from localStorage.
 * `resolved` is false only for the first client render (before localStorage can be read),
 * to avoid a hydration flash of the wrong content. */
export function useGuestSegment() {
  const [resolved, setResolved] = useState(false);
  const [segment, setSegment] = useState<ClientSegment | null>(null);

  useEffect(() => {
    setSegment(getStoredGuestSegment());
    setResolved(true);
  }, []);

  const select = useCallback((next: ClientSegment) => {
    setStoredGuestSegment(next);
    setSegment(next);
  }, []);

  return { resolved, segment, select };
}

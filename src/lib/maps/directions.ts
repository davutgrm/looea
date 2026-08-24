import type { LatLng } from "./types";

/** Universal deep link that opens native/web navigation regardless of which
 * provider renders the in-app map. Works on desktop and mobile. */
export function getDirectionsUrl(destination: LatLng): string {
  const params = new URLSearchParams({
    api: "1",
    destination: `${destination.lat},${destination.lng}`,
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
